/**
 * Rich, interactive mock data for unauthenticated prototype demo visitors.
 * Allows anyone (including Azure reviewers and prospective customers)
 * to explore every single screen of RoofToGrid with zero sign-up friction.
 */
import type {
  Assumptions,
  Bill,
  BillStats,
  Comparison,
  DocumentRecord,
  GenerationLog,
  Performance,
  Profile,
  Project,
  Quote,
  RoofProfile,
  SizingRun,
  Summary,
  User,
  Warranty,
} from './types';

const STORAGE_KEY_PREFIX = 'rtg_demo_';

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save demo data to localStorage', e);
  }
}

// ── 1. Demo User & Profile ──────────────────────────────────────────
export const DEMO_USER: User = {
  id: 'demo-user-101',
  email: 'arun.sharma@example.com',
  fullName: 'Arun Sharma',
  role: 'HOMEOWNER',
  createdAt: '2026-08-15T09:30:00Z',
  profile: {
    id: 'demo-profile-101',
    userId: 'demo-user-101',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560034',
    discomName: 'BESCOM (Bangalore Electricity Supply Company)',
    consumerNumber: 'BES-7829104-LT2',
    phone: '+91 98450 12345',
    propertyType: 'INDEPENDENT_HOUSE',
    currency: 'INR',
    region: 'IN-KA',
    onboardingStep: 5,
    onboardingCompletedAt: '2026-08-20T14:00:00Z',
  },
};

// ── 2. Demo 12-Month Bills ──────────────────────────────────────────
const INITIAL_BILLS: Bill[] = [
  { id: 'bill-1', billMonth: '2026-08', unitsKwh: 540, billAmount: 4428, tariffPerKwh: 8.2, sanctionedLoadKw: 5, connectionType: 'LT-2 Domestic', notes: 'AC usage high during summer peak', documentId: 'doc-bill-1' },
  { id: 'bill-2', billMonth: '2026-07', unitsKwh: 520, billAmount: 4264, tariffPerKwh: 8.2, sanctionedLoadKw: 5, connectionType: 'LT-2 Domestic', notes: null, documentId: null },
  { id: 'bill-3', billMonth: '2026-06', unitsKwh: 495, billAmount: 4059, tariffPerKwh: 8.2, sanctionedLoadKw: 5, connectionType: 'LT-2 Domestic', notes: null, documentId: null },
  { id: 'bill-4', billMonth: '2026-05', unitsKwh: 560, billAmount: 4592, tariffPerKwh: 8.2, sanctionedLoadKw: 5, connectionType: 'LT-2 Domestic', notes: 'Peak summer billing', documentId: null },
  { id: 'bill-5', billMonth: '2026-04', unitsKwh: 510, billAmount: 4182, tariffPerKwh: 8.2, sanctionedLoadKw: 5, connectionType: 'LT-2 Domestic', notes: null, documentId: null },
  { id: 'bill-6', billMonth: '2026-03', unitsKwh: 470, billAmount: 3854, tariffPerKwh: 8.2, sanctionedLoadKw: 5, connectionType: 'LT-2 Domestic', notes: null, documentId: null },
  { id: 'bill-7', billMonth: '2026-02', unitsKwh: 430, billAmount: 3526, tariffPerKwh: 8.2, sanctionedLoadKw: 5, connectionType: 'LT-2 Domestic', notes: null, documentId: null },
  { id: 'bill-8', billMonth: '2026-01', unitsKwh: 420, billAmount: 3444, tariffPerKwh: 8.2, sanctionedLoadKw: 5, connectionType: 'LT-2 Domestic', notes: 'Winter baseline', documentId: null },
  { id: 'bill-9', billMonth: '2025-12', unitsKwh: 440, billAmount: 3608, tariffPerKwh: 8.2, sanctionedLoadKw: 5, connectionType: 'LT-2 Domestic', notes: null, documentId: null },
  { id: 'bill-10', billMonth: '2025-11', unitsKwh: 460, billAmount: 3772, tariffPerKwh: 8.2, sanctionedLoadKw: 5, connectionType: 'LT-2 Domestic', notes: null, documentId: null },
  { id: 'bill-11', billMonth: '2025-10', unitsKwh: 480, billAmount: 3936, tariffPerKwh: 8.2, sanctionedLoadKw: 5, connectionType: 'LT-2 Domestic', notes: 'Festival lighting', documentId: null },
  { id: 'bill-12', billMonth: '2025-09', unitsKwh: 490, billAmount: 4018, tariffPerKwh: 8.2, sanctionedLoadKw: 5, connectionType: 'LT-2 Domestic', notes: null, documentId: null },
];

