/**
 * Default YieldEngine: published-average rule model from `domain/sizing.ts` (NFR-X2).
 * A site-specific engine (PVGIS, PVWatts, Google Solar API) implements the same interface and is selected
 * via YIELD_ENGINE — see docs/integration-strategy.md §2.
 */
import { getAssumptionSet } from '../domain/assumptions';
import { computeSizing, type SizingResult } from '../domain/sizing';
import type { YieldEngine, YieldEngineRequest } from './types';

export class RuleBasedYieldEngine implements YieldEngine {
  readonly name = 'rule-based';
  readonly isSiteSpecific = false;

  async estimate(request: YieldEngineRequest): Promise<SizingResult> {
    const set = getAssumptionSet(request.assumptionSetId);
    return computeSizing(
      {
        avgMonthlyUnits: request.avgMonthlyUnits,
        tariffPerKwh: request.tariffPerKwh,
        roofType: request.roofType,
        usableAreaSqft: request.usableAreaSqft,
        orientation: request.orientation,
        shadingLevel: request.shadingLevel,
      },
      set,
    );
  }
}
