/** Shared API response shapes. Mirrors backend/src/domain and Prisma models (docs/design.md §2). */

export type UserRole = 'HOMEOWNER' | 'INSTALLER' | 'ADMIN';
export type RoofType = 'FLAT' | 'SLOPED' | 'MIXED';
export type Orientation = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
export type ShadingLevel = 'NONE' | 'LIGHT' | 'MODERATE' | 'HEAVY';
export type Suitability = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'UNSUITABLE';
export type ScenarioKey = 'CONSERVATIVE' | 'OPTIMAL' | 'MAX_ROOF';
export type EquipmentTier = 'BASIC' | 'STANDARD' | 'PREMIUM';
export type FinancingType = 'CASH' | 'LOAN' | 'LEASE_PPA';
export type GenerationSource = 'INSTALLER' | 'PLATFORM';
export type PanelTechnology =
  | 'MONO_PERC'
  | 'TOPCON'
  | 'HJT'
  | 'N_TYPE'
  | 'POLY'
  | 'THIN_FILM'
  | 'UNKNOWN';
export type InverterType = 'STRING' | 'MICRO' | 'HYBRID' | 'UNKNOWN';
export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'COMMISSIONED' | 'ON_HOLD' | 'CANCELLED';
export type MilestoneStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
export type MilestoneKey =
  | 'INQUIRY'
  | 'SITE_SURVEY'
  | 'DESIGN_CONFIRMED'
  | 'DISCOM_APPLICATION_SUBMITTED'
  | 'DISCOM_APPROVED'
  | 'INSTALLATION_SCHEDULED'
  | 'INSTALLATION_COMPLETE'
  | 'NET_METERING_ACTIVE'
  | 'SUBSIDY_RECEIVED';
export type DocumentCategory =
  | 'BILL'
  | 'QUOTE'
  | 'CONTRACT'
  | 'DESIGN_DRAWING'
  | 'DISCOM_APPROVAL'
  | 'NET_METERING'
  | 'SUBSIDY'
  | 'WARRANTY'
  | 'INVOICE'
  | 'PHOTO'
  | 'OTHER';
export type WarrantyComponent = 'PANEL' | 'INVERTER' | 'STRUCTURE' | 'WORKMANSHIP' | 'BATTERY' | 'OTHER';
export type ServiceSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ServiceStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
export type HealthStatus = 'HEALTHY' | 'WATCH' | 'UNDERPERFORMING' | 'NO_DATA';
export type WarrantyStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
  profile?: Profile | null;
}

export interface Profile {
  id: string;
  userId: string;
  city: string | null;
  state: string | null;
  pincode: string | null;
  discomName: string | null;
  consumerNumber: string | null;
  phone: string | null;
  propertyType: string | null;
  currency: string;
  region: string;
  onboardingStep: number;
  onboardingCompletedAt: string | null;
}

export interface AuthPayload {
  user: User;
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
}

export interface Bill {
  id: string;
  billMonth: string;
  unitsKwh: number;
  billAmount: number | null;
  tariffPerKwh: number;
  sanctionedLoadKw: number | null;
  connectionType: string | null;
  notes: string | null;
  documentId: string | null;
}

export interface BillStats {
  monthsCounted: number;
  avgMonthlyUnits: number;
  weightedTariffPerKwh: number;
  avgMonthlyBill: number | null;
  ready: boolean;
}

export interface RoofProfile {
  id: string;
  label: string;
  roofType: RoofType;
  usableAreaSqft: number;
  orientation: Orientation;
  tiltDegrees: number | null;
  shadingLevel: ShadingLevel;
  structureType: string | null;
  notes: string | null;
  isPrimary: boolean;
  estimatedCapacityKwp: number;
}

