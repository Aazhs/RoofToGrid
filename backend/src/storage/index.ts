/** Driver selection is environment-driven (NFR-X3). */
import { env } from '../config/env';
import { LocalStorageProvider } from './localStorage';
import { SupabaseStorageProvider } from './supabaseStorage';
import type { StorageProvider } from './types';

let instance: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (!instance) {
    instance = env.STORAGE_DRIVER === 'supabase' ? new SupabaseStorageProvider() : new LocalStorageProvider();
  }
  return instance;
}

export * from './types';
