/**
 * API integration tests — testing-strategy.md §4.
 * Needs a reachable Postgres (DATABASE_URL) with the schema applied. When no database is available the
 * suite skips instead of failing, so `npm run test:unit` stays the zero-dependency path.
 *
 *   npm run migrate:deploy && npm test
 */
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Express } from 'express';

const DEMO = {
  email: `itest_${Date.now()}@rooftogrid.test`,
  password: 'solar2026',
  fullName: 'Integration Tester',
};

const OTHER = {
  email: `itest_other_${Date.now()}@rooftogrid.test`,
  password: 'solar2026',
  fullName: 'Other Tester',
};

let app: Express;
let dbAvailable = false;
let token = '';
let otherToken = '';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_ACCESS_SECRET ??= 'test-access-secret-value-0123456789';
  process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret-value-0123456789';
  process.env.STORAGE_DRIVER = 'local';
  process.env.UPLOAD_DIR = '.uploads-test';
  // Keeps config validation happy when no .env exists; the connection check below decides whether to skip.
  process.env.DATABASE_URL ??= 'postgresql://postgres:postgres@localhost:5432/rooftogrid_test?schema=public';

  const [{ createApp }, { prisma }] = await Promise.all([
    import('../../src/app'),
    import('../../src/lib/prisma'),
  ]);
  app = createApp();

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbAvailable = true;
  } catch {
    dbAvailable = false;
    // eslint-disable-next-line no-console
    console.warn('Skipping integration tests: no database reachable at DATABASE_URL');
  }
});

afterAll(async () => {
  if (!dbAvailable) return;
  const { prisma } = await import('../../src/lib/prisma');
  await prisma.user.deleteMany({ where: { email: { in: [DEMO.email, OTHER.email] } } });
  await prisma.$disconnect();
});

const maybe = (name: string, fn: () => Promise<void> | void) =>
  it(name, async () => {
    if (!dbAvailable) return;
    await fn();
  });

describe('health (NFR-O1)', () => {
  it('reports liveness without a database', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
  });
});

describe('public sizing (AC-A1)', () => {
  it('returns scenarios for an unauthenticated caller with no user data', async () => {
    const res = await request(app).post('/api/v1/sizing/estimate').send({
      avgMonthlyUnits: 420,
      tariffPerKwh: 9,
      roofType: 'FLAT',
      usableAreaSqft: 650,
      orientation: 'S',
      shadingLevel: 'NONE',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.scenarios.length).toBeGreaterThan(0);
    expect(res.body.data.assumptions.disclaimer).toBeTruthy(); // AC-A14
    expect(JSON.stringify(res.body)).not.toMatch(/userId|email/);
  });

  it('rejects invalid input with 422 (NFR-S3)', async () => {
    const res = await request(app)
      .post('/api/v1/sizing/estimate')
      .send({ avgMonthlyUnits: -5, tariffPerKwh: 9, usableAreaSqft: 650 });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('auth and tenancy', () => {
  maybe('registers and returns a token without leaking the password hash (AC-A2, AC-A3)', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(DEMO);
    expect(res.status).toBe(201);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash/);
    token = res.body.data.accessToken;

    const other = await request(app).post('/api/v1/auth/register').send(OTHER);
    otherToken = other.body.data.accessToken;
  });

  maybe('rejects a duplicate email with 409 EMAIL_TAKEN (AC-A2)', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(DEMO);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_TAKEN');
  });

  maybe('returns the same message for a wrong password and an unknown email (NFR-S1)', async () => {
    const wrongPassword = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: DEMO.email, password: 'wrong2026' });
    const unknownEmail = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@rooftogrid.test', password: 'wrong2026' });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body.error.message).toBe(unknownEmail.body.error.message);
  });

  maybe('rejects a protected route without a token', async () => {
    const res = await request(app).get('/api/v1/profile');
    expect(res.status).toBe(401);
  });
});