export interface Assumptions {
  assumptionSetId: string;
  label: string;
  region: string;
  currency: string;
  specificYieldKwhPerKwp: number;
  areaPerKwpSqft: Record<RoofType, number>;
  shadingDerate: Record<ShadingLevel, number>;
  orientationFactor: Record<Orientation, number>;
  costPerKwpBands: Array<{ maxKwp: number | null; costPerKwp: number }>;
  subsidy: {
    programme: string;
    perKwFirst2Kw: number;
    thirdKwAmount: number;
    capAmount: number;
    minSystemKwp: number;
  };
  tariffEscalationPct: number;
  degradationPctPerYear: number;
  co2KgPerKwh: number;
  selfConsumptionRatio: number;
  analysisPeriodYears: number;
  disclaimer: string;
  yieldEngine?: { name: string; siteSpecific: boolean };
  subsidyProgramme?: { name: string; rules: string[]; live: boolean };
}

export interface Scenario {
  key: ScenarioKey;
  label: string;
  systemSizeKwp: number;
  annualGenerationKwh: number;
  monthlyGenerationKwh: number;
  estimatedCost: number;
  subsidyAmount: number;
  netCost: number;
  annualSavings: number;
  monthlySavings: number;
  paybackYears: number | null;
  lifetimeSavings25y: number;
  co2OffsetTonnesPerYear: number;
  roofAreaRequiredSqft: number;
  offsetPercent: number;
  notes: string;
}

export interface SizingResult {
  suitability: Suitability;
  suitabilityReasons: string[];
  roofCapacityKwp: number;
  loadBasedKwp: number;
  annualConsumptionKwh: number;
  scenarios: Scenario[];
  assumptions: Assumptions;
  assumptionSetId: string;
  yieldEngine: string;
}

export interface SizingRun {
  id: string;
  createdAt: string;
  avgMonthlyUnits: number;
  tariffPerKwh: number;
  suitability: Suitability;
  suitabilityReasons: string[];
  roofCapacityKwp: number;
  assumptionSetId: string;
  assumptions: Assumptions;
  roofProfile?: RoofProfile | null;
  scenarios: Array<Scenario & { id: string }>;
}

export interface ScoreBreakdown {
  price: number;
  equipment: number;
  warranty: number;
  transparency: number;
  weights: { price: number; equipment: number; warranty: number; transparency: number };
}

export interface Quote {
  id: string;
  installerName: string;
  systemSizeKwp: number;
  totalPrice: number;
  currency: string;
  panelBrand: string | null;
  panelTechnology: PanelTechnology;
  panelWattage: number | null;
  panelProductWarrantyYears: number;
  panelPerformanceWarrantyYears: number;
  inverterBrand: string | null;
  inverterType: InverterType;
  inverterWarrantyYears: number;
  workmanshipWarrantyYears: number;
  includesNetMetering: boolean;
  includesStructure: boolean;
  includesAmcYears: number;
  expectedAnnualGenerationKwh: number | null;
  financingType: FinancingType;
  interestRatePct: number | null;
  tenureMonths: number | null;
  downPayment: number | null;
  pricePerKwp: number;
  equipmentTier: EquipmentTier;
  valueScore: number;
  scoreBreakdown: ScoreBreakdown;
  redFlags: string[];
  financedTotalCost: number;
  estimatedAnnualSavings: number;
  paybackYears: number | null;
  generationSource: GenerationSource;
  monthlyPayment: number | null;
  isSelected: boolean;
  notes: string | null;
  createdAt: string;
}

export interface ComparisonRow {
  quoteId: string;
  installerName: string;
  systemSizeKwp: number;
  totalPrice: number;
  pricePerKwp: number;
  equipmentTier: EquipmentTier;
  panelSummary: string;
  inverterSummary: string;
  panelProductWarrantyYears: number;
  inverterWarrantyYears: number;
  workmanshipWarrantyYears: number;
  includesNetMetering: boolean;
  includesStructure: boolean;
  financingType: FinancingType;
  financedTotalCost: number;
  estimatedAnnualGenerationKwh: number;
  generationSource: GenerationSource;
  estimatedAnnualSavings: number;
  paybackYears: number | null;
  valueScore: number;
  redFlagCount: number;
  isSelected: boolean;
}

