/** Provider registry. Selection is environment-driven so services never name a vendor (NFR-X3). */
import { env } from '../config/env';
import { RuleBasedYieldEngine } from './ruleBasedYieldEngine';
import {
  ConsoleNotificationProvider,
  NoopBillParser,
  NoopInverterMonitoringProvider,
  NoopQuoteParser,
  StaticDiscomProvider,
  StaticSubsidyProvider,
} from './stubs';
import type {
  BillParser,
  DiscomProvider,
  InverterMonitoringProvider,
  NotificationProvider,
  QuoteParser,
  SubsidyProvider,
  YieldEngine,
} from './types';

let yieldEngine: YieldEngine | null = null;

export function getYieldEngine(): YieldEngine {
  if (!yieldEngine) {
    switch (env.YIELD_ENGINE) {
      // 'pvgis' / 'pvwatts' land here once implemented (docs/integration-strategy.md §2).
      case 'pvgis':
      case 'pvwatts':
      case 'rule-based':
      default:
        yieldEngine = new RuleBasedYieldEngine();
    }
  }
  return yieldEngine;
}

export const discomProvider: DiscomProvider = new StaticDiscomProvider();
export const subsidyProvider: SubsidyProvider = new StaticSubsidyProvider();
export const inverterMonitoringProvider: InverterMonitoringProvider = new NoopInverterMonitoringProvider();
export const billParser: BillParser = new NoopBillParser();
export const quoteParser: QuoteParser = new NoopQuoteParser();
export const notificationProvider: NotificationProvider = new ConsoleNotificationProvider();

/** Surfaced by GET /api/v1/integrations so the UI can label seams honestly. */
export function integrationStatus() {
  return {
    yieldEngine: { name: getYieldEngine().name, siteSpecific: getYieldEngine().isSiteSpecific, live: false },
    discom: { name: discomProvider.name, live: false },
    subsidy: { name: subsidyProvider.name, live: false },
    inverterMonitoring: {
      name: inverterMonitoringProvider.name,
      live: inverterMonitoringProvider.connected,
      vendorsPlanned: inverterMonitoringProvider.listVendors(),
    },
    billParser: { name: billParser.name, live: false },
    quoteParser: { name: quoteParser.name, live: false },
    notifications: { name: notificationProvider.name, live: notificationProvider.enabled },
    storageDriver: env.STORAGE_DRIVER,
  };
}

export * from './types';