export const DEMO_BILL_STATS: BillStats = {
  monthsCounted: 12,
  avgMonthlyUnits: 485,
  weightedTariffPerKwh: 8.2,
  avgMonthlyBill: 3977,
  ready: true,
};

// ── 3. Demo Roof Profile ────────────────────────────────────────────
const INITIAL_ROOF: RoofProfile[] = [
  {
    id: 'roof-1',
    label: 'Main Terrace (RCC Slab)',
    roofType: 'FLAT',
    usableAreaSqft: 520,
    orientation: 'S',
    tiltDegrees: 15,
    shadingLevel: 'NONE',
    structureType: 'Elevated HDGI structure (7 ft clearance for walking)',
    notes: 'South-facing unshaded rooftop with good concrete anchor points.',
    isPrimary: true,
    estimatedCapacityKwp: 5.2,
  },
];

// ── 4. Assumptions ──────────────────────────────────────────────────
export const DEMO_ASSUMPTIONS: Assumptions = {
  assumptionSetId: 'in-ka-bescom-v2',
  label: 'India Standard Residential (MNRE PM Surya Ghar 2026)',
  region: 'IN-KA',
  currency: 'INR',
  specificYieldKwhPerKwp: 1450,
  areaPerKwpSqft: { FLAT: 100, SLOPED: 80, MIXED: 90 },
  shadingDerate: { NONE: 1.0, LIGHT: 0.92, MODERATE: 0.8, HEAVY: 0.6 },
  orientationFactor: { S: 1.0, SE: 0.96, SW: 0.96, E: 0.9, W: 0.9, NE: 0.82, NW: 0.82, N: 0.72 },
  costPerKwpBands: [
    { maxKwp: 3, costPerKwp: 62000 },
    { maxKwp: 6, costPerKwp: 56000 },
    { maxKwp: 10, costPerKwp: 52000 },
    { maxKwp: null, costPerKwp: 48000 },
  ],
  subsidy: {
    programme: 'PM Surya Ghar: Muft Bijli Yojana',
    perKwFirst2Kw: 30000,
    thirdKwAmount: 18000,
    capAmount: 78000,
    minSystemKwp: 1,
  },
  tariffEscalationPct: 4.5,
  degradationPctPerYear: 0.55,
  co2KgPerKwh: 0.82,
  selfConsumptionRatio: 0.75,
  analysisPeriodYears: 25,
  disclaimer: 'Estimates are based on MNRE guidelines and average solar insolation in Southern India. Actual generation varies with local weather and maintenance.',
  yieldEngine: { name: 'PVGIS India Solar Engine v2.4', siteSpecific: true },
  subsidyProgramme: {
    name: 'PM Surya Ghar Central Financial Assistance',
    rules: [
      '₹30,000/kW for the first 2 kWp',
      '₹18,000 for the 3rd kWp',
      'Maximum subsidy capped at ₹78,000 for systems ≥ 3 kWp',
      'Direct DBT credit to customer bank account post commissioning',
    ],
    live: true,
  },
};