export interface Comparison {
  rows: ComparisonRow[];
  bestInColumn: Record<string, string[]>;
  recommendedQuoteId: string | null;
  context: {
    tariffPerKwh: number;
    annualConsumptionKwh: number;
    source: 'BILLS' | 'FALLBACK';
    monthsOfBills: number;
    note: string;
  };
  scoring: { weights: Record<string, number>; explanation: string };
}

export interface Milestone {
  id: string;
  key: MilestoneKey;
  title: string;
  sequence: number;
  status: MilestoneStatus;
  plannedDate: string | null;
  completedDate: string | null;
  notes: string | null;
  ownerHint: string | null;
  help?: string | null;
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  installerName: string;
  systemSizeKwp: number;
  contractValue: number;
  currency: string;
  sourceQuoteId: string | null;
  expectedAnnualGenerationKwh: number | null;
  baselineMonthlyUnits: number | null;
  baselineTariffPerKwh: number | null;
  commissionedDate: string | null;
  notes: string | null;
  createdAt: string;
  milestones: Milestone[];
  documents?: DocumentRecord[];
  progressPercent: number;
  currentStage: string;
  nextActions: string[];
  _count?: { generationLogs: number; warranties: number; serviceRequests: number };
}

export interface GenerationLog {
  id: string;
  month: string;
  generatedKwh: number;
  billAmount: number | null;
  unitsImportedKwh: number | null;
  unitsExportedKwh: number | null;
  notes: string | null;
}

export interface PerformanceMonth {
  month: string;
  monthLabel: string;
  generatedKwh: number;
  projectedKwh: number;
  variancePercent: number | null;
  savings: number;
  billAmount: number | null;
  health: HealthStatus;
}

export interface Performance {
  project: {
    id: string;
    name: string;
    status: ProjectStatus;
    systemSizeKwp: number;
    expectedAnnualGenerationKwh: number | null;
    baselineMonthlyUnits: number | null;
    baselineTariffPerKwh: number | null;
    commissionedDate: string | null;
  };
  months: PerformanceMonth[];
  totalGeneratedKwh: number;
  totalProjectedKwh: number;
  overallVariancePercent: number | null;
  totalSavings: number;
  averageMonthlySavings: number;
  health: HealthStatus;
  co2OffsetTonnes: number;
  monthsLogged: number;
  dataSource: { inverterSync: boolean; note: string; vendorsPlanned: string[] };
  assumptions: { assumptionSetId: string; seasonality: number[]; disclaimer: string };
}

export interface Warranty {
  id: string;
  component: WarrantyComponent;
  brand: string | null;
  serialNumber: string | null;
  startDate: string;
  durationYears: number;
  notes: string | null;
  status: WarrantyStatus;
  expiryDate: string;
  daysRemaining: number;
}

export interface ServiceRequest {
  id: string;
  title: string;
  description: string | null;
  severity: ServiceSeverity;
  status: ServiceStatus;
  raisedAt: string;
  resolvedAt: string | null;
  resolutionNotes: string | null;
}

export interface DocumentRecord {
  id: string;
  category: DocumentCategory;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  description: string | null;
  projectId: string | null;
  milestoneId: string | null;
  quoteId: string | null;
  createdAt: string;
  project?: { id: string; name: string } | null;
  milestone?: { id: string; title: string } | null;
}

export interface Summary {
  profile: Profile | null;
  onboarding: {
    step: number;
    completedAt: string | null;
    hasBills: boolean;
    hasRoof: boolean;
    hasSizing: boolean;
    hasQuotes: boolean;
    hasProject: boolean;
  };
  billStats: BillStats;
  counts: { bills: number; roofProfiles: number; quotes: number; projects: number; documents: number };
  quoteInsights: {
    averagePricePerKwp: number | null;
    bestValueScore: number | null;
    selectedQuoteId: string | null;
  };
  latestSizing: {
    id: string;
    createdAt: string;
    suitability: Suitability;
    recommendedKwp: number | null;
    annualSavings: number | null;
    paybackYears: number | null;
  } | null;
  projects: Array<{
    id: string;
    name: string;
    status: ProjectStatus;
    installerName: string;
    systemSizeKwp: number;
    progressPercent: number;
    currentStage: string;
  }>;
  nextActions: string[];
}
