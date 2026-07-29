/**
 * StorageProvider seam (NFR-X2, NFR-X3). Swapping local disk for Supabase Storage — or S3 later — is a
 * driver change plus an env var, never a route or service change.
 */
import type { Readable } from 'node:stream';

export interface PutObjectInput {
  key: string;
  body: Buffer;
  mimeType: string;
  size: number;
}

export interface PutObjectResult {
  key: string;
  driver: string;
}

export interface StorageProvider {
  readonly driver: string;
  /** true when this driver can hand out time-limited URLs instead of streaming through the API. */
  readonly supportsSignedUrls: boolean;
  put(input: PutObjectInput): Promise<PutObjectResult>;
  getStream(key: string): Promise<Readable>;
  /** AC-E4 — short-lived (≤ 5 min) URL, or null when the driver cannot issue one. */
  getSignedUrl(key: string, expiresInSeconds: number): Promise<string | null>;
  delete(key: string): Promise<void>;
  health(): Promise<{ ok: boolean; detail?: string }>;
}

/** AC-E3 — `u/{userId}/{yyyy}/{mm}/{uuid}.{ext}`; original filenames are metadata only. */
export function buildStorageKey(userId: string, originalName: string, uuid: string): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const rawExt = originalName.includes('.') ? originalName.split('.').pop() ?? '' : '';
  const ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);
  return `u/${userId}/${yyyy}/${mm}/${uuid}${ext ? `.${ext}` : ''}`;
}