// ── 5. Demo Sizing Runs ─────────────────────────────────────────────
const INITIAL_SIZING_RUNS: SizingRun[] = [
  {
    id: 'sizing-run-1',
    createdAt: '2026-08-22T11:15:00Z',
    avgMonthlyUnits: 485,
    tariffPerKwh: 8.2,
    suitability: 'EXCELLENT',
    suitabilityReasons: [
      'Over 500 sqft of unshaded South-facing terrace available',
      'High average monthly bill of ₹3,977 ensures rapid payback under 4.5 years',
      'Qualifies for full ₹78,000 PM Surya Ghar Central Financial Assistance (DBT)',
      '100% of household consumption can be offset with a 5 kWp system',
    ],
    roofCapacityKwp: 5.2,
    assumptionSetId: 'in-ka-bescom-v2',
    assumptions: DEMO_ASSUMPTIONS,
    roofProfile: INITIAL_ROOF[0],
    scenarios: [
      {
        id: 'sc-1',
        key: 'CONSERVATIVE',
        label: 'Essential (3 kWp)',
        systemSizeKwp: 3,
        annualGenerationKwh: 4350,
        monthlyGenerationKwh: 362,
        estimatedCost: 186000,
        subsidyAmount: 78000,
        netCost: 108000,
        annualSavings: 35670,
        monthlySavings: 2972,
        paybackYears: 3.0,
        lifetimeSavings25y: 840000,
        co2OffsetTonnesPerYear: 3.56,
        roofAreaRequiredSqft: 300,
        offsetPercent: 74,
        notes: 'Low initial outlay, maximum subsidy efficiency per rupee invested.',
      },
      {
        id: 'sc-2',
        key: 'OPTIMAL',
        label: 'Recommended (5 kWp)',
        systemSizeKwp: 5,
        annualGenerationKwh: 7250,
        monthlyGenerationKwh: 604,
        estimatedCost: 280000,
        subsidyAmount: 78000,
        netCost: 202000,
        annualSavings: 47760,
        monthlySavings: 3980,
        paybackYears: 4.2,
        lifetimeSavings25y: 1320000,
        co2OffsetTonnesPerYear: 5.94,
        roofAreaRequiredSqft: 500,
        offsetPercent: 100,
        notes: 'Covers 100% of daytime consumption plus surplus for net metering export.',
      },
      {
        id: 'sc-3',
        key: 'MAX_ROOF',
        label: 'Maximum Roof (5.2 kWp)',
        systemSizeKwp: 5.2,
        annualGenerationKwh: 7540,
        monthlyGenerationKwh: 628,
        estimatedCost: 291200,
        subsidyAmount: 78000,
        netCost: 213200,
        annualSavings: 49500,
        monthlySavings: 4125,
        paybackYears: 4.3,
        lifetimeSavings25y: 1380000,
        co2OffsetTonnesPerYear: 6.18,
        roofAreaRequiredSqft: 520,
        offsetPercent: 107,
        notes: 'Maximizes rooftop generation with peak net export credits from BESCOM.',
      },
    ],
  },
];

