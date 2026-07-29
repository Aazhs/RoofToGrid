/**
 * Central error handling (design §6, NFR-S8).
 * Zod → 422, Prisma known errors → 409/404, multer → 413/415, unknown → 500 with the stack logged only.
 */
import { Prisma } from '@prisma/client';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { MulterError } from 'multer';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    error: { code: 'ROUTE_NOT_FOUND', message: `No route for ${req.method} ${req.originalUrl}` },
  });
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const log = (req as { log?: typeof logger }).log ?? logger;

  if (err instanceof AppError) {
    if (err.status >= 500) log.error({ err, code: err.code }, err.message);
    else log.warn({ code: err.code, status: err.status }, err.message);
    res.status(err.status).json({
      error: { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Some fields need attention',
        details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      },
    });
    return;
  }

  if (err instanceof MulterError) {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    const code = err.code === 'LIMIT_FILE_SIZE' ? 'FILE_TOO_LARGE' : 'UPLOAD_ERROR';
    res.status(status).json({
      error: {
        code,
        message:
          err.code === 'LIMIT_FILE_SIZE'
            ? `File is larger than the ${env.MAX_UPLOAD_MB} MB limit`
            : `Upload rejected: ${err.message}`,
      },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[] | undefined)?.join(', ') ?? 'value';
      res.status(409).json({
        error: { code: 'DUPLICATE', message: `That ${target} already exists`, details: { target } },
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Resource not found' } });
      return;
    }
    if (err.code === 'P2003') {
      res.status(400).json({ error: { code: 'INVALID_REFERENCE', message: 'A referenced record does not exist' } });
      return;
    }
    log.error({ err, prismaCode: err.code }, 'prisma known request error');
    res.status(400).json({ error: { code: 'DATABASE_ERROR', message: 'The request could not be completed' } });
    return;
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    log.error({ err }, 'database unreachable');
    res.status(503).json({
      error: { code: 'SERVICE_UNAVAILABLE', message: 'The database is unavailable. Please try again shortly.' },
    });
    return;
  }

  // Unknown: log everything, expose nothing (NFR-S8).
  log.error({ err }, 'unhandled error');
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong on our side',
      ...(env.isProduction ? {} : { details: { message: (err as Error)?.message } }),
    },
  });
};
