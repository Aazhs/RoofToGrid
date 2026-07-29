import { z } from 'zod';
import { paginationQuery } from '../../middleware/validate';

/** AC-E1 */
export const documentCategorySchema = z.enum([
  'BILL',
  'QUOTE',
  'CONTRACT',
  'DESIGN_DRAWING',
  'DISCOM_APPROVAL',
  'NET_METERING',
  'SUBSIDY',
  'WARRANTY',
  'INVOICE',
  'PHOTO',
  'OTHER',
]);

/** Multipart fields arrive as strings, so everything here is string-tolerant. */
export const uploadMetadataSchema = z.object({
  category: documentCategorySchema.default('OTHER'),
  projectId: z.string().trim().min(1).optional(),
  milestoneId: z.string().trim().min(1).optional(),
  quoteId: z.string().trim().min(1).optional(),
  description: z.string().trim().max(500).optional(),
});

export const updateDocumentSchema = z
  .object({
    category: documentCategorySchema.optional(),
    projectId: z.string().trim().min(1).nullish(),
    milestoneId: z.string().trim().min(1).nullish(),
    quoteId: z.string().trim().min(1).nullish(),
    description: z.string().trim().max(500).nullish(),
    fileName: z.string().trim().min(1).max(255).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'Nothing to update' });

export const listDocumentsQuery = paginationQuery.extend({
  category: documentCategorySchema.optional(),
  projectId: z.string().trim().min(1).optional(),
  milestoneId: z.string().trim().min(1).optional(),
  quoteId: z.string().trim().min(1).optional(),
});

export type UploadMetadata = z.infer<typeof uploadMetadataSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type ListDocumentsQuery = z.infer<typeof listDocumentsQuery>;