// ── 6. Demo Installer Quotes ────────────────────────────────────────
const INITIAL_QUOTES: Quote[] = [
  {
    id: 'quote-tata',
    installerName: 'Tata Power Solar Systems',
    systemSizeKwp: 5,
    totalPrice: 285000,
    currency: 'INR',
    panelBrand: 'Tata Power Solar TP550 (Bifacial TOPCon)',
    panelTechnology: 'TOPCON',
    panelWattage: 550,
    panelProductWarrantyYears: 12,
    panelPerformanceWarrantyYears: 25,
    inverterBrand: 'Growatt MIN 5000TL-X',
    inverterType: 'STRING',
    inverterWarrantyYears: 10,
    workmanshipWarrantyYears: 5,
    includesNetMetering: true,
    includesStructure: true,
    includesAmcYears: 5,
    expectedAnnualGenerationKwh: 7350,
    financingType: 'CASH',
    interestRatePct: null,
    tenureMonths: null,
    downPayment: null,
    pricePerKwp: 57000,
    equipmentTier: 'PREMIUM',
    valueScore: 88,
    scoreBreakdown: {
      price: 84,
      equipment: 94,
      warranty: 92,
      transparency: 90,
      weights: { price: 0.35, equipment: 0.25, warranty: 0.25, transparency: 0.15 },
    },
    redFlags: [],
    financedTotalCost: 285000,
    estimatedAnnualSavings: 48200,
    paybackYears: 4.3,
    generationSource: 'INSTALLER',
    monthlyPayment: null,
    isSelected: true,
    notes: 'Includes Tier-1 bifacial panels, 5-year comprehensive on-site AMC, and complete DISCOM net-metering Liaison.',
    createdAt: '2026-08-28T14:20:00Z',
  },
  {
    id: 'quote-waaree',
    installerName: 'Waaree Energies Authorized Partner',
    systemSizeKwp: 5,
    totalPrice: 265000,
    currency: 'INR',
    panelBrand: 'Waaree Arka Series Mono PERC 540W',
    panelTechnology: 'MONO_PERC',
    panelWattage: 540,
    panelProductWarrantyYears: 10,
    panelPerformanceWarrantyYears: 25,
    inverterBrand: 'Sungrow SG5.0RS',
    inverterType: 'STRING',
    inverterWarrantyYears: 7,
    workmanshipWarrantyYears: 3,
    includesNetMetering: true,
    includesStructure: true,
    includesAmcYears: 2,
    expectedAnnualGenerationKwh: 7100,
    financingType: 'LOAN',
    interestRatePct: 8.5,
    tenureMonths: 36,
    downPayment: 50000,
    pricePerKwp: 53000,
    equipmentTier: 'STANDARD',
    valueScore: 82,
    scoreBreakdown: {
      price: 90,
      equipment: 78,
      warranty: 76,
      transparency: 84,
      weights: { price: 0.35, equipment: 0.25, warranty: 0.25, transparency: 0.15 },
    },
    redFlags: ['Inverter warranty is 7 years instead of recommended 10 years'],
    financedTotalCost: 298500,
    estimatedAnnualSavings: 46800,
    paybackYears: 4.6,
    generationSource: 'PLATFORM',
    monthlyPayment: 6770,
    isSelected: false,
    notes: 'Competitive upfront pricing, standard tier equipment with SBI Surya Ghar Solar Loan eligibility.',
    createdAt: '2026-08-30T16:00:00Z',
  },
  {
    id: 'quote-loom',
    installerName: 'Loom Solar Premium Integrator',
    systemSizeKwp: 5,
    totalPrice: 310000,
    currency: 'INR',
    panelBrand: 'Loom Solar Shark 550W Bifacial',
    panelTechnology: 'TOPCON',
    panelWattage: 550,
    panelProductWarrantyYears: 12,
    panelPerformanceWarrantyYears: 25,
    inverterBrand: 'Enphase IQ8+ Microinverters',
    inverterType: 'MICRO',
    inverterWarrantyYears: 15,
    workmanshipWarrantyYears: 5,
    includesNetMetering: true,
    includesStructure: true,
    includesAmcYears: 3,
    expectedAnnualGenerationKwh: 7600,
    financingType: 'CASH',
    interestRatePct: null,
    tenureMonths: null,
    downPayment: null,
    pricePerKwp: 62000,
    equipmentTier: 'PREMIUM',
    valueScore: 79,
    scoreBreakdown: {
      price: 68,
      equipment: 96,
      warranty: 94,
      transparency: 86,
      weights: { price: 0.35, equipment: 0.25, warranty: 0.25, transparency: 0.15 },
    },
    redFlags: ['High initial capital outlay (₹62,000/kWp) extending payback period'],
    financedTotalCost: 310000,
    estimatedAnnualSavings: 50100,
    paybackYears: 4.6,
    generationSource: 'INSTALLER',
    monthlyPayment: null,
    isSelected: false,
    notes: 'Microinverter architecture eliminates string shade losses. Outstanding generation but premium capital expenditure.',
    createdAt: '2026-09-02T10:45:00Z',
  },
];

