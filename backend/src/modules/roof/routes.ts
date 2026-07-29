import { Router } from 'express';
import { asyncHandler, sendData } from '../../lib/http';
import { requireAuth } from '../../middleware/auth';
import { idParam, validate } from '../../middleware/validate';
import { createRoofSchema, updateRoofSchema, type CreateRoofInput, type UpdateRoofInput } from './schema';
import * as service from './service';

export const roofRouter = Router();

roofRouter.use(requireAuth);

roofRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    sendData(res, await service.listRoofProfiles(req.auth!.userId));
  }),
);

roofRouter.post(
  '/',
  validate({ body: createRoofSchema }),
  asyncHandler(async (req, res) => {
    sendData(res, await service.createRoofProfile(req.auth!.userId, req.valid?.body as CreateRoofInput), 201);
  }),
);

roofRouter.get(
  '/:id',
  validate({ params: idParam }),
  asyncHandler(async (req, res) => {
    const { id } = req.valid?.params as { id: string };
    sendData(res, await service.getRoofProfile(req.auth!.userId, id));
  }),
);

roofRouter.put(
  '/:id',
  validate({ params: idParam, body: updateRoofSchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.valid?.params as { id: string };
    sendData(res, await service.updateRoofProfile(req.auth!.userId, id, req.valid?.body as UpdateRoofInput));
  }),
);

roofRouter.delete(
  '/:id',
  validate({ params: idParam }),
  asyncHandler(async (req, res) => {
    const { id } = req.valid?.params as { id: string };
    await service.deleteRoofProfile(req.auth!.userId, id);
    sendData(res, { ok: true });
  }),
);
