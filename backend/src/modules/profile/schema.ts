import { z } from 'zod';

export const propertyTypeSchema = z.enum([
  'INDEPENDENT_HOUSE',
  'ROW_HOUSE',
  'APARTMENT',
  'COMMERCIAL',
]);

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  city: z.string().trim().max(120).nullish(),
  state: z.string().trim().max(120).nullish(),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter a 6-digit pincode')
    .nullish(),
  discomName: z.string().trim().max(160).nullish(),
  consumerNumber: z.string().trim().max(64).nullish(),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, 'Enter a valid phone number')
    .nullish(),
  propertyType: propertyTypeSchema.nullish(),
  currency: z.string().trim().length(3).optional(),
  region: z.string().trim().min(2).max(4).optional(),
});

/** NFR-U3 — wizard progress is stored server-side so a refresh never loses the user's place. */
export const onboardingSchema = z.object({
  onboardingStep: z.coerce.number().int().min(0).max(4),
  completed: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