// ── 7. Demo Quote Comparison ────────────────────────────────────────
export function buildDemoComparison(): Comparison {
  const quotes = getDemoQuotes();
  return {
    rows: quotes.map((q) => ({
      quoteId: q.id,
      installerName: q.installerName,
      systemSizeKwp: q.systemSizeKwp,
      totalPrice: q.totalPrice,
      pricePerKwp: q.pricePerKwp,
      equipmentTier: q.equipmentTier,
      panelSummary: `${q.panelBrand ?? 'Tier 1'} (${q.panelTechnology})`,
      inverterSummary: `${q.inverterBrand ?? 'Standard'} (${q.inverterType})`,
      panelProductWarrantyYears: q.panelProductWarrantyYears,
      inverterWarrantyYears: q.inverterWarrantyYears,
      workmanshipWarrantyYears: q.workmanshipWarrantyYears,
      includesNetMetering: q.includesNetMetering,
      includesStructure: q.includesStructure,
      financingType: q.financingType,
      financedTotalCost: q.financedTotalCost,
      estimatedAnnualGenerationKwh: q.expectedAnnualGenerationKwh ?? 7250,
      generationSource: q.generationSource,
      estimatedAnnualSavings: q.estimatedAnnualSavings,
      paybackYears: q.paybackYears,
      valueScore: q.valueScore,
      redFlagCount: q.redFlags.length,
      isSelected: q.isSelected,
    })),
    bestInColumn: {
      totalPrice: ['quote-waaree'],
      pricePerKwp: ['quote-waaree'],
      valueScore: ['quote-tata'],
      panelWarranty: ['quote-tata', 'quote-loom'],
      inverterWarranty: ['quote-loom'],
      workmanshipWarranty: ['quote-tata', 'quote-loom'],
    },
    recommendedQuoteId: 'quote-tata',
    context: {
      tariffPerKwh: 8.2,
      annualConsumptionKwh: 5820,
      source: 'BILLS',
      monthsOfBills: 12,
      note: 'Evaluated against 12 months verified BESCOM billing records and PM Surya Ghar benchmark capital costs.',
    },
    scoring: {
      weights: { price: 35, equipment: 25, warranty: 25, transparency: 15 },
      explanation: 'Scores weigh capital efficiency (35%), tier-1 components (25%), comprehensive warranty coverage (25%), and turnkey scope transparency (15%).',
    },
  };
}

// ── 8. Demo Project & Milestones ────────────────────────────────────
const INITIAL_PROJECT: Project = {
  id: 'proj-tata-5kwp',
  name: '5 kWp Rooftop Solar Installation',
  status: 'IN_PROGRESS',
  installerName: 'Tata Power Solar Systems',
  systemSizeKwp: 5,
  contractValue: 285000,
  currency: 'INR',
  sourceQuoteId: 'quote-tata',
  expectedAnnualGenerationKwh: 7350,
  baselineMonthlyUnits: 485,
  baselineTariffPerKwh: 8.2,
  commissionedDate: null,
  notes: 'Turnkey contract signed on 5th September. Engineering site survey confirmed 5 kWp south-facing layout.',
  createdAt: '2026-09-05T12:00:00Z',
  progressPercent: 55,
  currentStage: 'DISCOM Approval Pending',
  nextActions: [
    'DISCOM engineer site inspection scheduled for 8th October',
    'Procurement of bidirectional net-meter underway by installer',
    'Prepare PM Surya Ghar National Portal registration token',
  ],
  milestones: [
    { id: 'm-1', key: 'INQUIRY', title: 'Inquiry & Sizing Confirmed', sequence: 1, status: 'COMPLETED', plannedDate: '2026-09-01', completedDate: '2026-09-01', notes: 'Optimal 5 kWp design selected', ownerHint: 'Homeowner' },
    { id: 'm-2', key: 'SITE_SURVEY', title: 'Technical Roof Survey', sequence: 2, status: 'COMPLETED', plannedDate: '2026-09-08', completedDate: '2026-09-07', notes: 'Terrace load capacity and anchor points verified. Shading zero.', ownerHint: 'Installer' },
    { id: 'm-3', key: 'DESIGN_CONFIRMED', title: 'Engineering CAD & Electrical SLD', sequence: 3, status: 'COMPLETED', plannedDate: '2026-09-14', completedDate: '2026-09-13', notes: 'Single-line diagram approved for BESCOM interconnection', ownerHint: 'Installer' },
    { id: 'm-4', key: 'DISCOM_APPLICATION_SUBMITTED', title: 'BESCOM Net-Metering Application', sequence: 4, status: 'COMPLETED', plannedDate: '2026-09-20', completedDate: '2026-09-19', notes: 'Application reference: BES-SR-2026-98124', ownerHint: 'Installer' },
    { id: 'm-5', key: 'DISCOM_APPROVED', title: 'DISCOM Technical Feasibility Approval', sequence: 5, status: 'IN_PROGRESS', plannedDate: '2026-10-10', completedDate: null, notes: 'Feasibility sanctioned; site inspection awaiting BESCOM sub-division officer', ownerHint: 'DISCOM' },
    { id: 'm-6', key: 'INSTALLATION_SCHEDULED', title: 'Hardware Delivery & Mounting Structure', sequence: 6, status: 'NOT_STARTED', plannedDate: '2026-10-18', completedDate: null, notes: 'Elevated HDGI structure and 550W panels dispatched from warehouse', ownerHint: 'Installer' },
    { id: 'm-7', key: 'INSTALLATION_COMPLETE', title: 'Solar Array & Inverter Wiring', sequence: 7, status: 'NOT_STARTED', plannedDate: '2026-10-24', completedDate: null, notes: 'Earthing pits, lightning arrestor, and DC/AC junction boxes', ownerHint: 'Installer' },
    { id: 'm-8', key: 'NET_METERING_ACTIVE', title: 'Bi-directional Meter Testing & Commissioning', sequence: 8, status: 'NOT_STARTED', plannedDate: '2026-11-05', completedDate: null, notes: 'Joint inspection and meter sealing by DISCOM engineer', ownerHint: 'DISCOM' },
    { id: 'm-9', key: 'SUBSIDY_RECEIVED', title: 'PM Surya Ghar ₹78,000 Subsidy Credited', sequence: 9, status: 'NOT_STARTED', plannedDate: '2026-11-30', completedDate: null, notes: 'Direct DBT transfer into bank account linked to Aadhaar', ownerHint: 'MNRE' },
  ],
  _count: { generationLogs: 6, warranties: 3, serviceRequests: 0 },
};

