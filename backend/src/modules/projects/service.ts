/**
 * Project tracker (US-C1 … US-C6). Traces to AC-C1 … AC-C8.
 * Project status and commissioning are derived from the milestone board, never set by hand (AC-C7).
 */
import type { Milestone, Project } from '@prisma/client';
import { notFound } from '../../lib/errors';
import { pageMeta, paginate } from '../../lib/http';
import { prisma } from '../../lib/prisma';
import {
  MILESTONE_TEMPLATE,
  currentStage,
  deriveProjectStatus,
  nextActions,
  normalizeMilestoneDates,
  progressPercent,
  type MilestoneStatusName,
} from '../../domain/milestones';
import { billStats } from '../../domain/sizing';
import type { CreateProjectInput, ListProjectsQuery, UpdateMilestoneInput, UpdateProjectInput } from './schema';

function milestoneSeedData() {
  return MILESTONE_TEMPLATE.map((t) => ({
    key: t.key,
    title: t.title,
    sequence: t.sequence,
    ownerHint: t.ownerHint,
  }));
}

function decorate(project: Project & { milestones: Milestone[] }) {
  return {
    ...project,
    progressPercent: progressPercent(project.milestones),
    currentStage: currentStage(project.milestones),
    nextActions: nextActions(project.milestones),
    milestones: project.milestones.map((m) => ({
      ...m,
      help: MILESTONE_TEMPLATE.find((t) => t.key === m.key)?.help ?? null,
    })),
  };
}

async function baselineFromBills(userId: string) {
  const bills = await prisma.electricityBillSummary.findMany({
    where: { userId },
    orderBy: { billMonth: 'desc' },
    take: 12,
    select: { billMonth: true, unitsKwh: true, tariffPerKwh: true, billAmount: true },
  });
  const stats = billStats(bills);
  return {
    baselineMonthlyUnits: stats.avgMonthlyUnits > 0 ? stats.avgMonthlyUnits : null,
    baselineTariffPerKwh: stats.weightedTariffPerKwh > 0 ? stats.weightedTariffPerKwh : null,
  };
}

export async function listProjects(userId: string, q: ListProjectsQuery) {
  const { page, pageSize, skip, take } = paginate(q);
  const where = { userId, ...(q.status ? { status: q.status } : {}) };

  const [items, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { milestones: { orderBy: { sequence: 'asc' } } },
    }),
    prisma.project.count({ where }),
  ]);

  return { items: items.map(decorate), meta: pageMeta(page, pageSize, total) };
}

export async function getProject(userId: string, id: string) {
  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: {
      milestones: { orderBy: { sequence: 'asc' } },
      documents: { orderBy: { createdAt: 'desc' } },
      sourceQuote: true,
      _count: { select: { generationLogs: true, warranties: true, serviceRequests: true } },
    },
  });
  if (!project) throw notFound('Project'); // AC-C8
  return decorate(project);
}

/** AC-C1 — project + all 9 milestones in a single transaction. */
export async function createProject(userId: string, input: CreateProjectInput) {
  if (input.sourceQuoteId) {
    const quote = await prisma.quote.findFirst({
      where: { id: input.sourceQuoteId, userId },
      select: { id: true },
    });
    if (!quote) throw notFound('Quote');
  }

  const baseline = await baselineFromBills(userId);

  const project = await prisma.project.create({
    data: {
      userId,
      name: input.name,
      installerName: input.installerName,
      systemSizeKwp: input.systemSizeKwp,
      contractValue: input.contractValue,
      currency: input.currency,
      sourceQuoteId: input.sourceQuoteId,
      expectedAnnualGenerationKwh: input.expectedAnnualGenerationKwh,
      baselineMonthlyUnits: input.baselineMonthlyUnits ?? baseline.baselineMonthlyUnits,
      baselineTariffPerKwh: input.baselineTariffPerKwh ?? baseline.baselineTariffPerKwh,
      notes: input.notes,
      milestones: { create: milestoneSeedData() },
    },
    include: { milestones: { orderBy: { sequence: 'asc' } } },
  });

  return decorate(project);
}

