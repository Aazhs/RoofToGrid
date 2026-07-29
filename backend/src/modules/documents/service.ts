/**
 * Document vault (US-E1 … US-E4). Traces to AC-E1 … AC-E6.
 * Buckets are private; every read goes through an ownership check first (NFR-S9).
 */
import { randomUUID } from 'node:crypto';
import type { Readable } from 'node:stream';
import { env } from '../../config/env';
import { badRequest, notFound } from '../../lib/errors';
import { pageMeta, paginate } from '../../lib/http';
import { logger } from '../../lib/logger';
import { prisma } from '../../lib/prisma';
import { buildStorageKey, getStorage } from '../../storage';
import type { ListDocumentsQuery, UpdateDocumentInput, UploadMetadata } from './schema';

export interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

/** AC-E6 — a milestone reference must resolve to a project the same user owns. */
async function assertLinksOwned(
  userId: string,
  links: { projectId?: string | null; milestoneId?: string | null; quoteId?: string | null },
): Promise<void> {
  if (links.projectId) {
    const project = await prisma.project.findFirst({
      where: { id: links.projectId, userId },
      select: { id: true },
    });
    if (!project) throw badRequest('That project could not be found');
  }
  if (links.milestoneId) {
    const milestone = await prisma.milestone.findFirst({
      where: { id: links.milestoneId, project: { userId } },
      select: { id: true, projectId: true },
    });
    if (!milestone) throw badRequest('That milestone could not be found');
    if (links.projectId && milestone.projectId !== links.projectId) {
      throw badRequest('That milestone belongs to a different project');
    }
  }
  if (links.quoteId) {
    const quote = await prisma.quote.findFirst({
      where: { id: links.quoteId, userId },
      select: { id: true },
    });
    if (!quote) throw badRequest('That quote could not be found');
  }
}

export async function upload(userId: string, file: UploadedFile, meta: UploadMetadata) {
  await assertLinksOwned(userId, meta);

  const storage = getStorage();
  // AC-E3 — the original filename is metadata only, never part of the path.
  const storageKey = buildStorageKey(userId, file.originalname, randomUUID());

  await storage.put({
    key: storageKey,
    body: file.buffer,
    mimeType: file.mimetype,
    size: file.size,
  });

  try {
    return await prisma.document.create({
      data: {
        userId,
        category: meta.category,
        fileName: file.originalname.slice(0, 255),
        storageKey,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        storageDriver: storage.driver,
        projectId: meta.projectId,
        milestoneId: meta.milestoneId,
        quoteId: meta.quoteId,
        description: meta.description,
      },
    });
  } catch (err) {
    // Do not leave an object behind that no row points to.
    await storage.delete(storageKey).catch((cleanupErr) => {
      logger.error({ err: cleanupErr, storageKey }, 'failed to clean up orphaned object');
    });
    throw err;
  }
}

export async function listDocuments(userId: string, q: ListDocumentsQuery) {
  const { page, pageSize, skip, take } = paginate(q);
  const where = {
    userId,
    ...(q.category ? { category: q.category } : {}),
    ...(q.projectId ? { projectId: q.projectId } : {}),
    ...(q.milestoneId ? { milestoneId: q.milestoneId } : {}),
    ...(q.quoteId ? { quoteId: q.quoteId } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        project: { select: { id: true, name: true } },
        milestone: { select: { id: true, title: true } },
      },
    }),
    prisma.document.count({ where }),
  ]);

  return { items, meta: pageMeta(page, pageSize, total) };
}

export async function getDocument(userId: string, id: string) {
  const doc = await prisma.document.findFirst({
    where: { id, userId },
    include: {
      project: { select: { id: true, name: true } },
      milestone: { select: { id: true, title: true } },
    },
  });
  if (!doc) throw notFound('Document');
  return doc;
}

export type DownloadResult =
  | { mode: 'redirect'; url: string; fileName: string }
  | { mode: 'stream'; stream: Readable; fileName: string; mimeType: string; sizeBytes: number };

/** AC-E4 — ownership check, then a ≤5-minute signed URL or an authenticated stream. */
export async function download(userId: string, id: string): Promise<DownloadResult> {
  const doc = await prisma.document.findFirst({ where: { id, userId } });
  if (!doc) throw notFound('Document');

  const storage = getStorage();
  if (storage.supportsSignedUrls) {
    const url = await storage.getSignedUrl(doc.storageKey, env.SIGNED_URL_TTL_SECONDS);
    if (url) return { mode: 'redirect', url, fileName: doc.fileName };
  }

  return {
    mode: 'stream',
    stream: await storage.getStream(doc.storageKey),
    fileName: doc.fileName,
    mimeType: doc.mimeType,
    sizeBytes: doc.sizeBytes,
  };
}

export async function updateDocument(userId: string, id: string, input: UpdateDocumentInput) {
  const existing = await prisma.document.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw notFound('Document');
  await assertLinksOwned(userId, input);
  return prisma.document.update({ where: { id }, data: input });
}

/** AC-E5 — the row always goes; a storage failure is logged, not surfaced as an orphaned document. */
export async function deleteDocument(userId: string, id: string): Promise<{ ok: true; storageWarning?: string }> {
  const doc = await prisma.document.findFirst({ where: { id, userId } });
  if (!doc) throw notFound('Document');

  let storageWarning: string | undefined;
  try {
    await getStorage().delete(doc.storageKey);
  } catch (err) {
    storageWarning = 'The file record was removed but the stored copy could not be deleted yet.';
    logger.error({ err, storageKey: doc.storageKey, documentId: doc.id }, 'storage delete failed');
  }

  await prisma.document.delete({ where: { id } });
  return storageWarning ? { ok: true, storageWarning } : { ok: true };
}
