/**
 * Quote ingestion, normalization and comparison (US-B1 … US-B8).
 * Scores are recomputed and persisted on every write so historical comparisons stay auditable (AC-B9).
 */
import type { Quote } from '@prisma/client';
import { env } from '../../config/env';
import { badRequest, notFound } from '../../lib/errors';
import { pageMeta, paginate } from '../../lib/http';
import { prisma } from '../../lib/prisma';
import { getAssumptionSet } from '../../domain/assumptions';
import { annualGenerationKwh, billStats } from '../../domain/sizing';
import {
  bestInColumn,
  evaluateQuote,
  type ComparisonRow,
  type QuoteInput,
  type ScoringContext,
} from '../../domain/quoteScoring';
import type { CreateQuoteInput, ListQuotesQuery, UpdateQuoteInput } from './schema';

/** Used when a homeowner has not entered bills yet, so scoring still produces useful numbers. */
export const FALLBACK_TARIFF_PER_KWH = 8;

const set = () => getAssumptionSet(env.ASSUMPTION_SET_ID);

export interface HouseholdContext extends ScoringContext {
  source: 'BILLS' | 'FALLBACK';
  monthsOfBills: number;
  orientation: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
  shadingLevel: 'NONE' | 'LIGHT' | 'MODERATE' | 'HEAVY';
}

/**
 * Household context is shared by every quote in a comparison, which is what keeps rows comparable
 * across different system sizes (AC-B5).
 */
