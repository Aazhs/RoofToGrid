import { z } from 'zod';
import { paginationQuery } from '../../middleware/validate';

export const billMonthSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use the format YYYY-MM');

/** AC-A5 — units are mandatory; tariff is derived from amount ÷ units when omitted. */
const baseBill = z.object({
  billMonth: billMonthSchema,
  unitsKwh: z.coerce.number().positive('Units must be greater than zero').max(100000),
  billAmount: z.coerce.number().positive().max(10_000_000).optional(),
  tariffPerKwh: z.coerce.number().positive().max(1000).optional(),
  sanctionedLoadKw: z.coerce.number().positive().max(1000).optional(),
  connectionType: z.string().trim().max(80).optional(),
  documentId: z.string().trim().min(1).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const createBillSchema = baseBill.refine(
  (v) => v.tariffPerKwh !== undefined || v.billAmount !== undefined,
  {
    message: 'Enter either the tariff per unit or the total bill amount so we can work out your rate',
    path: ['tariffPerKwh'],
  },
);

export const updateBillSchema = baseBill.partial().refine((v) => Object.keys(v).length > 0, {
  message: 'Nothing to update',
});

export const listBillsQuery = paginationQuery.extend({
  from: billMonthSchema.optional(),
  to: billMonthSchema.optional(),
});

export type CreateBillInput = z.infer<typeof createBillSchema>;
export type UpdateBillInput = z.infer<typeof updateBillSchema>;
export type ListBillsQuery = z.infer<typeof listBillsQuery>;
