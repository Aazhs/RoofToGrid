import { z } from 'zod';
import { paginationQuery } from '../../middleware/validate';

export const projectStatusSchema = z.enum([
  'PLANNING',
  'IN_PROGRESS',
  'COMMISSIONED',
  'ON_HOLD',
  'CANCELLED',
]);

export const milestoneStatusSchema = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED']);

const isoDate = z.coerce.date();

/** Manual project creation, for homeowners who signed before finding RoofToGrid. */
export const createProjectSchema = z.object({
  name: z.string().trim().min(2, 'Give the project a name').max(160),
  installerName: z.string().trim().min(2, 'Enter the installer name').max(160),
  systemSizeKwp: z.coerce.number().positive('Enter the system size in kWp').max(1000),
  contractValue: z.coerce.number().positive('Enter the contract value').max(1_000_000_000),
  currency: z.string().trim().length(3).default('INR'),
  sourceQuoteId: z.string().trim().min(1).optional(),
  expectedAnnualGenerationKwh: z.coerce.number().int().min(0).max(10_000_000).optional(),
  baselineMonthlyUnits: z.coerce.number().min(0).max(100000).optional(),
  baselineTariffPerKwh: z.coerce.number().min(0).max(1000).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const fromQuoteSchema = z.object({
  name: z.string().trim().min(2).max(160).optional(),
});

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(2).max(160).optional(),
    status: projectStatusSchema.optional(),
    expectedAnnualGenerationKwh: z.coerce.number().int().min(0).max(10_000_000).nullish(),
    baselineMonthlyUnits: z.coerce.number().min(0).max(100000).nullish(),
    baselineTariffPerKwh: z.coerce.number().min(0).max(1000).nullish(),
    notes: z.string().trim().max(2000).nullish(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'Nothing to update' });

/** AC-C3 / AC-C4 */
export const updateMilestoneSchema = z
  .object({
    status: milestoneStatusSchema.optional(),
    plannedDate: isoDate.nullish(),
    completedDate: isoDate.nullish(),
    notes: z.string().trim().max(2000).nullish(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'Nothing to update' });

export const listProjectsQuery = paginationQuery.extend({
  status: projectStatusSchema.optional(),
});

export const projectIdParam = z.object({ id: z.string().min(1) });
export const milestoneParams = z.object({ id: z.string().min(1), milestoneId: z.string().min(1) });

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuery>;
