/**
 * Response envelope + pagination helpers (design §4).
 * Success: { data, meta? } · Failure: { error: { code, message, details? } }
 */
import type { Request, RequestHandler, Response } from 'express';

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function sendData<T>(res: Response, data: T, status = 200, meta?: unknown): void {
  res.status(status).json(meta === undefined ? { data } : { data, meta });
}

export function pageMeta(page: number, pageSize: number, total: number): PageMeta {
  return { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

/** NFR-P4: default 20, max 100. */
export function paginate(query: { page?: number; pageSize?: number }): {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
} {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

/** Express 5 forwards rejected promises automatically, but this keeps intent explicit. */
export const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res).catch(next);
  };
