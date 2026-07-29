/** Profile + onboarding state + dashboard counters (US-A3, NFR-U3). */
import { notFound } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { billStats } from '../../domain/sizing';
import { currentStage, progressPercent } from '../../domain/milestones';
import type { OnboardingInput, UpdateProfileInput } from './schema';

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      createdAt: true,
      profile: true,
    },
  });
  if (!user) throw notFound('Profile');

  // Older accounts (or seeded ones) may predate the profile row.
  if (!user.profile) {
    const profile = await prisma.profile.create({ data: { userId } });
    return { ...user, profile };
  }
  return user;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const { fullName, ...profileFields } = input;

  const [, profile] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: fullName ? { fullName } : {},
      select: { id: true },
    }),
    prisma.profile.upsert({
      where: { userId },
      create: { userId, ...profileFields },
      update: profileFields,
    }),
  ]);

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, email: true, fullName: true, role: true, createdAt: true },
  });

  return { ...user, profile };
}

export async function setOnboardingStep(userId: string, input: OnboardingInput) {
  return prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      onboardingStep: input.onboardingStep,
      onboardingCompletedAt: input.completed ? new Date() : null,
    },
    update: {
      onboardingStep: input.onboardingStep,
      ...(input.completed === undefined
        ? {}
        : { onboardingCompletedAt: input.completed ? new Date() : null }),
    },
  });
}

/** Powers the dashboard "where am I" panel and next-best-action list. */
export async function getSummary(userId: string) {
  const [profile, bills, roofCount, latestRun, quoteAgg, selectedQuote, projects, documentCount] =
    await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.electricityBillSummary.findMany({
        where: { userId },
        orderBy: { billMonth: 'desc' },
        take: 12,
        select: { billMonth: true, unitsKwh: true, tariffPerKwh: true, billAmount: true },
      }),
      prisma.roofProfile.count({ where: { userId } }),
      prisma.sizingRun.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { scenarios: { orderBy: { systemSizeKwp: 'asc' } } },
      }),
      prisma.quote.aggregate({
        where: { userId },
        _count: { _all: true },
        _avg: { pricePerKwp: true },
        _max: { valueScore: true },
      }),
      prisma.quote.findFirst({ where: { userId, isSelected: true } }),
      prisma.project.findMany({
        where: { userId },
        include: { milestones: { orderBy: { sequence: 'asc' } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.document.count({ where: { userId } }),
    ]);

  const stats = billStats(bills);
  const projectCards = projects.map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    installerName: p.installerName,
    systemSizeKwp: p.systemSizeKwp,
    progressPercent: progressPercent(p.milestones),
    currentStage: currentStage(p.milestones),
  }));

  const optimal =
    latestRun?.scenarios.find((s) => s.key === 'OPTIMAL') ?? latestRun?.scenarios.at(-1) ?? null;

  const nextActions: string[] = [];
  if (bills.length === 0) nextActions.push('Add a recent electricity bill so we can size your system.');
  else if (!stats.ready) nextActions.push('Add a few more months of bills for a more reliable average.');
  if (roofCount === 0) nextActions.push('Describe your roof to unlock sizing scenarios.');
  if (roofCount > 0 && bills.length > 0 && !latestRun) nextActions.push('Run your first sizing estimate.');
  if (latestRun && quoteAgg._count._all === 0) nextActions.push('Add installer quotes to compare them side by side.');
  if (quoteAgg._count._all > 1 && !selectedQuote) nextActions.push('Pick the quote you want and create a project.');
  if (selectedQuote && projects.length === 0) nextActions.push('Create a project to track installation milestones.');
  if (projects.some((p) => p.status === 'COMMISSIONED'))
    nextActions.push('Log this month’s generation to track performance.');

  return {
    profile,
    onboarding: {
      step: profile?.onboardingStep ?? 0,
      completedAt: profile?.onboardingCompletedAt ?? null,
      hasBills: bills.length > 0,
      hasRoof: roofCount > 0,
      hasSizing: Boolean(latestRun),
      hasQuotes: quoteAgg._count._all > 0,
      hasProject: projects.length > 0,
    },
    billStats: stats,
    counts: {
      bills: bills.length,
      roofProfiles: roofCount,
      quotes: quoteAgg._count._all,
      projects: projects.length,
      documents: documentCount,
    },
    quoteInsights: {
      averagePricePerKwp: quoteAgg._avg.pricePerKwp ? Math.round(quoteAgg._avg.pricePerKwp) : null,
      bestValueScore: quoteAgg._max.valueScore ?? null,
      selectedQuoteId: selectedQuote?.id ?? null,
    },
    latestSizing: latestRun
      ? {
          id: latestRun.id,
          createdAt: latestRun.createdAt,
          suitability: latestRun.suitability,
          recommendedKwp: optimal?.systemSizeKwp ?? null,
          annualSavings: optimal?.annualSavings ?? null,
          paybackYears: optimal?.paybackYears ?? null,
        }
      : null,
    projects: projectCards,
    nextActions,
  };
}