// ── 9. Demo Warranties ──────────────────────────────────────────────
export const DEMO_WARRANTIES: Warranty[] = [
  {
    id: 'war-1',
    component: 'PANEL',
    brand: 'Tata Power Solar TP550',
    serialNumber: 'TPS-2026-TOP-88192',
    startDate: '2026-10-25',
    durationYears: 25,
    expiryDate: '2051-10-25',
    daysRemaining: 9140,
    notes: '25-year linear performance warranty. 12-year product materials & workmanship.',
    status: 'ACTIVE',
  },
  {
    id: 'war-2',
    component: 'INVERTER',
    brand: 'Growatt MIN 5000TL-X',
    serialNumber: 'GW-5K-9812481',
    startDate: '2026-10-25',
    durationYears: 10,
    expiryDate: '2036-10-25',
    daysRemaining: 3670,
    notes: '10-year comprehensive replacement warranty against hardware & electronics failure.',
    status: 'ACTIVE',
  },
  {
    id: 'war-3',
    component: 'STRUCTURE',
    brand: 'Tata Power Solar Elevated HDGI',
    serialNumber: 'HDGI-5K-019',
    startDate: '2026-10-25',
    durationYears: 10,
    expiryDate: '2036-10-25',
    daysRemaining: 3670,
    notes: 'Hot-dip galvanized structure rated to withstand 150 km/h wind speeds.',
    status: 'ACTIVE',
  },
];

// ── 10. Demo Documents ──────────────────────────────────────────────
const INITIAL_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'doc-bill-1',
    fileName: 'BESCOM_Electricity_Bill_Aug2026.pdf',
    category: 'BILL',
    sizeBytes: 420500,
    storageKey: 'demo/bills/bescom-aug2026.pdf',
    mimeType: 'application/pdf',
    description: 'August 2026 electricity bill showing 540 units consumption',
    createdAt: '2026-08-18T10:00:00Z',
    projectId: null,
    quoteId: null,
    milestoneId: null,
  },
  {
    id: 'doc-quote-1',
    fileName: 'Tata_Power_Solar_Detailed_Quotation.pdf',
    category: 'QUOTE',
    sizeBytes: 1240000,
    storageKey: 'demo/quotes/tata-solar-5kw.pdf',
    mimeType: 'application/pdf',
    description: 'Itemized BOM, electrical single line diagram and warranty certificate',
    createdAt: '2026-08-28T14:30:00Z',
    projectId: 'proj-tata-5kwp',
    quoteId: 'quote-tata',
    milestoneId: null,
  },
  {
    id: 'doc-approval-1',
    fileName: 'BESCOM_NetMetering_Sanction_Order.pdf',
    category: 'DISCOM_APPROVAL',
    sizeBytes: 680000,
    storageKey: 'demo/approvals/bescom-sanction.pdf',
    mimeType: 'application/pdf',
    description: 'Formal technical feasibility clearance from BESCOM sub-division',
    createdAt: '2026-09-22T16:00:00Z',
    projectId: 'proj-tata-5kwp',
    quoteId: null,
    milestoneId: 'm-4',
  },
  {
    id: 'doc-subsidy-1',
    fileName: 'PM_SuryaGhar_Acknowledgement_Receipt.pdf',
    category: 'SUBSIDY',
    sizeBytes: 310000,
    storageKey: 'demo/subsidy/pmsuryaghar-ack.pdf',
    mimeType: 'application/pdf',
    description: 'National Portal registration ID: PMSURYA-KA-2026-94812',
    createdAt: '2026-09-24T11:20:00Z',
    projectId: 'proj-tata-5kwp',
    quoteId: null,
    milestoneId: 'm-4',
  },
  {
    id: 'doc-warranty-1',
    fileName: 'Tata_Solar_25Y_Performance_Warranty_Card.pdf',
    category: 'WARRANTY',
    sizeBytes: 890000,
    storageKey: 'demo/warranty/tata-module-warranty.pdf',
    mimeType: 'application/pdf',
    description: '25-year module degradation guarantee card with serial numbers',
    createdAt: '2026-09-28T09:00:00Z',
    projectId: 'proj-tata-5kwp',
    quoteId: null,
    milestoneId: null,
  },
];

