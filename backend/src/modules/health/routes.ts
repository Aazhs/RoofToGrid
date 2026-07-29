/** Liveness + readiness (NFR-O1). Readiness checks the database and the storage driver. */
import { Router } from 'express';
import { asyncHandler, sendData } from '../../lib/http';
import { assertDatabaseReachable } from '../../lib/prisma';
import { getStorage } from '../../storage';
import { integrationStatus } from '../../integrations';
import { env } from '../../config/env';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  sendData(res, {
    status: 'ok',
    service: 'rooftogrid-api',
    version: 'v1',
    env: env.NODE_ENV,
    uptimeSeconds: Math.round(process.uptime()),
    time: new Date().toISOString(),
  });
});

const READINESS_TIMEOUT_MS = 3000;

/**
 * Readiness must answer quickly even when a dependency is hanging, otherwise the platform health check
 * blocks instead of failing over (NFR-O1).
 */
async function withTimeout<T>(label: string, work: Promise<T>): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label} did not respond within ${READINESS_TIMEOUT_MS} ms`)),
          READINESS_TIMEOUT_MS,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

healthRouter.get(
  '/ready',
  asyncHandler(async (_req, res) => {
    const checks: Record<string, { ok: boolean; detail?: string }> = {};

    try {
      await withTimeout('database', assertDatabaseReachable());
      checks.database = { ok: true };
    } catch (err) {
      checks.database = { ok: false, detail: (err as Error).message };
    }

    try {
      checks.storage = await withTimeout('storage', getStorage().health());
    } catch (err) {
      checks.storage = { ok: false, detail: (err as Error).message };
    }

    const ready = Object.values(checks).every((c) => c.ok);
    res.status(ready ? 200 : 503).json({ data: { ready, checks } });
  }),
);

/** Honest disclosure of which integrations are live (NFR-X2). */
healthRouter.get('/integrations', (_req, res) => {
  sendData(res, integrationStatus());
});
