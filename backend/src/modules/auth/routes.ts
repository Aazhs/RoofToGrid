/** Auth routes (design §4). Refresh token travels in an httpOnly cookie, or in the body for CLI clients. */
import { Router, type Request, type Response } from 'express';
import { env } from '../../config/env';
import { unauthorized } from '../../lib/errors';
import { asyncHandler, sendData } from '../../lib/http';
import { requireAuth } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rateLimit';
import { validate } from '../../middleware/validate';
import {
  changePasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  type ChangePasswordInput,
  type LoginInput,
  type RegisterInput,
} from './schema';
import * as service from './service';

export const REFRESH_COOKIE = 'rtg_refresh';

function sessionContext(req: Request): service.SessionContext {
  return { userAgent: req.headers['user-agent'], ip: req.ip };
}

function setRefreshCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.isProduction,
    // Production runs the app and API on different hosts, so the cookie must survive cross-site XHR.
    sameSite: env.isProduction ? 'none' : 'lax',
    domain: env.COOKIE_DOMAIN,
    path: '/api/v1/auth',
    expires: expiresAt,
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    domain: env.COOKIE_DOMAIN,
    path: '/api/v1/auth',
  });
}

function readRefreshToken(req: Request): string | undefined {
  const fromBody = (req.valid?.body as { refreshToken?: string } | undefined)?.refreshToken;
  return fromBody ?? (req.cookies?.[REFRESH_COOKIE] as string | undefined);
}

function authPayload(result: service.AuthResult) {
  return {
    user: result.user,
    accessToken: result.accessToken,
    expiresIn: result.expiresIn,
    // Returned for non-browser clients; browsers should rely on the cookie.
    refreshToken: result.refreshToken,
  };
}

export const authRouter = Router();

authRouter.post(
  '/register',
  authLimiter,
  validate({ body: registerSchema }),
  asyncHandler(async (req, res) => {
    const result = await service.register(req.valid?.body as RegisterInput, sessionContext(req));
    setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
    sendData(res, authPayload(result), 201);
  }),
);

authRouter.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  asyncHandler(async (req, res) => {
    const result = await service.login(req.valid?.body as LoginInput, sessionContext(req));
    setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
    sendData(res, authPayload(result));
  }),
);

authRouter.post(
  '/refresh',
  authLimiter,
  validate({ body: refreshSchema }),
  asyncHandler(async (req, res) => {
    const token = readRefreshToken(req);
    if (!token) throw unauthorized('No session to refresh');
    const result = await service.refresh(token, sessionContext(req));
    setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
    sendData(res, authPayload(result));
  }),
);

authRouter.post(
  '/logout',
  validate({ body: refreshSchema }),
  asyncHandler(async (req, res) => {
    await service.logout(readRefreshToken(req));
    clearRefreshCookie(res);
    sendData(res, { ok: true });
  }),
);

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    sendData(res, await service.me(req.auth!.userId));
  }),
);

authRouter.post(
  '/change-password',
  requireAuth,
  authLimiter,
  validate({ body: changePasswordSchema }),
  asyncHandler(async (req, res) => {
    await service.changePassword(req.auth!.userId, req.valid?.body as ChangePasswordInput);
    clearRefreshCookie(res);
    sendData(res, { ok: true, message: 'Password changed. Please sign in again.' });
  }),
);