/** AC-C1 / AC-B8 — commercial terms are copied so the project survives quote deletion. */
export async function createProjectFromQuote(userId: string, quoteId: string, name?: string) {
  const quote = await prisma.quote.findFirst({ where: { id: quoteId, userId } });
  if (!quote) throw notFound('Quote');

  const baseline = await baselineFromBills(userId);

  const project = await prisma.$transaction(async (tx) => {
    await tx.quote.updateMany({ where: { userId, isSelected: true }, data: { isSelected: false } });
    await tx.quote.update({ where: { id: quote.id }, data: { isSelected: true } });

    return tx.project.create({
      data: {
        userId,
        sourceQuoteId: quote.id,
        name: name ?? `${quote.systemSizeKwp} kWp rooftop solar`,
        installerName: quote.installerName,
        systemSizeKwp: quote.systemSizeKwp,
        contractValue: quote.totalPrice,
        currency: quote.currency,
        expectedAnnualGenerationKwh: quote.expectedAnnualGenerationKwh ?? undefined,
        baselineMonthlyUnits: baseline.baselineMonthlyUnits,
        baselineTariffPerKwh: baseline.baselineTariffPerKwh,
        milestones: {
          create: milestoneSeedData().map((m) =>
            m.key === 'INQUIRY'
              ? { ...m, status: 'COMPLETED' as const, completedDate: new Date() }
              : m,
          ),
        },
      },
      include: { milestones: { orderBy: { sequence: 'asc' } } },
    });
  });

  // Inquiry is already done at this point, so status should reflect that.
  const derived = deriveProjectStatus(project.milestones, project.status);
  const updated = await prisma.project.update({
    where: { id: project.id },
    data: { status: derived.status, commissionedDate: derived.commissionedDate },
    include: { milestones: { orderBy: { sequence: 'asc' } } },
  });

  return decorate(updated);
}

export async function updateProject(userId: string, id: string, input: UpdateProjectInput) {
  const existing = await prisma.project.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw notFound('Project');

  const project = await prisma.project.update({
    where: { id },
    data: input,
    include: { milestones: { orderBy: { sequence: 'asc' } } },
  });

  return decorate(project);
}

export async function deleteProject(userId: string, id: string): Promise<void> {
  const existing = await prisma.project.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw notFound('Project');
  await prisma.project.delete({ where: { id } });
}

/** AC-C3 / AC-C4 / AC-C7 */
export async function updateMilestone(
  userId: string,
  projectId: string,
  milestoneId: string,
  input: UpdateMilestoneInput,
) {
  const milestone = await prisma.milestone.findFirst({
    where: { id: milestoneId, projectId, project: { userId } },
    include: { project: true },
  });
  if (!milestone) throw notFound('Milestone'); // AC-C8

  const nextStatus = (input.status ?? milestone.status) as MilestoneStatusName;
  const completedDate = normalizeMilestoneDates(
    nextStatus,
    input.completedDate === undefined ? milestone.completedDate : input.completedDate,
  );

  const updated = await prisma.$transaction(async (tx) => {
    await tx.milestone.update({
      where: { id: milestoneId },
      data: {
        status: nextStatus,
        completedDate,
        ...(input.plannedDate === undefined ? {} : { plannedDate: input.plannedDate }),
        ...(input.notes === undefined ? {} : { notes: input.notes }),
      },
    });

    const milestones = await tx.milestone.findMany({
      where: { projectId },
      orderBy: { sequence: 'asc' },
    });
    const derived = deriveProjectStatus(milestones, milestone.project.status);

    return tx.project.update({
      where: { id: projectId },
      data: { status: derived.status, commissionedDate: derived.commissionedDate },
      include: { milestones: { orderBy: { sequence: 'asc' } } },
    });
  });

  return decorate(updated);
}

/** The canonical template, exposed so the UI can explain the lifecycle before a project exists. */
export function milestoneTemplate() {
  return MILESTONE_TEMPLATE;
}
