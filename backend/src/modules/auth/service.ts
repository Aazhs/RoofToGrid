/**
 * Auth service (AC-A2, AC-A3, NFR-S1, NFR-S2).
 * Never returns `passwordHash`; failed logins return one generic message so emails cannot be enumerated.
 */
import bcrypt from 'bcryptjs';
import { env } from '../../config/env';
import { conflict, notFound, unauthorized } from '../../lib/errors';
import { logger } from '../../lib/logger';
import { prisma } from '../../lib/prisma';
import type { ChangePasswordInput, LoginInput, RegisterInput } from './schema';
import {
  accessTokenExpiresInSeconds,
  createRefreshToken,
  hashRefreshToken,
  newTokenFamilyId,
  signAccessToken,
} from './tokens';

export const publicUserSelect = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  createdAt: true,
} as const;

export interface SessionContext {
  userAgent?: string;
  ip?: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    createdAt: Date;
  };
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

async function issueSession(
  user: { id: string; email: string; fullName: string; role: string; createdAt: Date },
  familyId: string,
  ctx: SessionContext,
): Promise<AuthResult> {
  const { token, tokenHash, expiresAt } = createRefreshToken();
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      familyId,
      expiresAt,
      userAgent: ctx.userAgent?.slice(0, 255),
      ip: ctx.ip?.slice(0, 64),
    },
  });

  return {
    user,
    accessToken: signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role as 'HOMEOWNER' | 'INSTALLER' | 'ADMIN',
    }),
    expiresIn: accessTokenExpiresInSeconds(),
    refreshToken: token,
    refreshTokenExpiresAt: expiresAt,
  };
}

/** AC-A2 — duplicate email is 409 with a machine-readable code. */
export async function register(input: RegisterInput, ctx: SessionContext): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (existing) throw conflict('An account with this email already exists', 'EMAIL_TAKEN');

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS); // AC-A3

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      profile: {
        create: {
          city: input.city,
          pincode: input.pincode,
          onboardingStep: 0,
        },
      },
    },
    select: publicUserSelect,
  });

  return issueSession(user, newTokenFamilyId(), ctx);
}

export async function login(input: LoginInput, ctx: SessionContext): Promise<AuthResult> {
  const generic = unauthorized('Email or password is incorrect'); // NFR-S1
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    // Constant-ish work regardless of existence, to blunt timing signals.
    await bcrypt.compare(input.password, '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalid');
    throw generic;
  }
  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) throw generic;

  return issueSession(
    {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      createdAt: user.createdAt,
    },
    newTokenFamilyId(),
    ctx,
  );
}

/** NFR-S2 — rotation with family revocation on reuse of an already-rotated token. */
export async function refresh(rawToken: string, ctx: SessionContext): Promise<AuthResult> {
  const tokenHash = hashRefreshToken(rawToken);
  const record = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: { select: publicUserSelect } },
  });

  if (!record) throw unauthorized('Session is no longer valid. Please sign in again.');

  if (record.revokedAt || record.expiresAt.getTime() < Date.now()) {
    // Reuse of a revoked token means the family is compromised: revoke all of it.
    await prisma.refreshToken.updateMany({
      where: { familyId: record.familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    logger.warn({ familyId: record.familyId }, 'refresh token reuse detected; family revoked');
    throw unauthorized('Session is no longer valid. Please sign in again.');
  }

  const next = createRefreshToken();
  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date(), replacedByTokenHash: next.tokenHash },
    }),
    prisma.refreshToken.create({
      data: {
        userId: record.userId,
        tokenHash: next.tokenHash,
        familyId: record.familyId,
        expiresAt: next.expiresAt,
        userAgent: ctx.userAgent?.slice(0, 255),
        ip: ctx.ip?.slice(0, 64),
      },
    }),
  ]);

  return {
    user: record.user,
    accessToken: signAccessToken({
      sub: record.user.id,
      email: record.user.email,
      role: record.user.role,
    }),
    expiresIn: accessTokenExpiresInSeconds(),
    refreshToken: next.token,
    refreshTokenExpiresAt: next.expiresAt,
  };
}

export async function logout(rawToken: string | undefined): Promise<void> {
  if (!rawToken) return;
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashRefreshToken(rawToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function me(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { ...publicUserSelect, profile: true },
  });
  if (!user) throw notFound('User');
  return user;
}

/** Changing a password invalidates every outstanding refresh token. */
export async function changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw notFound('User');

  const ok = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!ok) throw unauthorized('Current password is incorrect');

  const passwordHash = await bcrypt.hash(input.newPassword, env.BCRYPT_ROUNDS);
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}
