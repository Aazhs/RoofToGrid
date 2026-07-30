/**
 * Environment loading + validation (NFR-S7).
 * The process refuses to boot on invalid config rather than failing later at request time.
 */
import 'dotenv/config';
import { z } from 'zod';

const bool = (def: boolean) =>
  z
    .enum(['true', 'false'])
    .default(def ? 'true' : 'false')
    .transform((v) => v === 'true');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional(),

  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 chars'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 chars'),
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(15), // NFR-S2
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30), // NFR-S2
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12), // NFR-S1

  // Comma-separated allowlist (NFR-S5)
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  COOKIE_DOMAIN: z.string().optional(),
  TRUST_PROXY: bool(true),

  STORAGE_DRIVER: z.enum(['local', 'supabase']).default('local'), // NFR-X3
  UPLOAD_DIR: z.string().default('.uploads'),
  MAX_UPLOAD_MB: z.coerce.number().positive().default(10), // AC-E2
  SIGNED_URL_TTL_SECONDS: z.coerce.number().int().positive().max(300).default(300), // AC-E4

  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_STORAGE_BUCKET: z.string().default('rooftogrid-documents'),

  YIELD_ENGINE: z.enum(['rule-based', 'pvgis', 'pvwatts']).default('rule-based'), // NFR-X3
  ASSUMPTION_SET_ID: z.string().default('IN_2026_07'),

  SEED_DEMO_EMAIL: z.string().email().default('demo@rooftogrid.com'),
  SEED_DEMO_PASSWORD: z.string().min(8).default('DemoSolar#2026'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`);
  const message = `Invalid environment configuration:\n${issues.join('\n')}`;
  // Tests import this module directly, so throw there instead of killing the runner.
  if (process.env.NODE_ENV === 'test') throw new Error(message);
  // eslint-disable-next-line no-console
  console.error(message);
  process.exit(1);
}

const raw = parsed.data;

if (raw.STORAGE_DRIVER === 'supabase' && (!raw.SUPABASE_URL || !raw.SUPABASE_SERVICE_ROLE_KEY)) {
  // eslint-disable-next-line no-console
  console.error('STORAGE_DRIVER=supabase requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

function sanitizeDatabaseUrl(url: string): string {
  let cleaned = url.trim().replace(/^["']|["']$/g, '');
  if ((cleaned.includes(':6543') || cleaned.includes('pooler.supabase.com')) && !cleaned.includes('pgbouncer=true')) {
    const separator = cleaned.includes('?') ? '&' : '?';
    cleaned = `${cleaned}${separator}pgbouncer=true`;
  }
  return cleaned;
}

const sanitizedDbUrl = sanitizeDatabaseUrl(raw.DATABASE_URL);
process.env.DATABASE_URL = sanitizedDbUrl;

export const env = {
  ...raw,
  databaseUrl: sanitizedDbUrl,
  isProduction: raw.NODE_ENV === 'production',
  isTest: raw.NODE_ENV === 'test',
  corsOrigins: raw.CORS_ORIGINS.split(',')
    .map((o) => o.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, ''))
    .filter(Boolean),
  maxUploadBytes: Math.round(raw.MAX_UPLOAD_MB * 1024 * 1024),
};

export type Env = typeof env;
