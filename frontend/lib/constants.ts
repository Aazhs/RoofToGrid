/**
 * Option lists and plain-language glosses.
 * NFR-U2: every piece of jargon gets a gloss the first time a user meets it.
 */
import type {
  DocumentCategory,
  EquipmentTier,
  FinancingType,
  HealthStatus,
  InverterType,
  MilestoneStatus,
  Orientation,
  PanelTechnology,
  ProjectStatus,
  RoofType,
  ShadingLevel,
  Suitability,
  WarrantyComponent,
} from './types';

export const GLOSSARY: Record<string, string> = {
  kWp: 'Kilowatt-peak — the rated size of a solar system in ideal sunlight. A 1 kWp system needs roughly 80–100 sqft of roof.',
  kWh: 'Kilowatt-hour, the "unit" on your electricity bill.',
  DISCOM: 'Distribution company — the utility that bills you and must approve a grid connection.',
  'net metering':
    'An arrangement where extra solar power you export runs your meter backwards, so you are billed only for the net units you draw.',
  'specific yield':
    'How many units a system produces per kWp per year in your area. We assume 1,450 kWh/kWp/year for India.',
  payback: 'How many years of savings it takes to recover what you spend after subsidy.',
  'value score':
    'Our 0–100 rating of a quote, weighing price per kWp, equipment quality, warranty cover and how transparent the scope is.',
  subsidy: 'PM Surya Ghar central financial assistance for residential rooftop solar.',
};

export const ROOF_TYPES: Array<{ value: RoofType; label: string; hint: string }> = [
  { value: 'FLAT', label: 'Flat / terrace', hint: 'RCC slab. Needs a raised structure, about 100 sqft per kWp.' },
  { value: 'SLOPED', label: 'Sloped / tiled', hint: 'Panels sit flush, about 80 sqft per kWp.' },
  { value: 'MIXED', label: 'Mixed', hint: 'Part flat, part sloped. About 90 sqft per kWp.' },
];

export const ORIENTATIONS: Array<{ value: Orientation; label: string }> = [
  { value: 'S', label: 'South (best)' },
  { value: 'SE', label: 'South-east' },
  { value: 'SW', label: 'South-west' },
  { value: 'E', label: 'East' },
  { value: 'W', label: 'West' },
  { value: 'NE', label: 'North-east' },
  { value: 'NW', label: 'North-west' },
  { value: 'N', label: 'North (weakest)' },
];

export const SHADING_LEVELS: Array<{ value: ShadingLevel; label: string; hint: string }> = [
  { value: 'NONE', label: 'None', hint: 'Open roof, sun all day.' },
  { value: 'LIGHT', label: 'Light', hint: 'Brief shade from a parapet or small tree.' },
  { value: 'MODERATE', label: 'Moderate', hint: 'A few hours of shade from a tower or large tree.' },
  { value: 'HEAVY', label: 'Heavy', hint: 'Shaded most of the day.' },
];

export const PROPERTY_TYPES = [
  { value: 'INDEPENDENT_HOUSE', label: 'Independent house' },
  { value: 'ROW_HOUSE', label: 'Row house' },
  { value: 'APARTMENT', label: 'Apartment / society' },
  { value: 'COMMERCIAL', label: 'Commercial' },
];

export const PANEL_TECHNOLOGIES: Array<{ value: PanelTechnology; label: string }> = [
  { value: 'TOPCON', label: 'TOPCon (newer, higher output)' },
  { value: 'HJT', label: 'HJT (premium)' },
  { value: 'N_TYPE', label: 'N-type' },
  { value: 'MONO_PERC', label: 'Mono PERC (mainstream)' },
  { value: 'POLY', label: 'Polycrystalline (older)' },
  { value: 'THIN_FILM', label: 'Thin film' },
  { value: 'UNKNOWN', label: 'Not stated in the quote' },
];

