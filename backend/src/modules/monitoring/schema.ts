import { z } from 'zod';
import { billMonthSchema } from '../bills/schema';

export const warrantyComponentSchema = z.enum([
  'PANEL',
  'INVERTER',
  'STRUCTURE',
  'WORKMANSHIP',
  'BATTERY',
  'OTHER',
]);

export const severitySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export const serviceStatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED']);

/** AC-D1 — posting the same month again updates the row. */
export const upsertGenerationSchema = z.object({
  month: billMonthSchema,
  generatedKwh: z.coerce.number().min(0, 'Generation cannot be negative').max(1_000_000),
  billAmount: z.coerce.number().min(0).max(10_000_000).optional(),
  unitsImportedKwh: z.coerce.number().min(0).max(1_000_000).optional(),
  unitsExportedKwh: z.coerce.number().min(0).max(1_000_000).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const createWarrantySchema = z.object({
  component: warrantyComponentSchema,
  brand: z.string().trim().max(120).optional(),
  serialNumber: z.string().trim().max(120).optional(),
  startDate: z.coerce.date(),
  durationYears: z.coerce.number().positive('Enter the warranty length in years').max(40),
  documentId: z.string().trim().min(1).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const updateWarrantySchema = createWarrantySchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: 'Nothing to update' });

export const createServiceRequestSchema = z.object({
  title: z.string().trim().min(3, 'Describe the issue in a few words').max(160),
  description: z.string().trim().max(2000).optional(),
  severity: severitySchema.default('MEDIUM'),
});

export const updateServiceRequestSchema = z
  .object({
    status: serviceStatusSchema.optional(),
    severity: severitySchema.optional(),
    title: z.string().trim().min(3).max(160).optional(),
    description: z.string().trim().max(2000).nullish(),
    resolutionNotes: z.string().trim().max(2000).nullish(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'Nothing to update' });

export const projectScopedParams = z.object({ id: z.string().min(1) });
export const generationParams = z.object({ id: z.string().min(1), logId: z.string().min(1) });
export const warrantyParams = z.object({ id: z.string().min(1), warrantyId: z.string().min(1) });
export const serviceRequestParams = z.object({ id: z.string().min(1), requestId: z.string().min(1) });

export type UpsertGenerationInput = z.infer<typeof upsertGenerationSchema>;
export type CreateWarrantyInput = z.infer<typeof createWarrantySchema>;
export type UpdateWarrantyInput = z.infer<typeof updateWarrantySchema>;
export type CreateServiceRequestInput = z.infer<typeof createServiceRequestSchema>;
export type UpdateServiceRequestInput = z.infer<typeof updateServiceRequestSchema>;
