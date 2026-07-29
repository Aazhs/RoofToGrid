/**
 * Demo seed covering all four journeys (NFR-O3).
 * Idempotent: re-running resets the demo user's data without touching other accounts.
 *
 *   npm run seed
 */
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { env } from '../src/config/env';
import { computeSizing } from '../src/domain/sizing';
import { evaluateQuote, type QuoteInput } from '../src/domain/quoteScoring';
import { MILESTONE_TEMPLATE } from '../src/domain/milestones';
import { getAssumptionSet } from '../src/domain/assumptions';
import { buildStorageKey, getStorage } from '../src/storage';

const prisma = new PrismaClient();
const set = getAssumptionSet(env.ASSUMPTION_SET_ID);

/** Typical Pune household: hot summers, mild winters, ~420 units/month average. */
const MONTHLY_UNITS = [380, 400, 470, 540, 560, 470, 380, 360, 370, 400, 390, 380];
const TARIFF = 9.2;

function monthsBack(count: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = count; i >= 1; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return out;
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 86_400_000);
}

const MINIMAL_PDF = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
    '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 100]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n',
  'utf8',
);

async function seedDocument(
  userId: string,
  fileName: string,
  category: 'BILL' | 'QUOTE' | 'CONTRACT' | 'DISCOM_APPROVAL' | 'WARRANTY',
  links: { projectId?: string; milestoneId?: string; quoteId?: string } = {},
) {
  const storage = getStorage();
  const key = buildStorageKey(userId, fileName, randomUUID());
  await storage.put({ key, body: MINIMAL_PDF, mimeType: 'application/pdf', size: MINIMAL_PDF.length });
  return prisma.document.create({
    data: {
      userId,
      category,
      fileName,
      storageKey: key,
      mimeType: 'application/pdf',
      sizeBytes: MINIMAL_PDF.length,
      storageDriver: storage.driver,
      description: 'Seeded demo document',
      ...links,
    },
  });
}

