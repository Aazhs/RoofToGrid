/**
 * Integration seams (NFR-X2). Each interface has a working stub today and a documented real target in
 * `docs/integration-strategy.md`. Adding a vendor is additive: implement the interface, register it in
 * `integrations/index.ts`, flip an env var (NFR-X3).
 */
import type { SizingInput, SizingResult } from '../domain/sizing';

// ------------------------------------------------------------------ yield

export interface YieldEngineRequest extends SizingInput {
  assumptionSetId?: string;
  region?: string;
  latitude?: number; // used by PVGIS / PVWatts later
  longitude?: number;
  tiltDegrees?: number;
}

export interface YieldEngine {
  readonly name: string;
  /** true once a provider does real irradiance simulation rather than published averages. */
  readonly isSiteSpecific: boolean;
  estimate(request: YieldEngineRequest): Promise<SizingResult>;
}

// ------------------------------------------------------------------ DISCOM

export interface DiscomApplicationStatus {
  supported: boolean;
  reference?: string;
  stage?: string;
  updatedAt?: string;
  message: string;
}

export interface DiscomProvider {
  readonly name: string;
  /** Static directory lookup today; portal API later. */
  lookupByPincode(pincode: string): Promise<{ discomName: string | null; state: string | null; message: string }>;
  getApplicationStatus(consumerNumber: string): Promise<DiscomApplicationStatus>;
}

// ------------------------------------------------------------------ subsidy

export interface SubsidyEstimate {
  programme: string;
  amount: number;
  currency: string;
  eligible: boolean;
  rules: string[];
  live: boolean;
}

export interface SubsidyProvider {
  readonly name: string;
  estimate(systemSizeKwp: number, region: string): Promise<SubsidyEstimate>;
  getApplicationStatus(reference: string): Promise<{ supported: boolean; message: string }>;
}

// ------------------------------------------------------------------ inverter monitoring

export interface InverterReading {
  month: string; // YYYY-MM
  generatedKwh: number;
}

export interface InverterMonitoringProvider {
  readonly name: string;
  readonly connected: boolean;
  listVendors(): string[];
  fetchMonthlyGeneration(projectId: string): Promise<{ supported: boolean; readings: InverterReading[]; message: string }>;
}

// ------------------------------------------------------------------ document parsing

export interface ParsedBill {
  supported: boolean;
  billMonth?: string;
  unitsKwh?: number;
  billAmount?: number;
  tariffPerKwh?: number;
  confidence?: number;
  message: string;
}

export interface ParsedQuote {
  supported: boolean;
  installerName?: string;
  systemSizeKwp?: number;
  totalPrice?: number;
  confidence?: number;
  message: string;
}

export interface BillParser {
  readonly name: string;
  parse(documentId: string): Promise<ParsedBill>;
}

export interface QuoteParser {
  readonly name: string;
  parse(documentId: string): Promise<ParsedQuote>;
}

// ------------------------------------------------------------------ notifications

export interface NotificationProvider {
  readonly name: string;
  readonly enabled: boolean;
  send(input: {
    to: string;
    template: string;
    data?: Record<string, unknown>;
  }): Promise<{ delivered: boolean; message: string }>;
}
