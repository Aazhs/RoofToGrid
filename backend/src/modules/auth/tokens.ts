/**
 * Token helpers (NFR-S2).
 * Access: short-lived JWT (15 min default). Refresh: opaque 32-byte random string, only ever stored as an
 * HMAC-SHA256 hash keyed by JWT_REFRESH_SECRET, so a database leak cannot be replayed.
 */
import { createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { UserRole } from '@prisma/client';
import { env } from '../../config/env';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: `${env.ACCESS_TOKEN_TTL_MINUTES}m`,
    issuer: 'rooftogrid',
    audience: 'rooftogrid-app',
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: 'rooftogrid',
    audience: 'rooftogrid-app',
  });
  if (typeof decoded === 'string') throw new Error('Malformed token');
  const { sub, email, role } = decoded as jwt.JwtPayload & { email?: string; role?: UserRole };
  if (!sub || !email || !role) throw new Error('Malformed token');
  return { sub, email, role };
}

export function accessTokenExpiresInSeconds(): number {
  return env.ACCESS_TOKEN_TTL_MINUTES * 60;
}

export function createRefreshToken(): { token: string; tokenHash: string; expiresAt: Date } {
  const token = randomBytes(32).toString('base64url');
  return {
    token,
    tokenHash: hashRefreshToken(token),
    expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86_400_000),
  };
}

export function hashRefreshToken(token: string): string {
  return createHmac('sha256', env.JWT_REFRESH_SECRET).update(token).digest('hex');
}

export function newTokenFamilyId(): string {
  return randomUUID();
}

export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}
