/**
 * Electricity bill summaries (US-A4, US-A5). Traces to AC-A5 (tariff derivation) and AC-A6 (wizard pre-fill).
 * Every query filters on userId (NFR-S6).
 */
import { badRequest, notFound } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { pageMeta, paginate } from '../../lib/http';
import { billStats } from '../../domain/sizing';
import { round } from '../../domain/math';
import type { CreateBillInput, ListBillsQuery, UpdateBillInput } from './schema';

/** AC-A5 */
export function deriveTariff(input: {
  tariffPerKwh?: number;
  billAmount?: number;
  unitsKwh: number;
}): number {
  if (input.tariffPerKwh !== undefined) return round(input.tariffPerKwh, 2);
  if (input.billAmount !== undefined && input.unitsKwh > 0) {
    return round(input.billAmount / input.unitsKwh, 2);
  }
  throw badRequest('Provide either tariffPerKwh or billAmount');
}

async function assertDocumentOwned(userId: string, documentId?: string): Promise<void> {
  if (!documentId) return;
  const doc = await prisma.document.findFirst({ where: { id: documentId, userId }, select: { id: true } });
  if (!doc) throw badRequest('That uploaded bill could not be found in your documents');
}

export async function listBills(userId: string, q: ListBillsQuery) {
  const { page, pageSize, skip, take } = paginate(q);
  const where = {
    userId,
    ...(q.from || q.to
      ? { billMonth: { ...(q.from ? { gte: q.from } : {}), ...(q.to ? { lte: q.to } : {}) } }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.electricityBillSummary.findMany({ where, orderBy: { billMonth: 'desc' }, skip, take }),
    prisma.electricityBillSummary.count({ where }),
  ]);

  return { items, meta: pageMeta(page, pageSize, total) };
}

export async function createBill(userId: string, input: CreateBillInput) {
  await assertDocumentOwned(userId, input.documentId);
  const tariffPerKwh = deriveTariff(input);

  // Re-posting a month updates it rather than failing: homeowners correct typos constantly.
  return prisma.electricityBillSummary.upsert({
    where: { userId_billMonth: { userId, billMonth: input.billMonth } },
    create: { ...input, tariffPerKwh, userId },
    update: { ...input, tariffPerKwh },
  });
}

export async function updateBill(userId: string, id: string, input: UpdateBillInput) {
  const existing = await prisma.electricityBillSummary.findFirst({ where: { id, userId } });
  if (!existing) throw notFound('Bill');
  await assertDocumentOwned(userId, input.documentId);

  const unitsKwh = input.unitsKwh ?? existing.unitsKwh;
  const billAmount = input.billAmount ?? existing.billAmount ?? undefined;
  const tariffPerKwh =
    input.tariffPerKwh !== undefined
      ? round(input.tariffPerKwh, 2)
      : input.unitsKwh !== undefined || input.billAmount !== undefined
        ? deriveTariff({ billAmount, unitsKwh })
        : existing.tariffPerKwh;

  return prisma.electricityBillSummary.update({
    where: { id },
    data: { ...input, unitsKwh, tariffPerKwh },
  });
}

export async function deleteBill(userId: string, id: string): Promise<void> {
  const existing = await prisma.electricityBillSummary.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw notFound('Bill');
  await prisma.electricityBillSummary.delete({ where: { id } });
}

/** AC-A6 — one trusted server-side computation for wizard pre-fill (design §7). */
export async function getBillStats(userId: string) {
  const bills = await prisma.electricityBillSummary.findMany({
    where: { userId },
    orderBy: { billMonth: 'desc' },
    take: 12,
    select: { billMonth: true, unitsKwh: true, tariffPerKwh: true, billAmount: true },
  });
  return billStats(bills);
}
