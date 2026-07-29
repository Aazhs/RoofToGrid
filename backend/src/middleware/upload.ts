/**
 * Single-file multipart handling (AC-A4, AC-E2, NFR-P5).
 * Memory storage bounded by MAX_UPLOAD_MB — the process never holds more than one file's worth per request,
 * and the buffer is handed straight to the StorageProvider.
 */
import multer from 'multer';
import { env } from '../config/env';
import { unsupportedMediaType } from '../lib/errors';

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const uploadSingle = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxUploadBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype as (typeof ALLOWED_MIME_TYPES)[number])) {
      cb(
        unsupportedMediaType(
          `${file.mimetype} is not supported. Upload a PDF, JPEG, PNG or WebP file.`,
        ),
      );
      return;
    }
    cb(null, true);
  },
}).single('file');