export const INVERTER_TYPES: Array<{ value: InverterType; label: string }> = [
  { value: 'STRING', label: 'String inverter (most common)' },
  { value: 'MICRO', label: 'Microinverters' },
  { value: 'HYBRID', label: 'Hybrid (battery ready)' },
  { value: 'UNKNOWN', label: 'Not stated in the quote' },
];

export const FINANCING_TYPES: Array<{ value: FinancingType; label: string }> = [
  { value: 'CASH', label: 'Cash / self funded' },
  { value: 'LOAN', label: 'Loan or EMI' },
  { value: 'LEASE_PPA', label: 'Lease or power purchase agreement' },
];

export const DOCUMENT_CATEGORIES: Array<{ value: DocumentCategory; label: string }> = [
  { value: 'BILL', label: 'Electricity bill' },
  { value: 'QUOTE', label: 'Installer quote' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'DESIGN_DRAWING', label: 'Design / drawing' },
  { value: 'DISCOM_APPROVAL', label: 'DISCOM approval' },
  { value: 'NET_METERING', label: 'Net metering' },
  { value: 'SUBSIDY', label: 'Subsidy' },
  { value: 'WARRANTY', label: 'Warranty' },
  { value: 'INVOICE', label: 'Invoice' },
  { value: 'PHOTO', label: 'Photo' },
  { value: 'OTHER', label: 'Other' },
];

export const WARRANTY_COMPONENTS: Array<{ value: WarrantyComponent; label: string }> = [
  { value: 'PANEL', label: 'Panels' },
  { value: 'INVERTER', label: 'Inverter' },
  { value: 'STRUCTURE', label: 'Mounting structure' },
  { value: 'WORKMANSHIP', label: 'Workmanship' },
  { value: 'BATTERY', label: 'Battery' },
  { value: 'OTHER', label: 'Other' },
];

export const MILESTONE_STATUSES: Array<{ value: MilestoneStatus; label: string }> = [
  { value: 'NOT_STARTED', label: 'Not started' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'BLOCKED', label: 'Blocked' },
];

export const SEVERITIES = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

export const SERVICE_STATUSES = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const SUITABILITY_COPY: Record<Suitability, { label: string; tone: 'good' | 'warn' | 'bad' }> = {
  EXCELLENT: { label: 'Excellent fit', tone: 'good' },
  GOOD: { label: 'Good fit', tone: 'good' },
  FAIR: { label: 'Workable', tone: 'warn' },
  POOR: { label: 'Challenging', tone: 'warn' },
  UNSUITABLE: { label: 'Not suitable yet', tone: 'bad' },
};

export const TIER_COPY: Record<EquipmentTier, string> = {
  PREMIUM: 'Premium',
  STANDARD: 'Standard',
  BASIC: 'Basic',
};

export const PROJECT_STATUS_COPY: Record<ProjectStatus, string> = {
  PLANNING: 'Planning',
  IN_PROGRESS: 'In progress',
  COMMISSIONED: 'Commissioned',
  ON_HOLD: 'On hold',
  CANCELLED: 'Cancelled',
};

export const HEALTH_COPY: Record<HealthStatus, { label: string; tone: 'good' | 'warn' | 'bad' | 'muted' }> = {
  HEALTHY: { label: 'On track', tone: 'good' },
  WATCH: { label: 'Slightly below', tone: 'warn' },
  UNDERPERFORMING: { label: 'Underperforming', tone: 'bad' },
  NO_DATA: { label: 'No data yet', tone: 'muted' },
};

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/onboarding', label: 'Get started' },
  { href: '/bills', label: 'Bills' },
  { href: '/roof', label: 'Roof' },
  { href: '/sizing', label: 'Sizing' },
  { href: '/quotes', label: 'Quotes' },
  { href: '/projects', label: 'Projects' },
  { href: '/documents', label: 'Documents' },
  { href: '/profile', label: 'Profile' },
];
