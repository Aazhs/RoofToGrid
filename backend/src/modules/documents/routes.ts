import { Router } from 'express';
import { env } from '../../config/env';
import { badRequest } from '../../lib/errors';
import { asyncHandler, sendData } from '../../lib/http';
import { requireAuth } from '../../middleware/auth';
import { uploadLimiter } from '../../middleware/rateLimit';
import { ALLOWED_MIME_TYPES, uploadSingle } from '../../middleware/upload';
import { idParam, validate } from '../../middleware/validate';
import {
  listDocumentsQuery,
  updateDocumentSchema,
  uploadMetadataSchema,
  type ListDocumentsQuery,
  type UpdateDocumentInput,
  type UploadMetadata,
} from './schema';
import * as service from './service';

export const documentsRouter = Router();

documentsRouter.use(requireAuth);

/** Upload constraints, so the UI can state limits before a user picks a file (NFR-U2). */
documentsRouter.get('/constraints', (_req, res) => {
  sendData(res, {
    allowedMimeTypes: ALLOWED_MIME_TYPES,
    maxUploadMb: env.MAX_UPLOAD_MB,
    storageDriver: env.STORAGE_DRIVER,
  });
});

documentsRouter.post(
  '/',
  uploadLimiter,
  uploadSingle,
  validate({ body: uploadMetadataSchema }),
  asyncHandler(async (req, res) => {
    if (!req.file) throw badRequest('Attach a file in the "file" field');
    sendData(
      res,
      await service.upload(req.auth!.userId, req.file, req.valid?.body as UploadMetadata),
      201,
    );
  }),
);

documentsRouter.get(
  '/',
  validate({ query: listDocumentsQuery }),
  asyncHandler(async (req, res) => {
    const { items, meta } = await service.listDocuments(
      req.auth!.userId,
      req.valid?.query as ListDocumentsQuery,
    );
    sendData(res, items, 200, meta);
  }),
);

documentsRouter.get(
  '/:id',
  validate({ params: idParam }),
  asyncHandler(async (req, res) => {
    const { id } = req.valid?.params as { id: string };
    sendData(res, await service.getDocument(req.auth!.userId, id));
  }),
);

/** AC-E4 */
documentsRouter.get(
  '/:id/download',
  validate({ params: idParam }),
  asyncHandler(async (req, res) => {
    const { id } = req.valid?.params as { id: string };
    const result = await service.download(req.auth!.userId, id);

    if (result.mode === 'redirect') {
      res.redirect(302, result.url);
      return;
    }

    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Length', String(result.sizeBytes));
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${result.fileName.replace(/["\r\n]/g, '')}"`,
    );
    result.stream.pipe(res);
  }),
);

documentsRouter.put(
  '/:id',
  validate({ params: idParam, body: updateDocumentSchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.valid?.params as { id: string };
    sendData(
      res,
      await service.updateDocument(req.auth!.userId, id, req.valid?.body as UpdateDocumentInput),
    );
  }),
);

documentsRouter.delete(
  '/:id',
  validate({ params: idParam }),
  asyncHandler(async (req, res) => {
    const { id } = req.valid?.params as { id: string };
    sendData(res, await service.deleteDocument(req.auth!.userId, id));
  }),
);
