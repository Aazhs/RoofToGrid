/**
 * Sizing service (US-A1, US-A7 … US-A10).
 * Computation is delegated to the YieldEngine seam so a site-specific simulator can replace the rule model
 * without touching this file (NFR-X2). Guest estimates are computed but never persisted (AC-A1, AC-A15).
 */
import { env } from '../../config/env';
import { notFound } from '../../lib/errors';
import { pageMeta, paginate } from '../../lib/http';
import { prisma } from '../../lib/prisma';
import { getAssumptionSet, publicAssumptions } from '../../domain/assumptions';
import type { SizingResult } from '../../domain/sizing';
import { getYieldEngine, subsidyProvider } from '../../integrations';
import type { CreateRunInput, EstimateInput } from './schema';

export async function estimate(input: EstimateInput): Promise<SizingResult> {
  return getYieldEngine().estimate({
    avgMonthlyUnits: input.avgMonthlyUnits,
    tariffPerKwh: input.tariffPerKwh,
    roofType: input.roofType,
    usableAreaSqft: input.usableAreaSqft,
    orientation: input.orientation,
    shadingLevel: input.shadingLevel,
    assumptionSetId: input.assumptionSetId ?? env.ASSUMPTION_SET_ID,
  });
}

/** AC-A15 — persists the run plus its scenarios in one transaction and returns the saved shape. */
export async function createRun(userId: string, input: CreateRunInput) {
  let roofType = input.roofType;
  let usableAreaSqft = input.usableAreaSqft;
  let orientation = input.orientation;
  let shadingLevel = input.shadingLevel;

  if (input.roofProfileId) {
    const roof = await prisma.roofProfile.findFirst({
      where: { id: input.roofProfileId, userId },
    });
    if (!roof) throw notFound('Roof profile');
    roofType = roof.roofType;
    usableAreaSqft = roof.usableAreaSqft;
    orientation = roof.orientation;
    shadingLevel = roof.shadingLevel;
  }

  const result = await getYieldEngine().estimate({
    avgMonthlyUnits: input.avgMonthlyUnits,
    tariffPerKwh: input.tariffPerKwh,
    roofType: roofType ?? 'FLAT',
    usableAreaSqft: usableAreaSqft ?? 0,
    orientation: orientation ?? 'S',
    shadingLevel: shadingLevel ?? 'NONE',
    assumptionSetId: input.assumptionSetId ?? env.ASSUMPTION_SET_ID,
  });

  const run = await prisma.sizingRun.create({
    data: {
      userId,
      roofProfileId: input.roofProfileId,
      avgMonthlyUnits: input.avgMonthlyUnits,
      tariffPerKwh: input.tariffPerKwh,
      region: result.assumptions.region,
      assumptionSetId: result.assumptionSetId,
      yieldEngine: result.yieldEngine,
      suitability: result.suitability,
      suitabilityReasons: result.suitabilityReasons,
      roofCapacityKwp: result.roofCapacityKwp,
      assumptions: result.assumptions as unknown as object,
      scenarios: {
        create: result.scenarios.map((s) => ({
          key: s.key,
          label: s.label,
          systemSizeKwp: s.systemSizeKwp,
          annualGenerationKwh: s.annualGenerationKwh,
          estimatedCost: s.estimatedCost,
          subsidyAmount: s.subsidyAmount,
          netCost: s.netCost,
          annualSavings: s.annualSavings,
          paybackYears: s.paybackYears,
          lifetimeSavings25y: s.lifetimeSavings25y,
          co2OffsetTonnesPerYear: s.co2OffsetTonnesPerYear,
          roofAreaRequiredSqft: s.roofAreaRequiredSqft,
          notes: s.notes,
        })),
      },
    },
    include: { scenarios: { orderBy: { systemSizeKwp: 'asc' } } },
  });

  return { ...run, computed: result };
}

export async function listRuns(userId: string, q: { page?: number; pageSize?: number }) {
  const { page, pageSize, skip, take } = paginate(q);
  const [items, total] = await Promise.all([
    prisma.sizingRun.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { scenarios: { orderBy: { systemSizeKwp: 'asc' } } },
    }),
    prisma.sizingRun.count({ where: { userId } }),
  ]);
  return { items, meta: pageMeta(page, pageSize, total) };
}

/** AC-A15 — another user's run is a 404, never a 403 (NFR-S6). */
export async function getRun(userId: string, id: string) {
  const run = await prisma.sizingRun.findFirst({
    where: { id, userId },
    include: {
      scenarios: { orderBy: { systemSizeKwp: 'asc' } },
      roofProfile: true,
    },
  });
  if (!run) throw notFound('Sizing run');
  return run;
}

export async function deleteRun(userId: string, id: string): Promise<void> {
  const run = await prisma.sizingRun.findFirst({ where: { id, userId }, select: { id: true } });
  if (!run) throw notFound('Sizing run');
  await prisma.sizingRun.delete({ where: { id } });
}

/** NFR-U4 — the assumptions behind every number, plus the subsidy rules in force. */
export async function getAssumptions(assumptionSetId?: string) {
  const set = getAssumptionSet(assumptionSetId ?? env.ASSUMPTION_SET_ID);
  const subsidy = await subsidyProvider.estimate(3, set.region);
  return {
    ...publicAssumptions(set),
    yieldEngine: { name: getYieldEngine().name, siteSpecific: getYieldEngine().isSiteSpecific },
    subsidyProgramme: { name: subsidy.programme, rules: subsidy.rules, live: subsidy.live },
  };
}
