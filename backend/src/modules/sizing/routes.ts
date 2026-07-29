import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, sendData } from '../../lib/http';
import { optionalAuth, requireAuth } from '../../middleware/auth';
import { publicSizingLimiter } from '../../middleware/rateLimit';
import { idParam, paginationQuery, validate } from '../../middleware/validate';
import { createRunSchema, estimateSchema, type CreateRunInput, type EstimateInput } from './schema';
import * as service from './service';

export const sizingRouter = Router();

/** AC-A1 — public, rate limited, nothing persisted, no user data in the response. */
sizingRouter.post(
  '/estimate',
  publicSizingLimiter,
  optionalAuth,
  validate({ body: estimateSchema }),
  asyncHandler(async (req, res) => {
    sendData(res, await service.estimate(req.valid?.body as EstimateInput));
  }),
);

/** NFR-U4 — public assumptions disclosure. */
sizingRouter.get(
  '/assumptions',
  validate({ query: z.object({ assumptionSetId: z.string().trim().max(40).optional() }) }),
  asyncHandler(async (req, res) => {
    const { assumptionSetId } = req.valid?.query as { assumptionSetId?: string };
    sendData(res, await service.getAssumptions(assumptionSetId));
  }),
);

sizingRouter.post(
  '/runs',
  requireAuth,
  validate({ body: createRunSchema }),
  asyncHandler(async (req, res) => {
    sendData(res, await service.createRun(req.auth!.userId, req.valid?.body as CreateRunInput), 201);
  }),
);

sizingRouter.get(
  '/runs',
  requireAuth,
  validate({ query: paginationQuery }),
  asyncHandler(async (req, res) => {
    const { items, meta } = await service.listRuns(
      req.auth!.userId,
      req.valid?.query as { page: number; pageSize: number },
    );
    sendData(res, items, 200, meta);
  }),
);

sizingRouter.get(
  '/runs/:id',
  requireAuth,
  validate({ params: idParam }),
  asyncHandler(async (req, res) => {
    const { id } = req.valid?.params as { id: string };
    sendData(res, await service.getRun(req.auth!.userId, id));
  }),
);

sizingRouter.delete(
  '/runs/:id',
  requireAuth,
  validate({ params: idParam }),
  asyncHandler(async (req, res) => {
    const { id } = req.valid?.params as { id: string };
    await service.deleteRun(req.auth!.userId, id);
    sendData(res, { ok: true });
  }),
);
