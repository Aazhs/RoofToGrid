/** Local-disk driver for development (design §6). Files land in UPLOAD_DIR, never in a public path. */
import { createReadStream } from 'node:fs';
import { mkdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Readable } from 'node:stream';
import { env } from '../config/env';
import { notFound } from '../lib/errors';
import type { PutObjectInput, PutObjectResult, StorageProvider } from './types';

const ROOT = path.resolve(process.cwd(), env.UPLOAD_DIR);

/** Guards against traversal: a key may never resolve outside the upload root. */
function resolveKey(key: string): string {
  const target = path.resolve(ROOT, key);
  if (!target.startsWith(ROOT + path.sep) && target !== ROOT) {
    throw notFound('Document');
  }
  return target;
}

export class LocalStorageProvider implements StorageProvider {
  readonly driver = 'local';
  readonly supportsSignedUrls = false;

  async put(input: PutObjectInput): Promise<PutObjectResult> {
    const target = resolveKey(input.key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, input.body);
    return { key: input.key, driver: this.driver };
  }

  async getStream(key: string): Promise<Readable> {
    const target = resolveKey(key);
    try {
      await stat(target);
    } catch {
      throw notFound('Stored file');
    }
    return createReadStream(target);
  }

  async getSignedUrl(): Promise<string | null> {
    return null; // dev streams through the API instead
  }

  async delete(key: string): Promise<void> {
    await rm(resolveKey(key), { force: true });
  }

  async health(): Promise<{ ok: boolean; detail?: string }> {
    try {
      await mkdir(ROOT, { recursive: true });
      return { ok: true, detail: `local:${ROOT}` };
    } catch (err) {
      return { ok: false, detail: (err as Error).message };
    }
  }
}
