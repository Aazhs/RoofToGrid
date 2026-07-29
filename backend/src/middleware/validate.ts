/**
 * Zod validation at the edge (NFR-S3). Unvalidated input never reaches a service: handlers read from
 * `req.valid`, never from `req.body` / `req.query` directly.
 */
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError, type ZodTypeAny, z } from 'zod';
import { validationError } from '../lib/errors';

interface Schemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

function formatIssues(err: ZodError) {
  return err.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));
}

export function validate(schemas: Schemas): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const valid: Record<string, unknown> = {};
      if (schemas.body) valid.body = schemas.body.parse(req.body ?? {});
      if (schemas.query) valid.query = schemas.query.parse(req.query ?? {});
      if (schemas.params) valid.params = schemas.params.parse(req.params ?? {});
      req.valid = valid;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(validationError('Some fields need attention', formatIssues(err)));
        return;
      }
      next(err);
    }
  };
}

export function body<T extends ZodTypeAny>(req: Request, _schema?: T): z.infer<T> {
  return req.valid?.body as z.infer<T>;
}

export function query<T extends ZodTypeAny>(req: Request, _schema?: T): z.infer<T> {
  return req.valid?.query as z.infer<T>;
}

export function params<T extends ZodTypeAny>(req: Request, _schema?: T): z.infer<T> {
  return req.valid?.params as z.infer<T>;
}

/** Reused by every `/:id` route. */
export const idParam = z.object({ id: z.string().min(1) });

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
