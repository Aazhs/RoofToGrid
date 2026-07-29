/** Roof profiles (US-A6). Capacity is surfaced alongside each roof so the UI can explain limits (AC-A7). */
import { notFound } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { getAssumptionSet } from '../../domain/assumptions';
import { roofCapacityKwp } from '../../domain/sizing';
import { env } from '../../config/env';
import type { CreateRoofInput, UpdateRoofInput } from './schema';

const set = () => getAssumptionSet(env.ASSUMPTION_SET_ID);

function withCapacity<T extends { roofType: string; usableAreaSqft: number; shadingLevel: string }>(roof: T) {
  return {
    ...roof,
    estimatedCapacityKwp: roofCapacityKwp(
      roof.usableAreaSqft,
      roof.roofType as 'FLAT' | 'SLOPED' | 'MIXED',
      roof.shadingLevel as 'NONE' | 'LIGHT' | 'MODERATE' | 'HEAVY',
      set(),
    ),
  };
}

export async function listRoofProfiles(userId: string) {
  const rows = await prisma.roofProfile.findMany({
    where: { userId },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
  });
  return rows.map(withCapacity);
}

export async function getRoofProfile(userId: string, id: string) {
  const roof = await prisma.roofProfile.findFirst({ where: { id, userId } });
  if (!roof) throw notFound('Roof profile');
  return withCapacity(roof);
}

export async function createRoofProfile(userId: string, input: CreateRoofInput) {
  const count = await prisma.roofProfile.count({ where: { userId } });
  const isPrimary = input.isPrimary || count === 0; // first roof is primary by default

  const roof = await prisma.$transaction(async (tx) => {
    if (isPrimary) {
      await tx.roofProfile.updateMany({ where: { userId, isPrimary: true }, data: { isPrimary: false } });
    }
    return tx.roofProfile.create({ data: { ...input, isPrimary, userId } });
  });

  return withCapacity(roof);
}

export async function updateRoofProfile(userId: string, id: string, input: UpdateRoofInput) {
  const existing = await prisma.roofProfile.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw notFound('Roof profile');

  const roof = await prisma.$transaction(async (tx) => {
    if (input.isPrimary) {
      await tx.roofProfile.updateMany({
        where: { userId, isPrimary: true, NOT: { id } },
        data: { isPrimary: false },
      });
    }
    return tx.roofProfile.update({ where: { id }, data: input });
  });

  return withCapacity(roof);
}

export async function deleteRoofProfile(userId: string, id: string): Promise<void> {
  const existing = await prisma.roofProfile.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw notFound('Roof profile');
  await prisma.roofProfile.delete({ where: { id } });
}
