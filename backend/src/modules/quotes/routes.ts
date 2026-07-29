import { Router } from 'express';
import { asyncHandler, sendData } from '../../lib/http';
import { requireAuth } from '../../middleware/auth';
import { idParam, validate } from '../../middleware/validate';
import { quoteParser } from '../../integrations';
import {
  createQuoteSchema,
  listQuotesQuery,
  updateQuoteSchema,
  type CreateQuoteInput,
  type ListQuotesQuery,
  type UpdateQuoteInput,
} from './schema';
import * as service from './service';

export const quotesRouter = Router();

quotesRouter.use(requireAuth);

quotesRouter.get(
  '/',
  validate({ query: listQuotesQuery }),
  asyncHandler(async (req, res) => {
    const { items, meta } = await service.listQuotes(req.auth!.userId, req.valid?.query as ListQuotesQuery);
    sendData(res, items, 200, meta);
  }),
);

/** AC-B5 — must be declared before `/:id` so "comparison" is not read as an id. */
quotesRouter.get(
  '/comparison',
  asyncHandler(async (req, res) => {
    sendData(res, await service.comparison(req.auth!.userId));
  }),
);

quotesRouter.post(
  '/',
  validate({ body: createQuoteSchema }),
  asyncHandler(async (req, res) => {
    sendData(res, await service.createQuote(req.auth!.userId, req.valid?.body as CreateQuoteInput), 201);
  }),
);

quotesRouter.post(
  '/rescore',
  asyncHandler(async (req, res) => {
    sendData(res, await service.rescoreAll(req.auth!.userId));
  }),
);

quotesRouter.get(
  '/:id',
  validate({ params: idParam }),
  asyncHandler(async (req, res) => {
    const { id } = req.valid?.params as { id: string };
    sendData(res, await service.getQuote(req.auth!.userId, id));
  }),
);

quotesRouter.put(
  '/:id',
  validate({ params: idParam, body: updateQuoteSchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.valid?.params as { id: string };
    sendData(res, await service.updateQuote(req.auth!.userId, id, req.valid?.body as UpdateQuoteInput));
  }),
);

quotesRouter.delete(
  '/:id',
  validate({ params: idParam }),
  asyncHandler(async (req, res) => {
    const { id } = req.valid?.params as { id: string };
    await service.deleteQuote(req.auth!.userId, id);
    sendData(res, { ok: true });
  }),
);

quotesRouter.post(
  '/:id/select',
  validate({ params: idParam }),
  asyncHandler(async (req, res) => {
    const { id } = req.valid?.params as { id: string };
    sendData(res, await service.selectQuote(req.auth!.userId, id));
  }),
);

/** Phase 2 seam: PDF/photo quote extraction (NFR-X2). Returns an honest "not yet" today. */
quotesRouter.post(
  '/parse/:id',
  validate({ params: idParam }),
  asyncHandler(async (req, res) => {
    const { id } = req.valid?.params as { id: string };
    sendData(res, await quoteParser.parse(id));
  }),
);