export async function householdContext(userId: string): Promise<HouseholdContext> {
  const [bills, roof] = await Promise.all([
    prisma.electricityBillSummary.findMany({
      where: { userId },
      orderBy: { billMonth: 'desc' },
      take: 12,
      select: { billMonth: true, unitsKwh: true, tariffPerKwh: true, billAmount: true },
    }),
    prisma.roofProfile.findFirst({
      where: { userId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
    }),
  ]);

  const stats = billStats(bills);
  return {
    tariffPerKwh: stats.weightedTariffPerKwh > 0 ? stats.weightedTariffPerKwh : FALLBACK_TARIFF_PER_KWH,
    annualConsumptionKwh: Math.round(stats.avgMonthlyUnits * 12),
    source: bills.length > 0 ? 'BILLS' : 'FALLBACK',
    monthsOfBills: bills.length,
    orientation: (roof?.orientation ?? 'S') as HouseholdContext['orientation'],
    shadingLevel: (roof?.shadingLevel ?? 'NONE') as HouseholdContext['shadingLevel'],
  };
}

function contextForSize(ctx: HouseholdContext, systemSizeKwp: number): ScoringContext {
  return {
    tariffPerKwh: ctx.tariffPerKwh,
    annualConsumptionKwh: ctx.annualConsumptionKwh,
    // AC-B6 fallback: platform estimate at this household's orientation and shading.
    platformAnnualGenerationKwh: annualGenerationKwh(
      systemSizeKwp,
      ctx.orientation,
      ctx.shadingLevel,
      set(),
    ),
  };
}

function toQuoteInput(source: {
  installerName: string;
  systemSizeKwp: number;
  totalPrice: number;
  panelBrand?: string | null;
  panelTechnology: string;
  panelWattage?: number | null;
  panelProductWarrantyYears: number;
  panelPerformanceWarrantyYears: number;
  inverterBrand?: string | null;
  inverterType: string;
  inverterWarrantyYears: number;
  workmanshipWarrantyYears: number;
  includesNetMetering: boolean;
  includesStructure: boolean;
  includesAmcYears: number;
  expectedAnnualGenerationKwh?: number | null;
  financingType: string;
  interestRatePct?: number | null;
  tenureMonths?: number | null;
  downPayment?: number | null;
}): QuoteInput {
  return {
    ...source,
    panelTechnology: source.panelTechnology as QuoteInput['panelTechnology'],
    inverterType: source.inverterType as QuoteInput['inverterType'],
    financingType: source.financingType as QuoteInput['financingType'],
  };
}

async function assertDocumentOwned(userId: string, documentId?: string): Promise<void> {
  if (!documentId) return;
  const doc = await prisma.document.findFirst({ where: { id: documentId, userId }, select: { id: true } });
  if (!doc) throw badRequest('That quote document could not be found in your documents');
}

function decorate(quote: Quote) {
  return {
    ...quote,
    monthlyPayment:
      quote.financingType !== 'CASH' && quote.tenureMonths
        ? Math.round((quote.financedTotalCost - (quote.downPayment ?? 0)) / quote.tenureMonths)
        : null,
  };
}

export async function listQuotes(userId: string, q: ListQuotesQuery) {
  const { page, pageSize, skip, take } = paginate(q);
  const [items, total] = await Promise.all([
    prisma.quote.findMany({
      where: { userId },
      orderBy: [{ [q.sort]: q.order }, { createdAt: 'desc' }],
      skip,
      take,
    }),
    prisma.quote.count({ where: { userId } }),
  ]);
  return { items: items.map(decorate), meta: pageMeta(page, pageSize, total) };
}

export async function getQuote(userId: string, id: string) {
  const quote = await prisma.quote.findFirst({ where: { id, userId } });
  if (!quote) throw notFound('Quote');
  return decorate(quote);
}

export async function createQuote(userId: string, input: CreateQuoteInput) {
  await assertDocumentOwned(userId, input.quoteDocumentId);
  const ctx = await householdContext(userId);
  const evaluation = evaluateQuote(
    toQuoteInput(input),
    contextForSize(ctx, input.systemSizeKwp),
    set(),
  );

  const quote = await prisma.quote.create({
    data: {
      ...input,
      userId,
      pricePerKwp: evaluation.pricePerKwp,
      equipmentTier: evaluation.equipmentTier,
      valueScore: evaluation.valueScore,
      scoreBreakdown: evaluation.scoreBreakdown as unknown as object,
      redFlags: evaluation.redFlags,
      financedTotalCost: evaluation.financedTotalCost,
      estimatedAnnualSavings: evaluation.estimatedAnnualSavings,
      paybackYears: evaluation.paybackYears,
      generationSource: evaluation.generationSource,
      expectedAnnualGenerationKwh: input.expectedAnnualGenerationKwh,
    },
  });

  return decorate(quote);
}

/** AC-B9 — every update rescoring the whole quote keeps derived columns trustworthy. */
export async function updateQuote(userId: string, id: string, input: UpdateQuoteInput) {
  const existing = await prisma.quote.findFirst({ where: { id, userId } });
  if (!existing) throw notFound('Quote');
  await assertDocumentOwned(userId, input.quoteDocumentId);

  const merged = { ...existing, ...input };
  const ctx = await householdContext(userId);
  const evaluation = evaluateQuote(toQuoteInput(merged), contextForSize(ctx, merged.systemSizeKwp), set());

  const quote = await prisma.quote.update({
    where: { id },
    data: {
      ...input,
      pricePerKwp: evaluation.pricePerKwp,
      equipmentTier: evaluation.equipmentTier,
      valueScore: evaluation.valueScore,
      scoreBreakdown: evaluation.scoreBreakdown as unknown as object,
      redFlags: evaluation.redFlags,
      financedTotalCost: evaluation.financedTotalCost,
      estimatedAnnualSavings: evaluation.estimatedAnnualSavings,
      paybackYears: evaluation.paybackYears,
      generationSource: evaluation.generationSource,
    },
  });

  return decorate(quote);
}

/** AC-B8 — projects survive quote deletion because they carry denormalized commercial terms. */
export async function deleteQuote(userId: string, id: string): Promise<void> {
  const existing = await prisma.quote.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw notFound('Quote');
  await prisma.quote.delete({ where: { id } });
}

export async function selectQuote(userId: string, id: string) {
  const existing = await prisma.quote.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw notFound('Quote');

  const quote = await prisma.$transaction(async (tx) => {
    await tx.quote.updateMany({ where: { userId, isSelected: true }, data: { isSelected: false } });
    return tx.quote.update({ where: { id }, data: { isSelected: true } });
  });

  return decorate(quote);
}

/** Recompute every quote against current bills — used after a homeowner adds bill history. */
export async function rescoreAll(userId: string): Promise<{ rescored: number }> {
  const quotes = await prisma.quote.findMany({ where: { userId } });
  const ctx = await householdContext(userId);

  for (const quote of quotes) {
    const evaluation = evaluateQuote(
      toQuoteInput(quote),
      contextForSize(ctx, quote.systemSizeKwp),
      set(),
    );
    await prisma.quote.update({
      where: { id: quote.id },
      data: {
        pricePerKwp: evaluation.pricePerKwp,
        equipmentTier: evaluation.equipmentTier,
        valueScore: evaluation.valueScore,
        scoreBreakdown: evaluation.scoreBreakdown as unknown as object,
        redFlags: evaluation.redFlags,
        financedTotalCost: evaluation.financedTotalCost,
        estimatedAnnualSavings: evaluation.estimatedAnnualSavings,
        paybackYears: evaluation.paybackYears,
        generationSource: evaluation.generationSource,
      },
    });
  }

  return { rescored: quotes.length };
}

/** AC-B5 — normalized matrix plus best-in-column flags. */
export async function comparison(userId: string) {
  const [quotes, ctx] = await Promise.all([
    prisma.quote.findMany({ where: { userId }, orderBy: { valueScore: 'desc' } }),
    householdContext(userId),
  ]);

  const rows: ComparisonRow[] = quotes.map((q) => ({
    quoteId: q.id,
    installerName: q.installerName,
    systemSizeKwp: q.systemSizeKwp,
    totalPrice: q.totalPrice,
    pricePerKwp: q.pricePerKwp,
    equipmentTier: q.equipmentTier,
    panelSummary: [q.panelBrand, q.panelTechnology !== 'UNKNOWN' ? q.panelTechnology : null, q.panelWattage ? `${q.panelWattage} W` : null]
      .filter(Boolean)
      .join(' · ') || 'Not specified',
    inverterSummary: [q.inverterBrand, q.inverterType !== 'UNKNOWN' ? q.inverterType : null]
      .filter(Boolean)
      .join(' · ') || 'Not specified',
    panelProductWarrantyYears: q.panelProductWarrantyYears,
    inverterWarrantyYears: q.inverterWarrantyYears,
    workmanshipWarrantyYears: q.workmanshipWarrantyYears,
    includesNetMetering: q.includesNetMetering,
    includesStructure: q.includesStructure,
    financingType: q.financingType,
    financedTotalCost: q.financedTotalCost,
    estimatedAnnualGenerationKwh:
      q.expectedAnnualGenerationKwh ??
      annualGenerationKwh(q.systemSizeKwp, ctx.orientation, ctx.shadingLevel, set()),
    generationSource: q.generationSource,
    estimatedAnnualSavings: q.estimatedAnnualSavings,
    paybackYears: q.paybackYears,
    valueScore: q.valueScore,
    redFlagCount: q.redFlags.length,
    isSelected: q.isSelected,
  }));

  const best = bestInColumn(rows);
  const recommended = rows.length > 0 ? rows.reduce((a, b) => (b.valueScore > a.valueScore ? b : a)) : null;

  return {
    rows,
    bestInColumn: best,
    recommendedQuoteId: recommended?.quoteId ?? null,
    context: {
      tariffPerKwh: ctx.tariffPerKwh,
      annualConsumptionKwh: ctx.annualConsumptionKwh,
      source: ctx.source,
      monthsOfBills: ctx.monthsOfBills,
      note:
        ctx.source === 'BILLS'
          ? 'Savings use your own tariff and consumption from the bills you entered.'
          : `No bills on file yet, so savings assume a tariff of ₹${FALLBACK_TARIFF_PER_KWH}/unit. Add bills for accurate numbers.`,
    },
    scoring: {
      weights: { price: 40, equipment: 25, warranty: 25, transparency: 10 },
      explanation:
        'Value score weighs price per kWp (40), equipment tier (25), warranty cover (25) and scope or ' +
        'financing transparency (10). Suspiciously cheap quotes are capped, not rewarded.',
    },
  };
}