async function main(): Promise<void> {
  const email = env.SEED_DEMO_EMAIL;
  const passwordHash = await bcrypt.hash(env.SEED_DEMO_PASSWORD, env.BCRYPT_ROUNDS);

  // Cascades wipe bills, roofs, runs, quotes, projects, milestones and documents for a clean re-run.
  await prisma.user.deleteMany({ where: { email } });

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName: 'Asha Mehta',
      profile: {
        create: {
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411045',
          discomName: 'MSEDCL',
          consumerNumber: '170012345678',
          phone: '+91 98200 12345',
          propertyType: 'INDEPENDENT_HOUSE',
          onboardingStep: 4,
          onboardingCompletedAt: daysAgo(120),
        },
      },
    },
  });

  // ---------------------------------------------------------------- Journey A
  const months = monthsBack(12);
  await prisma.electricityBillSummary.createMany({
    data: months.map((billMonth, i) => {
      const unitsKwh = MONTHLY_UNITS[i % MONTHLY_UNITS.length];
      return {
        userId: user.id,
        billMonth,
        unitsKwh,
        billAmount: Math.round(unitsKwh * TARIFF),
        tariffPerKwh: TARIFF,
        sanctionedLoadKw: 5,
        connectionType: 'LT-1 Residential',
      };
    }),
  });

  const roof = await prisma.roofProfile.create({
    data: {
      userId: user.id,
      label: 'Terrace (main slab)',
      roofType: 'FLAT',
      usableAreaSqft: 650,
      orientation: 'S',
      tiltDegrees: 0,
      shadingLevel: 'LIGHT',
      structureType: 'RCC slab, elevated MS structure planned',
      isPrimary: true,
    },
  });

  const avgMonthlyUnits =
    MONTHLY_UNITS.reduce((a, b) => a + b, 0) / MONTHLY_UNITS.length;

  const sizing = computeSizing(
    {
      avgMonthlyUnits,
      tariffPerKwh: TARIFF,
      roofType: 'FLAT',
      usableAreaSqft: roof.usableAreaSqft,
      orientation: 'S',
      shadingLevel: 'LIGHT',
    },
    set,
  );

  await prisma.sizingRun.create({
    data: {
      userId: user.id,
      roofProfileId: roof.id,
      avgMonthlyUnits: Math.round(avgMonthlyUnits),
      tariffPerKwh: TARIFF,
      region: set.region,
      assumptionSetId: set.id,
      yieldEngine: sizing.yieldEngine,
      suitability: sizing.suitability,
      suitabilityReasons: sizing.suitabilityReasons,
      roofCapacityKwp: sizing.roofCapacityKwp,
      assumptions: sizing.assumptions as unknown as object,
      scenarios: {
        create: sizing.scenarios.map((s) => ({
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
  });

  // ---------------------------------------------------------------- Journey B
  const annualConsumptionKwh = Math.round(avgMonthlyUnits * 12);
  const quoteDrafts: QuoteInput[] = [
    {
      installerName: 'SunPath Energy',
      systemSizeKwp: 5,
      totalPrice: 295000,
      panelBrand: 'Waaree',
      panelTechnology: 'TOPCON',
      panelWattage: 550,
      panelProductWarrantyYears: 15,
      panelPerformanceWarrantyYears: 30,
      inverterBrand: 'Sungrow',
      inverterType: 'STRING',
      inverterWarrantyYears: 10,
      workmanshipWarrantyYears: 5,
      includesNetMetering: true,
      includesStructure: true,
      includesAmcYears: 5,
      expectedAnnualGenerationKwh: 7100,
      financingType: 'CASH',
    },
    {
      installerName: 'GridWise Solar',
      systemSizeKwp: 5,
      totalPrice: 258000,
      panelBrand: 'Vikram Solar',
      panelTechnology: 'MONO_PERC',
      panelWattage: 540,
      panelProductWarrantyYears: 12,
      panelPerformanceWarrantyYears: 25,
      inverterBrand: 'Growatt',
      inverterType: 'STRING',
      inverterWarrantyYears: 7,
      workmanshipWarrantyYears: 2,
      includesNetMetering: true,
      includesStructure: false,
      includesAmcYears: 1,
      financingType: 'LOAN',
      interestRatePct: 9.5,
      tenureMonths: 60,
      downPayment: 60000,
    },
    {
      installerName: 'ValueVolt',
      systemSizeKwp: 5.5,
      totalPrice: 181500,
      panelBrand: 'Unbranded',
      panelTechnology: 'POLY',
      panelWattage: 340,
      panelProductWarrantyYears: 5,
      panelPerformanceWarrantyYears: 20,
      inverterBrand: 'Local assembler',
      inverterType: 'UNKNOWN',
      inverterWarrantyYears: 2,
      workmanshipWarrantyYears: 0,
      includesNetMetering: false,
      includesStructure: false,
      includesAmcYears: 0,
      financingType: 'CASH',
    },
  ];

  const quoteIds: string[] = [];
  for (const draft of quoteDrafts) {
    const platform =
      sizing.scenarios.find((s) => Math.abs(s.systemSizeKwp - draft.systemSizeKwp) < 0.6)
        ?.annualGenerationKwh ?? draft.systemSizeKwp * set.specificYieldKwhPerKwp;

    const evaluation = evaluateQuote(
      draft,
      { tariffPerKwh: TARIFF, annualConsumptionKwh, platformAnnualGenerationKwh: platform },
      set,
    );

    const quote = await prisma.quote.create({
      data: {
        userId: user.id,
        ...draft,
        panelBrand: draft.panelBrand ?? undefined,
        inverterBrand: draft.inverterBrand ?? undefined,
        pricePerKwp: evaluation.pricePerKwp,
        equipmentTier: evaluation.equipmentTier,
        valueScore: evaluation.valueScore,
        scoreBreakdown: evaluation.scoreBreakdown as unknown as object,
        redFlags: evaluation.redFlags,
        financedTotalCost: evaluation.financedTotalCost,
        estimatedAnnualSavings: evaluation.estimatedAnnualSavings,
        paybackYears: evaluation.paybackYears,
        generationSource: evaluation.generationSource,
        isSelected: draft.installerName === 'SunPath Energy',
      },
    });
    quoteIds.push(quote.id);
  }

  // ---------------------------------------------------------------- Journey C
  const selectedQuoteId = quoteIds[0];
  const project = await prisma.project.create({
    data: {
      userId: user.id,
      sourceQuoteId: selectedQuoteId,
      name: '5 kWp rooftop solar — Pune terrace',
      installerName: 'SunPath Energy',
      systemSizeKwp: 5,
      contractValue: 295000,
      expectedAnnualGenerationKwh: 7100,
      baselineMonthlyUnits: Math.round(avgMonthlyUnits),
      baselineTariffPerKwh: TARIFF,
      status: 'COMMISSIONED',
      commissionedDate: daysAgo(95),
      notes: 'Seeded demo project. Net metering active, subsidy claim in progress.',
      milestones: {
        create: MILESTONE_TEMPLATE.map((t, i) => {
          const completedOffsets = [175, 168, 160, 150, 132, 120, 104, 95];
          const isDone = i < completedOffsets.length;
          return {
            key: t.key,
            title: t.title,
            sequence: t.sequence,
            ownerHint: t.ownerHint,
            status: isDone ? ('COMPLETED' as const) : ('IN_PROGRESS' as const),
            completedDate: isDone ? daysAgo(completedOffsets[i]) : null,
            plannedDate: isDone ? daysAgo(completedOffsets[i] + 5) : daysAgo(-20),
            notes: isDone ? null : 'Subsidy claim filed on the national portal, awaiting credit.',
          };
        }),
      },
    },
    include: { milestones: true },
  });

  // ---------------------------------------------------------------- Journey D
  const logMonths = monthsBack(3);
  const generated = [612, 585, 640];
  await prisma.generationLog.createMany({
    data: logMonths.map((month, i) => ({
      projectId: project.id,
      month,
      generatedKwh: generated[i],
      billAmount: Math.max(0, Math.round((avgMonthlyUnits - generated[i]) * TARIFF)),
      unitsImportedKwh: Math.max(0, Math.round(avgMonthlyUnits - generated[i] * 0.85)),
      unitsExportedKwh: Math.round(generated[i] * 0.15),
    })),
  });

  await prisma.warranty.createMany({
    data: [
      {
        projectId: project.id,
        component: 'PANEL',
        brand: 'Waaree TOPCon 550 W',
        serialNumber: 'WAA-2026-0098-0117',
        startDate: daysAgo(95),
        durationYears: 15,
      },
      {
        projectId: project.id,
        component: 'INVERTER',
        brand: 'Sungrow SG5.0RS',
        serialNumber: 'SG-5RS-773421',
        startDate: daysAgo(95),
        durationYears: 10,
      },
      {
        projectId: project.id,
        component: 'WORKMANSHIP',
        brand: 'SunPath Energy',
        startDate: daysAgo(95),
        durationYears: 5,
      },
      {
        projectId: project.id,
        component: 'STRUCTURE',
        brand: 'Elevated MS structure',
        startDate: daysAgo(95),
        // Deliberately short so the demo shows an EXPIRING_SOON badge (AC-D5).
        durationYears: 0.5,
      },
    ],
  });

  await prisma.serviceRequest.create({
    data: {
      projectId: project.id,
      title: 'Slight dip in output after dusty week',
      description: 'Generation dropped about 8% since last week. Panels look dusty from the terrace.',
      severity: 'LOW',
      status: 'IN_PROGRESS',
    },
  });

  // ---------------------------------------------------------------- Journey E
  const netMeteringMilestone = project.milestones.find((m) => m.key === 'NET_METERING_ACTIVE');
  await seedDocument(user.id, 'MSEDCL-bill-latest.pdf', 'BILL');
  await seedDocument(user.id, 'SunPath-quote-5kWp.pdf', 'QUOTE', { quoteId: selectedQuoteId });
  await seedDocument(user.id, 'SunPath-contract-signed.pdf', 'CONTRACT', { projectId: project.id });
  await seedDocument(user.id, 'DISCOM-feasibility-approval.pdf', 'DISCOM_APPROVAL', {
    projectId: project.id,
    milestoneId: netMeteringMilestone?.id,
  });
  await seedDocument(user.id, 'Waaree-panel-warranty.pdf', 'WARRANTY', { projectId: project.id });

  // eslint-disable-next-line no-console
  console.log(
    [
      'Seed complete.',
      `  demo login : ${email} / ${env.SEED_DEMO_PASSWORD}`,
      `  bills      : ${months.length} months`,
      `  scenarios  : ${sizing.scenarios.map((s) => `${s.key} ${s.systemSizeKwp} kWp`).join(', ')}`,
      `  quotes     : ${quoteIds.length}`,
      `  project    : ${project.name} (${project.status})`,
      `  storage    : ${getStorage().driver}`,
    ].join('\n'),
  );
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
