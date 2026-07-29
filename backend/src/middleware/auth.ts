/** Bearer access-token verification (NFR-S2). Ownership itself is enforced in services (NFR-S6). */
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { unauthorized } from '../lib/errors';
import { verifyAccessToken } from '../modules/auth/tokens';

function readBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.toLowerCase().startsWith('bearer ')) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

export const requireAuth: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  const token = readBearer(req);
  if (!token) {
    next(unauthorized('Sign in to continue'));
    return;
  }
  try {
    const payload = verifyAccessToken(token);
    req.auth = { userId: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    next(unauthorized('Your session has expired. Please sign in again.'));
  }
};

/** Used by public endpoints that behave slightly differently when a user happens to be signed in. */
export const optionalAuth: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  const token = readBearer(req);
  if (token) {
    try {
      const payload = verifyAccessToken(token);
      req.auth = { userId: payload.sub, email: payload.email, role: payload.role };
    } catch {
      /* ignore: endpoint is public */
    }
  }
  next();
};

export function currentUserId(req: Request): string {
  if (!req.auth) throw unauthorized();
  return req.auth.userId;
}
