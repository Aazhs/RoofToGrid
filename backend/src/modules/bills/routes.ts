import { Router } from 'express';
import { asyncHandler, sendData } from '../../lib/http';
import { requireAuth } from '../../middleware/auth';
import { idParam, validate } from '../../middleware/validate';
import {
  createBillSchema,
  listBillsQuery,
  updateBillSchema,
  type CreateBillInput,
  type ListBillsQuery,
  type UpdateBillInput,
} from './schema';
import * as service from './service';

export const billsRouter = Router();

billsRouter.use(requireAuth);

billsRouter.get(
  '/',
  validate({ query: listBillsQuery }),
  asyncHandler(async (req, res) => {
    const { items, meta } = await service.listBills(req.auth!.userId, req.valid?.query as ListBillsQuery);
    sendData(res, items, 200, meta);
  }),
);

billsRouter.get(
  '/stats',
  asyncHandler(async (req, res) => {
    sendData(res, await service.getBillStats(req.auth!.userId));
  }),
);

billsRouter.post(
  '/',
  validate({ body: createBillSchema }),
  asyncHandler(async (req, res) => {
    sendData(res, await service.createBill(req.auth!.userId, req.valid?.body as CreateBillInput), 201);
  }),
);

billsRouter.put(
  '/:id',
  validate({ params: idParam, body: updateBillSchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.valid?.params as { id: string };
    sendData(res, await service.updateBill(req.auth!.userId, id, req.valid?.body as UpdateBillInput));
  }),
);

billsRouter.delete(
  '/:id',
  validate({ params: idParam }),
  asyncHandler(async (req, res) => {
    const { id } = req.valid?.params as { id: string };
    await service.deleteBill(req.auth!.userId, id);
    sendData(res, { ok: true });
  }),
);