describe('journeys A → E', () => {
  let quoteId = '';
  let projectId = '';
  let documentId = '';

  maybe('captures bills and derives the tariff (AC-A5, AC-A6)', async () => {
    for (const [i, units] of [420, 460, 390].entries()) {
      const res = await request(app)
        .post('/api/v1/bills')
        .set('Authorization', `Bearer ${token}`)
        .send({ billMonth: `2026-0${i + 1}`, unitsKwh: units, billAmount: units * 9 });
      expect(res.status).toBe(201);
      expect(res.body.data.tariffPerKwh).toBe(9);
    }

    const stats = await request(app).get('/api/v1/bills/stats').set('Authorization', `Bearer ${token}`);
    expect(stats.body.data.ready).toBe(true);
    expect(stats.body.data.weightedTariffPerKwh).toBe(9);
  });

  maybe('persists a sizing run and hides it from other users (AC-A15, NFR-S6)', async () => {
    const roof = await request(app)
      .post('/api/v1/roof-profiles')
      .set('Authorization', `Bearer ${token}`)
      .send({ roofType: 'FLAT', usableAreaSqft: 650, orientation: 'S', shadingLevel: 'NONE' });
    expect(roof.status).toBe(201);

    const run = await request(app)
      .post('/api/v1/sizing/runs')
      .set('Authorization', `Bearer ${token}`)
      .send({ avgMonthlyUnits: 423, tariffPerKwh: 9, roofProfileId: roof.body.data.id });
    expect(run.status).toBe(201);

    const own = await request(app)
      .get(`/api/v1/sizing/runs/${run.body.data.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(own.status).toBe(200);

    const foreign = await request(app)
      .get(`/api/v1/sizing/runs/${run.body.data.id}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(foreign.status).toBe(404); // never 403 (AC-C8)
  });

  maybe('scores and compares quotes (AC-B1, AC-B3, AC-B5)', async () => {
    const good = await request(app)
      .post('/api/v1/quotes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        installerName: 'SunPath Energy',
        systemSizeKwp: 5,
        totalPrice: 295000,
        panelTechnology: 'TOPCON',
        panelProductWarrantyYears: 15,
        panelPerformanceWarrantyYears: 30,
        inverterWarrantyYears: 10,
        workmanshipWarrantyYears: 5,
        includesNetMetering: true,
        includesStructure: true,
      });
    expect(good.status).toBe(201);
    expect(good.body.data.pricePerKwp).toBe(59000);
    expect(good.body.data.equipmentTier).toBe('PREMIUM');
    quoteId = good.body.data.id;

    const cheap = await request(app)
      .post('/api/v1/quotes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        installerName: 'ValueVolt',
        systemSizeKwp: 5.5,
        totalPrice: 181500,
        panelTechnology: 'POLY',
        panelProductWarrantyYears: 5,
        inverterWarrantyYears: 2,
      });
    expect(cheap.body.data.redFlags.length).toBeGreaterThan(2); // AC-B4

    const comparison = await request(app)
      .get('/api/v1/quotes/comparison')
      .set('Authorization', `Bearer ${token}`);
    expect(comparison.status).toBe(200);
    expect(comparison.body.data.rows).toHaveLength(2);
    expect(comparison.body.data.recommendedQuoteId).toBe(quoteId);
  });

  maybe('creates a project with nine milestones from a quote (AC-C1, AC-C2)', async () => {
    const res = await request(app)
      .post(`/api/v1/projects/from-quote/${quoteId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(201);
    expect(res.body.data.milestones).toHaveLength(9);
    projectId = res.body.data.id;
  });

  maybe('commissions the project when net metering completes (AC-C4, AC-C7)', async () => {
    const project = await request(app)
      .get(`/api/v1/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`);
    const netMetering = project.body.data.milestones.find(
      (m: { key: string }) => m.key === 'NET_METERING_ACTIVE',
    );

    const res = await request(app)
      .put(`/api/v1/projects/${projectId}/milestones/${netMetering.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'COMPLETED' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMMISSIONED');
    expect(res.body.data.commissionedDate).toBeTruthy();
  });

  maybe('upserts generation by month and reports performance (AC-D1, AC-D3)', async () => {
    const first = await request(app)
      .post(`/api/v1/projects/${projectId}/generation`)
      .set('Authorization', `Bearer ${token}`)
      .send({ month: '2026-05', generatedKwh: 600 });
    expect(first.status).toBe(201);

    const second = await request(app)
      .post(`/api/v1/projects/${projectId}/generation`)
      .set('Authorization', `Bearer ${token}`)
      .send({ month: '2026-05', generatedKwh: 640 });
    expect(second.body.data.generatedKwh).toBe(640);

    const logs = await request(app)
      .get(`/api/v1/projects/${projectId}/generation`)
      .set('Authorization', `Bearer ${token}`);
    expect(logs.body.data).toHaveLength(1);

    const performance = await request(app)
      .get(`/api/v1/projects/${projectId}/performance`)
      .set('Authorization', `Bearer ${token}`);
    expect(performance.status).toBe(200);
    expect(performance.body.data.monthsLogged).toBe(1);
  });

  maybe('uploads, lists and deletes a document (AC-E2, AC-E3, AC-E5)', async () => {
    const upload = await request(app)
      .post('/api/v1/documents')
      .set('Authorization', `Bearer ${token}`)
      .field('category', 'CONTRACT')
      .field('projectId', projectId)
      .attach('file', Buffer.from('%PDF-1.4 test\n'), {
        filename: 'contract.pdf',
        contentType: 'application/pdf',
      });

    expect(upload.status).toBe(201);
    expect(upload.body.data.storageKey).toMatch(/^u\/[^/]+\/\d{4}\/\d{2}\//); // AC-E3
    documentId = upload.body.data.id;

    const rejected = await request(app)
      .post('/api/v1/documents')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('MZ binary'), {
        filename: 'payload.exe',
        contentType: 'application/x-msdownload',
      });
    expect(rejected.status).toBe(415);
    expect(rejected.body.error.code).toBe('UNSUPPORTED_FILE_TYPE'); // AC-E2

    const foreign = await request(app)
      .get(`/api/v1/documents/${documentId}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(foreign.status).toBe(404); // AC-E4 / NFR-S9

    const download = await request(app)
      .get(`/api/v1/documents/${documentId}/download`)
      .set('Authorization', `Bearer ${token}`);
    expect(download.status).toBe(200);

    const removed = await request(app)
      .delete(`/api/v1/documents/${documentId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(removed.status).toBe(200);
  });

  maybe('keeps the project when its source quote is deleted (AC-B8)', async () => {
    const del = await request(app)
      .delete(`/api/v1/quotes/${quoteId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(200);

    const project = await request(app)
      .get(`/api/v1/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(project.status).toBe(200);
    expect(project.body.data.installerName).toBe('SunPath Energy');
    expect(project.body.data.sourceQuoteId).toBeNull();
  });
});
