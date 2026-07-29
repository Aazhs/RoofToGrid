/**
 * Stub implementations of the remaining integration seams (NFR-X2).
 * Each returns an honest "not wired yet" answer instead of throwing, so UI can show the seam without
 * pretending data exists. Real targets are listed in docs/integration-strategy.md.
 */
import { IN_2026_07, subsidyForSize } from '../domain/assumptions';
import type {
  BillParser,
  DiscomApplicationStatus,
  DiscomProvider,
  InverterMonitoringProvider,
  NotificationProvider,
  ParsedBill,
  ParsedQuote,
  QuoteParser,
  SubsidyEstimate,
  SubsidyProvider,
} from './types';

/** Minimal static directory. Phase 2 replaces this with a DISCOM registry + portal APIs. */
const PINCODE_PREFIX_TO_DISCOM: Array<{ prefix: string; discomName: string; state: string }> = [
  { prefix: '11', discomName: 'BSES Rajdhani / Tata Power DDL', state: 'Delhi' },
  { prefix: '20', discomName: 'PVVNL', state: 'Uttar Pradesh' },
  { prefix: '30', discomName: 'JVVNL', state: 'Rajasthan' },
  { prefix: '38', discomName: 'Torrent Power / MGVCL', state: 'Gujarat' },
  { prefix: '40', discomName: 'Adani Electricity / MSEDCL', state: 'Maharashtra' },
  { prefix: '41', discomName: 'MSEDCL', state: 'Maharashtra' },
  { prefix: '50', discomName: 'TGSPDCL', state: 'Telangana' },
  { prefix: '56', discomName: 'BESCOM', state: 'Karnataka' },
  { prefix: '60', discomName: 'TANGEDCO', state: 'Tamil Nadu' },
  { prefix: '68', discomName: 'KSEB', state: 'Kerala' },
  { prefix: '70', discomName: 'CESC / WBSEDCL', state: 'West Bengal' },
];

export class StaticDiscomProvider implements DiscomProvider {
  readonly name = 'static-directory';

  async lookupByPincode(pincode: string) {
    const match = PINCODE_PREFIX_TO_DISCOM.find((row) => pincode.startsWith(row.prefix));
    return match
      ? {
          discomName: match.discomName,
          state: match.state,
          message: 'Best-effort match from a static directory. Please confirm from your bill.',
        }
      : {
          discomName: null,
          state: null,
          message: 'We could not match this pincode. Enter the DISCOM name printed on your bill.',
        };
  }

  async getApplicationStatus(): Promise<DiscomApplicationStatus> {
    return {
      supported: false,
      message:
        'Live DISCOM application tracking is not connected yet. Update the DISCOM milestones manually for now.',
    };
  }
}

export class StaticSubsidyProvider implements SubsidyProvider {
  readonly name = 'pm-surya-ghar-static';

  async estimate(systemSizeKwp: number, region: string): Promise<SubsidyEstimate> {
    if (region !== 'IN') {
      return {
        programme: 'None configured',
        amount: 0,
        currency: 'INR',
        eligible: false,
        rules: [`No subsidy rules loaded for region ${region}.`],
        live: false,
      };
    }
    const amount = subsidyForSize(systemSizeKwp);
    return {
      programme: IN_2026_07.subsidy.programme,
      amount,
      currency: IN_2026_07.currency,
      eligible: amount > 0,
      rules: [
        `₹${IN_2026_07.subsidy.perKwFirst2Kw.toLocaleString('en-IN')} per kW for the first 2 kW`,
        `₹${IN_2026_07.subsidy.thirdKwAmount.toLocaleString('en-IN')} for the 3rd kW`,
        `Capped at ₹${IN_2026_07.subsidy.capAmount.toLocaleString('en-IN')}`,
        'Residential rooftop only, subject to DISCOM empanelment and verification.',
      ],
      live: false,
    };
  }

  async getApplicationStatus() {
    return {
      supported: false,
      message: 'Subsidy disbursement status will come from the national portal in a later phase.',
    };
  }
}

export class NoopInverterMonitoringProvider implements InverterMonitoringProvider {
  readonly name = 'manual-entry';
  readonly connected = false;

  listVendors(): string[] {
    return ['SolarEdge', 'Growatt', 'Deye', 'Sungrow', 'Enphase', 'Smart meter (DLMS)'];
  }

  async fetchMonthlyGeneration() {
    return {
      supported: false,
      readings: [],
      message:
        'Automatic inverter sync is not connected yet. Enter monthly generation from your inverter app or meter.',
    };
  }
}

export class NoopBillParser implements BillParser {
  readonly name = 'noop';
  async parse(): Promise<ParsedBill> {
    return {
      supported: false,
      message: 'Bill reading is manual in this version. Your uploaded bill is stored for reference.',
    };
  }
}

export class NoopQuoteParser implements QuoteParser {
  readonly name = 'noop';
  async parse(): Promise<ParsedQuote> {
    return {
      supported: false,
      message: 'Quote PDF extraction arrives in Phase 2. Enter the quote details in the form for now.',
    };
  }
}

export class ConsoleNotificationProvider implements NotificationProvider {
  readonly name = 'console';
  readonly enabled = false;

  async send(input: { to: string; template: string }) {
    return {
      delivered: false,
      message: `Notification "${input.template}" for ${input.to} was not sent: no provider configured.`,
    };
  }
}
