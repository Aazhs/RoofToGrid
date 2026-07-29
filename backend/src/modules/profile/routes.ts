import { Router } from 'express';
import { asyncHandler, sendData } from '../../lib/http';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { discomProvider } from '../../integrations';
import { onboardingSchema, updateProfileSchema, type OnboardingInput, type UpdateProfileInput } from './schema';
import * as service from './service';
import { z } from 'zod';

export const profileRouter = Router();

profileRouter.use(requireAuth);

profileRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    sendData(res, await service.getProfile(req.auth!.userId));
  }),
);

profileRouter.put(
  '/',
  validate({ body: updateProfileSchema }),
  asyncHandler(async (req, res) => {
    sendData(res, await service.updateProfile(req.auth!.userId, req.valid?.body as UpdateProfileInput));
  }),
);

profileRouter.patch(
  '/onboarding',
  validate({ body: onboardingSchema }),
  asyncHandler(async (req, res) => {
    sendData(res, await service.setOnboardingStep(req.auth!.userId, req.valid?.body as OnboardingInput));
  }),
);

profileRouter.get(
  '/summary',
  asyncHandler(async (req, res) => {
    sendData(res, await service.getSummary(req.auth!.userId));
  }),
);

/** Convenience lookup backed by the DiscomProvider stub (NFR-X2). */
profileRouter.get(
  '/discom-lookup',
  validate({ query: z.object({ pincode: z.string().regex(/^\d{6}$/) }) }),
  asyncHandler(async (req, res) => {
    const { pincode } = req.valid?.query as { pincode: string };
    sendData(res, await discomProvider.lookupByPincode(pincode));
  }),
);
