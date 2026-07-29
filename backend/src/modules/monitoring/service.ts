/**
 * Post-install monitoring: generation logs, performance, warranties, service requests (US-D1 … US-D5).
 * Traces to AC-D1 … AC-D6. Ownership is checked on the project before any child row is touched (NFR-S6).
 */
import { badRequest, notFound } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { getAssumptionSet } from '../../domain/assumptions';
import { env } from '../../config/env';
import { summarizePerformance, warrantyStatus } from '../../domain/performance';
import { inverterMonitoringProvider } from '../../integrations';
import type {
  CreateServiceRequestInput,
  CreateWarrantyInput,
  UpdateServiceRequestInput,
  UpdateWarrantyInput,
  UpsertGenerationInput,
} from './schema';

const set = () => getAssumptionSet(env.ASSUMPTION_SET_ID);

async function assertProjectOwned(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!project) throw notFound('Project');
  return project;
}

// ---------------------------------------------------------------- generation

export async function listGeneration(userId: string, projectId: string) {
  await assertProjectOwned(userId, projectId);
  return prisma.generationLog.findMany({ where: { projectId }, orderBy: { month: 'asc' } });
}

/** AC-D1 */
export async function upsertGeneration(userId: string, projectId: string, input: UpsertGenerationInput) {
  await assertProjectOwned(userId, projectId);
  return prisma.generationLog.upsert({
    where: { projectId_month: { projectId, month: input.month } },
    create: { ...input, projectId },
    update: input,
  });
}

export async function deleteGeneration(userId: string, projectId: string, logId: string): Promise<void> {
  await assertProjectOwned(userId, projectId);
  const log = await prisma.generationLog.findFirst({ where: { id: logId, projectId }, select: { id: true } });
  if (!log) throw notFound('Generation log');
  await prisma.generationLog.delete({ where: { id: logId } });
}

/** AC-D2 / AC-D3 / AC-D4 */
export async function performance(userId: string, projectId: string) {
  const project = await assertProjectOwned(userId, projectId);
  const logs = await prisma.generationLog.findMany({ where: { projectId }, orderBy: { month: 'asc' } });

  const summary = summarizePerformance(
    logs,
    {
      expectedAnnualGenerationKwh: project.expectedAnnualGenerationKwh,
      baselineMonthlyUnits: project.baselineMonthlyUnits,
      baselineTariffPerKwh: project.baselineTariffPerKwh,
    },
    set(),
  );

  return {
    project: {
      id: project.id,
      name: project.name,
      status: project.status,
      systemSizeKwp: project.systemSizeKwp,
      expectedAnnualGenerationKwh: project.expectedAnnualGenerationKwh,
      baselineMonthlyUnits: project.baselineMonthlyUnits,
      baselineTariffPerKwh: project.baselineTariffPerKwh,
      commissionedDate: project.commissionedDate,
    },
    ...summary,
    dataSource: {
      inverterSync: inverterMonitoringProvider.connected,
      note:
        'Generation figures are entered by you. Automatic inverter sync is planned — see the integration roadmap.',
      vendorsPlanned: inverterMonitoringProvider.listVendors(),
    },
    assumptions: {
      assumptionSetId: set().id,
      seasonality: set().monthlySeasonality,
      disclaimer: set().disclaimer,
    },
  };
}

/** Phase 2 seam (NFR-X2). */
export async function syncFromInverter(userId: string, projectId: string) {
  await assertProjectOwned(userId, projectId);
  return inverterMonitoringProvider.fetchMonthlyGeneration(projectId);
}

// ---------------------------------------------------------------- warranties

function decorateWarranty(w: { startDate: Date; durationYears: number }) {
  const status = warrantyStatus(w);
  return { ...w, ...status };
}

export async function listWarranties(userId: string, projectId: string) {
  await assertProjectOwned(userId, projectId);
  const rows = await prisma.warranty.findMany({ where: { projectId }, orderBy: { startDate: 'asc' } });
  return rows.map(decorateWarranty);
}

export async function createWarranty(userId: string, projectId: string, input: CreateWarrantyInput) {
  await assertProjectOwned(userId, projectId);
  if (input.documentId) {
    const doc = await prisma.document.findFirst({
      where: { id: input.documentId, userId },
      select: { id: true },
    });
    if (!doc) throw badRequest('That warranty document could not be found in your documents');
  }
  const created = await prisma.warranty.create({ data: { ...input, projectId } });
  return decorateWarranty(created);
}

export async function updateWarranty(
  userId: string,
  projectId: string,
  warrantyId: string,
  input: UpdateWarrantyInput,
) {
  await assertProjectOwned(userId, projectId);
  const existing = await prisma.warranty.findFirst({
    where: { id: warrantyId, projectId },
    select: { id: true },
  });
  if (!existing) throw notFound('Warranty');
  const updated = await prisma.warranty.update({ where: { id: warrantyId }, data: input });
  return decorateWarranty(updated);
}

export async function deleteWarranty(userId: string, projectId: string, warrantyId: string): Promise<void> {
  await assertProjectOwned(userId, projectId);
  const existing = await prisma.warranty.findFirst({
    where: { id: warrantyId, projectId },
    select: { id: true },
  });
  if (!existing) throw notFound('Warranty');
  await prisma.warranty.delete({ where: { id: warrantyId } });
}

// ---------------------------------------------------------------- service requests

export async function listServiceRequests(userId: string, projectId: string) {
  await assertProjectOwned(userId, projectId);
  return prisma.serviceRequest.findMany({ where: { projectId }, orderBy: { raisedAt: 'desc' } });
}

export async function createServiceRequest(
  userId: string,
  projectId: string,
  input: CreateServiceRequestInput,
) {
  await assertProjectOwned(userId, projectId);
  return prisma.serviceRequest.create({ data: { ...input, projectId } });
}

/** AC-D6 — moving to RESOLVED stamps resolvedAt. */
export async function updateServiceRequest(
  userId: string,
  projectId: string,
  requestId: string,
  input: UpdateServiceRequestInput,
) {
  await assertProjectOwned(userId, projectId);
  const existing = await prisma.serviceRequest.findFirst({ where: { id: requestId, projectId } });
  if (!existing) throw notFound('Service request');

  let resolvedAt = existing.resolvedAt;
  if (input.status === 'RESOLVED') resolvedAt = existing.resolvedAt ?? new Date();
  else if (input.status !== undefined) resolvedAt = null;

  return prisma.serviceRequest.update({
    where: { id: requestId },
    data: { ...input, resolvedAt },
  });
}
