/**
 * Supabase Storage driver for production (NFR-O4, NFR-S9).
 * The bucket is private; every download is mediated by an ownership check and a short-lived signed URL.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Readable } from 'node:stream';
import { env } from '../config/env';
import { notFound, serviceUnavailable } from '../lib/errors';
import type { PutObjectInput, PutObjectResult, StorageProvider } from './types';

export class SupabaseStorageProvider implements StorageProvider {
  readonly driver = 'supabase';
  readonly supportsSignedUrls = true;
  private readonly client: SupabaseClient;
  private readonly bucket: string;

  constructor() {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for supabase storage');
    }
    this.client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    this.bucket = env.SUPABASE_STORAGE_BUCKET;
  }

  async put(input: PutObjectInput): Promise<PutObjectResult> {
    const { error } = await this.client.storage.from(this.bucket).upload(input.key, input.body, {
      contentType: input.mimeType,
      upsert: false,
    });
    if (error) throw serviceUnavailable(`Upload failed: ${error.message}`);
    return { key: input.key, driver: this.driver };
  }

  async getStream(key: string): Promise<Readable> {
    const { data, error } = await this.client.storage.from(this.bucket).download(key);
    if (error || !data) throw notFound('Stored file');
    const buffer = Buffer.from(await data.arrayBuffer());
    return Readable.from(buffer);
  }

  async getSignedUrl(key: string, expiresInSeconds: number): Promise<string | null> {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUrl(key, Math.min(expiresInSeconds, 300)); // AC-E4 caps at 5 minutes
    if (error || !data) return null;
    return data.signedUrl;
  }

  async delete(key: string): Promise<void> {
    const { error } = await this.client.storage.from(this.bucket).remove([key]);
    if (error) throw serviceUnavailable(`Delete failed: ${error.message}`);
  }

  async health(): Promise<{ ok: boolean; detail?: string }> {
    const { error } = await this.client.storage.from(this.bucket).list('', { limit: 1 });
    return error ? { ok: false, detail: error.message } : { ok: true, detail: `supabase:${this.bucket}` };
  }
}