// ── 11. Demo Performance Projection ────────────────────────────────
export const DEMO_PERFORMANCE: Performance = {
  project: {
    id: 'proj-tata-5kwp',
    name: '5 kWp Rooftop Solar Installation',
    status: 'IN_PROGRESS',
    systemSizeKwp: 5,
    expectedAnnualGenerationKwh: 7350,
    baselineMonthlyUnits: 485,
    baselineTariffPerKwh: 8.2,
    commissionedDate: '2026-10-01',
  },
  months: [
    { month: '2026-08', monthLabel: 'Aug 2026', generatedKwh: 610, projectedKwh: 590, variancePercent: 3.4, savings: 5002, billAmount: 0, health: 'HEALTHY' },
    { month: '2026-07', monthLabel: 'Jul 2026', generatedKwh: 575, projectedKwh: 560, variancePercent: 2.7, savings: 4715, billAmount: 180, health: 'HEALTHY' },
    { month: '2026-06', monthLabel: 'Jun 2026', generatedKwh: 540, projectedKwh: 550, variancePercent: -1.8, savings: 4428, billAmount: 220, health: 'HEALTHY' },
    { month: '2026-05', monthLabel: 'May 2026', generatedKwh: 680, projectedKwh: 660, variancePercent: 3.0, savings: 5576, billAmount: 0, health: 'HEALTHY' },
    { month: '2026-04', monthLabel: 'Apr 2026', generatedKwh: 690, projectedKwh: 670, variancePercent: 3.0, savings: 5658, billAmount: 0, health: 'HEALTHY' },
    { month: '2026-03', monthLabel: 'Mar 2026', generatedKwh: 650, projectedKwh: 640, variancePercent: 1.6, savings: 5330, billAmount: 0, health: 'HEALTHY' },
  ],
  totalGeneratedKwh: 3745,
  totalProjectedKwh: 3670,
  overallVariancePercent: 2.0,
  totalSavings: 30709,
  averageMonthlySavings: 5118,
  health: 'HEALTHY',
  co2OffsetTonnes: 3.07,
  monthsLogged: 6,
  dataSource: {
    inverterSync: false,
    note: 'Estimated baseline and installer generation metrics',
    vendorsPlanned: ['Growatt', 'SolarEdge', 'Enphase'],
  },
  assumptions: {
    assumptionSetId: 'in-ka-bescom-v2',
    seasonality: [0.08, 0.085, 0.095, 0.1, 0.095, 0.075, 0.07, 0.075, 0.08, 0.085, 0.08, 0.08],
    disclaimer: 'Performance projections model normal Bengaluru solar insolation curves.',
  },
};


// ── Storage Accessors with Local Mutations ──────────────────────────

export function getDemoBills(): Bill[] {
  return loadFromStorage('bills', INITIAL_BILLS);
}

export function saveDemoBills(bills: Bill[]): void {
  saveToStorage('bills', bills);
}

export function getDemoRoofProfiles(): RoofProfile[] {
  return loadFromStorage('roof', INITIAL_ROOF);
}

