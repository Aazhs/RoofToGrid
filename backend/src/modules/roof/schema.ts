import { z } from 'zod';
import { paginationQuery } from '../../middleware/validate';

export const roofTypeSchema = z.enum(['FLAT', 'SLOPED', 'MIXED']);
export const orientationSchema = z.enum(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']);
export const shadingSchema = z.enum(['NONE', 'LIGHT', 'MODERATE', 'HEAVY']);

export const createRoofSchema = z.object({
  label: z.string().trim().min(1).max(120).default('My roof'),
  roofType: roofTypeSchema,
  usableAreaSqft: z.coerce
    .number()
    .positive('Enter the usable roof area in square feet')
    .max(100000),
  orientation: orientationSchema.default('S'),
  tiltDegrees: z.coerce.number().min(0).max(60).optional(),
  shadingLevel: shadingSchema.default('NONE'),
  structureType: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(1000).optional(),
  isPrimary: z.boolean().default(false),
});

export const updateRoofSchema = createRoofSchema.partial();
export const listRoofQuery = paginationQuery;

export type CreateRoofInput = z.infer<typeof createRoofSchema>;
export type UpdateRoofInput = z.infer<typeof updateRoofSchema>;
