import { z } from 'zod';
import { paginationQuery } from '../../middleware/validate';
import { orientationSchema, roofTypeSchema, shadingSchema } from '../roof/schema';

/** Public estimate input (AC-A1): no user data, everything needed to compute in one call. */
export const estimateSchema = z.object({
  avgMonthlyUnits: z.coerce.number().positive('Enter your average monthly units').max(100000),
  tariffPerKwh: z.coerce.number().positive('Enter your tariff per unit').max(1000),
  roofType: roofTypeSchema.default('FLAT'),
  usableAreaSqft: z.coerce.number().positive('Enter usable roof area').max(100000),
  orientation: orientationSchema.default('S'),
  shadingLevel: shadingSchema.default('NONE'),
  assumptionSetId: z.string().trim().max(40).optional(),
});

/** Persisted run (AC-A15): either reference a saved roof profile or pass the roof fields inline. */
export const createRunSchema = estimateSchema.partial({
  roofType: true,
  usableAreaSqft: true,
  orientation: true,
  shadingLevel: true,
}).extend({
  roofProfileId: z.string().trim().min(1).optional(),
}).refine((v) => Boolean(v.roofProfileId) || (v.usableAreaSqft !== undefined && v.roofType !== undefined), {
  message: 'Pick a saved roof or provide roof type and usable area',
  path: ['roofProfileId'],
});

export const listRunsQuery = paginationQuery;

export type EstimateInput = z.infer<typeof estimateSchema>;
export type CreateRunInput = z.infer<typeof createRunSchema>;