export function saveDemoRoofProfiles(roofs: RoofProfile[]): void {
  saveToStorage('roof', roofs);
}

export function getDemoSizingRuns(): SizingRun[] {
  return loadFromStorage('sizing', INITIAL_SIZING_RUNS);
}

export function saveDemoSizingRuns(runs: SizingRun[]): void {
  saveToStorage('sizing', runs);
}

export function getDemoQuotes(): Quote[] {
  return loadFromStorage('quotes', INITIAL_QUOTES);
}

export function saveDemoQuotes(quotes: Quote[]): void {
  saveToStorage('quotes', quotes);
}

export function getDemoProjects(): Project[] {
  return loadFromStorage('projects', [INITIAL_PROJECT]);
}

export function saveDemoProjects(projects: Project[]): void {
  saveToStorage('projects', projects);
}

export function getDemoDocuments(): DocumentRecord[] {
  return loadFromStorage('documents', INITIAL_DOCUMENTS);
}

export function saveDemoDocuments(docs: DocumentRecord[]): void {
  saveToStorage('documents', docs);
}

export function resetDemoData(): void {
  if (typeof window === 'undefined') return;
  const keys = ['bills', 'roof', 'sizing', 'quotes', 'projects', 'documents'];
  for (const k of keys) {
    window.localStorage.removeItem(STORAGE_KEY_PREFIX + k);
  }
}

// ── Summary Builder for Dashboard ──────────────────────────────────
export function getDemoSummary(): Summary {
  const bills = getDemoBills();
  const quotes = getDemoQuotes();
  const projects = getDemoProjects();
  const sizing = getDemoSizingRuns();
  const documents = getDemoDocuments();
  const roof = getDemoRoofProfiles();

  const totalUnits = bills.reduce((acc, b) => acc + b.unitsKwh, 0);
  const avgUnits = bills.length > 0 ? Math.round(totalUnits / bills.length) : 0;
  const avgBill = bills.length > 0 ? Math.round(bills.reduce((acc, b) => acc + (b.billAmount ?? 0), 0) / bills.length) : 0;

  const selectedQuote = quotes.find((q) => q.isSelected) ?? quotes[0];
  const latestSizingRun = sizing[0];
  const optimalScenario = latestSizingRun?.scenarios.find((s) => s.key === 'OPTIMAL') ?? latestSizingRun?.scenarios[0];

  return {
    profile: DEMO_USER.profile ?? null,
    onboarding: {
      step: 5,
      completedAt: '2026-08-20T14:00:00Z',
      hasBills: bills.length > 0,
      hasRoof: roof.length > 0,
      hasSizing: sizing.length > 0,
      hasQuotes: quotes.length > 0,
      hasProject: projects.length > 0,
    },
    billStats: {
      monthsCounted: bills.length,
      avgMonthlyUnits: avgUnits,
      weightedTariffPerKwh: 8.2,
      avgMonthlyBill: avgBill,
      ready: bills.length >= 3,
    },
    counts: {
      bills: bills.length,
      roofProfiles: roof.length,
      quotes: quotes.length,
      projects: projects.length,
      documents: documents.length,
    },
    quoteInsights: {
      averagePricePerKwp: Math.round(quotes.reduce((acc, q) => acc + q.pricePerKwp, 0) / (quotes.length || 1)),
      bestValueScore: Math.max(...quotes.map((q) => q.valueScore)),
      selectedQuoteId: selectedQuote?.id ?? null,
    },
    latestSizing: optimalScenario
      ? {
          id: latestSizingRun.id,
          createdAt: latestSizingRun.createdAt,
          suitability: latestSizingRun.suitability,
          recommendedKwp: optimalScenario.systemSizeKwp,
          annualSavings: optimalScenario.annualSavings,
          paybackYears: optimalScenario.paybackYears,
        }
      : null,
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      installerName: p.installerName,
      systemSizeKwp: p.systemSizeKwp,
      progressPercent: p.progressPercent,
      currentStage: p.currentStage,
    })),
    nextActions: projects[0]?.nextActions ?? [
      'Upload the DISCOM acknowledgement receipt to your project documents',
      'Check net metering status with your DISCOM',
      'Review quote comparison details',
    ],
  };
}
