import { z } from 'zod';
import { paginationQuery } from '../../middleware/validate';

export const panelTechnologySchema = z.enum([
  'MONO_PERC',
  'TOPCON',
  'HJT',
  'N_TYPE',
  'POLY',
  'THIN_FILM',
  'UNKNOWN',
]);
export const inverterTypeSchema = z.enum(['STRING', 'MICRO', 'HYBRID', 'UNKNOWN']);
export const financingTypeSchema = z.enum(['CASH', 'LOAN', 'LEASE_PPA']);

const warrantyYears = z.coerce.number().min(0).max(40);

/** Field definitions shared by create (all required defaults applied) and update (partial). */
export const quoteFields = z.object({
  installerName: z.string().trim().min(2, 'Enter the installer name').max(160),
  systemSizeKwp: z.coerce.number().positive('Enter the system size in kWp').max(1000),
  totalPrice: z.coerce.number().positive('Enter the total quoted price').max(1_000_000_000),
  currency: z.string().trim().length(3).default('INR'),

  panelBrand: z.string().trim().max(120).optional(),
  panelTechnology: panelTechnologySchema.default('UNKNOWN'),
  panelWattage: z.coerce.number().int().min(50).max(1200).optional(),
  panelProductWarrantyYears: warrantyYears.default(0),
  panelPerformanceWarrantyYears: warrantyYears.default(0),

  inverterBrand: z.string().trim().max(120).optional(),
  inverterType: inverterTypeSchema.default('UNKNOWN'),
  inverterWarrantyYears: warrantyYears.default(0),
  workmanshipWarrantyYears: warrantyYears.default(0),

  includesNetMetering: z.boolean().default(false),
  includesStructure: z.boolean().default(false),
  includesAmcYears: warrantyYears.default(0),

  expectedAnnualGenerationKwh: z.coerce.number().int().min(0).max(10_000_000).optional(),

  financingType: financingTypeSchema.default('CASH'),
  interestRatePct: z.coerce.number().min(0).max(60).optional(),
  tenureMonths: z.coerce.number().int().min(1).max(360).optional(),
  downPayment: z.coerce.number().min(0).max(1_000_000_000).optional(),

  quoteDocumentId: z.string().trim().min(1).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const createQuoteSchema = quoteFields
  // AC-B7: EMI math needs both inputs, so ask for them together rather than guessing.
  .refine(
    (v) => v.financingType === 'CASH' || (v.tenureMonths !== undefined && v.interestRatePct !== undefined),
    {
      message: 'For loan or lease quotes, enter both the interest rate and the tenure in months',
      path: ['tenureMonths'],
    },
  )
  .refine((v) => (v.downPayment ?? 0) <= v.totalPrice, {
    message: 'Down payment cannot exceed the total price',
    path: ['downPayment'],
  });

export const updateQuoteSchema = quoteFields
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: 'Nothing to update' });

export const listQuotesQuery = paginationQuery.extend({
  sort: z.enum(['valueScore', 'pricePerKwp', 'createdAt', 'paybackYears']).default('valueScore'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;
export type ListQuotesQuery = z.infer<typeof listQuotesQuery>;
