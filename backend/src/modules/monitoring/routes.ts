/** Mounted under /projects (see modules/projects/routes.ts). Auth is applied by the parent router. */
import { Router } from 'express';
import { asyncHandler, sendData } from '../../lib/http';
import { validate } from '../../middleware/validate';
import {
  createServiceRequestSchema,
  createWarrantySchema,
  generationParams,
  projectScopedParams,
  serviceRequestParams,
  updateServiceRequestSchema,
  updateWarrantySchema,
  upsertGenerationSchema,
  warrantyParams,
  type CreateServiceRequestInput,
  type CreateWarrantyInput,
  type UpdateServiceRequestInput,
  type UpdateWarrantyInput,
  type UpsertGenerationInput,
} from './schema';
import * as service from './service';

export const monitoringRouter = Router();

// ---------------------------------------------------------------- generation

monitoringRouter.get(
  '/:id/generation',
  validate({ params: projectScopedParams }),
  asyncHandler(async (req, res) => {
    const { id } = req.valid?.params as { id: string };
    sendData(res, await service.listGeneration(req.auth!.userId, id));
  }),
);

monitoringRouter.post(
  '/:id/generation',
  validate({ params: projectScopedParams, body: upsertGenerationSchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.valid?.params as { id: string };
    sendData(
      res,
      await service.upsertGeneration(req.auth!.userId, id, req.valid?.body as UpsertGenerationInput),
      201,
    );
  }),
);

monitoringRouter.delete(
  '/:id/generation/:logId',
  validate({ params: generationParams }),
  asyncHandler(async (req, res) => {
    const { id, logId } = req.valid?.params as { id: string; logId: string };
    await service.deleteGeneration(req.auth!.userId, id, logId);
    sendData(res, { ok: true });
  }),
);

monitoringRouter.get(
  '/:id/performance',
  validate({ params: projectScopedParams }),
  asyncHandler(async (req, res) => {
    const { id } = req.valid?.params as { id: string };
    sendData(res, await service.performance(req.auth!.userId, id));
  }),
);

monitoringRouter.post(
  '/:id/generation/sync',
  validate({ params: projectScopedParams }),
  asyncHandler(async (req, res) => {
    const { id } = req.valid?.params as { id: string };
    sendData(res, await service.syncFromInverter(req.auth!.userId, id));
  }),
);

// ---------------------------------------------------------------- warranties

monitoringRouter.get(
  '/:id/warranties',
  validate({ params: projectScopedParams }),
  asyncHandler(async (req, res) => {
    const { id } = req.valid?.params as { id: string };
    sendData(res, await service.listWarranties(req.auth!.userId, id));
  }),
);

monitoringRouter.post(
  '/:id/warranties',
  validate({ params: projectScopedParams, body: createWarrantySchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.valid?.params as { id: string };
    sendData(
      res,
      await service.createWarranty(req.auth!.userId, id, req.valid?.body as CreateWarrantyInput),
      201,
    );
  }),
);

monitoringRouter.put(
  '/:id/warranties/:warrantyId',
  validate({ params: warrantyParams, body: updateWarrantySchema }),
  asyncHandler(async (req, res) => {
    const { id, warrantyId } = req.valid?.params as { id: string; warrantyId: string };
    sendData(
      res,
      await service.updateWarranty(
        req.auth!.userId,
        id,
        warrantyId,
        req.valid?.body as UpdateWarrantyInput,
      ),
    );
  }),
);

monitoringRouter.delete(
  '/:id/warranties/:warrantyId',
  validate({ params: warrantyParams }),
  asyncHandler(async (req, res) => {
    const { id, warrantyId } = req.valid?.params as { id: string; warrantyId: string };
    await service.deleteWarranty(req.auth!.userId, id, warrantyId);
    sendData(res, { ok: true });
  }),
);

// ---------------------------------------------------------------- service requests

monitoringRouter.get(
  '/:id/service-requests',
  validate({ params: projectScopedParams }),
  asyncHandler(async (req, res) => {
    const { id } = req.valid?.params as { id: string };
    sendData(res, await service.listServiceRequests(req.auth!.userId, id));
  }),
);

monitoringRouter.post(
  '/:id/service-requests',
  validate({ params: projectScopedParams, body: createServiceRequestSchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.valid?.params as { id: string };
    sendData(
      res,
      await service.createServiceRequest(
        req.auth!.userId,
        id,
        req.valid?.body as CreateServiceRequestInput,
      ),
      201,
    );
  }),
);

monitoringRouter.put(
  '/:id/service-requests/:requestId',
  validate({ params: serviceRequestParams, body: updateServiceRequestSchema }),
  asyncHandler(async (req, res) => {
    const { id, requestId } = req.valid?.params as { id: string; requestId: string };
    sendData(
      res,
      await service.updateServiceRequest(
        req.auth!.userId,
        id,
        requestId,
        req.valid?.body as UpdateServiceRequestInput,
      ),
    );
  }),
);
