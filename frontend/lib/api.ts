/**
 * API client (design §5). One fetch wrapper, one place that knows about tokens.
 * Access token lives in memory with a localStorage mirror for reloads; the refresh token is an httpOnly
 * cookie, so a 401 triggers a single-flight refresh and one retry of the original request.
 */
import type {
  Assumptions,
  AuthPayload,
  Bill,
  BillStats,
  Comparison,
  DocumentRecord,
  GenerationLog,
  Performance,
  Profile,
  Project,
  Quote,
  RoofProfile,
  ServiceRequest,
  SizingResult,
  SizingRun,
  Summary,
  User,
  Warranty,
} from './types';
import { handleDemoRequest } from './demo-router';

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'
).replace(/\/$/, '');

const TOKEN_STORAGE_KEY = 'rtg.accessToken';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Array<{ path?: string; message: string }>;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Array<{ path?: string; message: string }>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** Field-level messages for form display, keyed by field path. */
  fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const detail of this.details ?? []) {
      if (detail.path) out[detail.path] = detail.message;
    }
    return out;
  }
}

let accessToken: string | null = null;
let refreshInFlight: Promise<boolean> | null = null;
const listeners = new Set<(token: string | null) => void>();

export function setAccessToken(token: string | null): void {
  accessToken = token;
  if (typeof window !== 'undefined') {
    if (token) window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
  listeners.forEach((listener) => listener(token));
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== 'undefined') {
    accessToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  }
  return accessToken;
}

export function onTokenChange(listener: (token: string | null) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  /** Skip the refresh-and-retry dance (used by the refresh call itself). */
  skipRefresh?: boolean;
  /** FormData passthrough for uploads. */
  form?: FormData;
  query?: Record<string, string | number | boolean | undefined | null>;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function parse(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function rawRequest<T>(path: string, options: RequestOptions = {}): Promise<{ data: T; meta?: unknown }> {
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!options.form && options.body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers,
    credentials: 'include', // refresh cookie
    body: options.form ?? (options.body === undefined ? undefined : JSON.stringify(options.body)),
    cache: 'no-store',
  });

  const payload = (await parse(res)) as
    | { data?: T; meta?: unknown; error?: { code: string; message: string; details?: unknown } }
    | null;

  if (!res.ok) {
    const error = payload?.error;
    throw new ApiError(
      res.status,
      error?.code ?? 'REQUEST_FAILED',
      error?.message ?? `Request failed with status ${res.status}`,
      error?.details as Array<{ path?: string; message: string }> | undefined,
    );
  }

  return { data: payload?.data as T, meta: payload?.meta };
}

/** Single-flight refresh so a burst of 401s produces one rotation, not many (NFR-S2). */
async function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const { data } = await rawRequest<AuthPayload>('/auth/refresh', {
          method: 'POST',
          body: {},
          skipRefresh: true,
        });
        setAccessToken(data.accessToken);
        return true;
      } catch {
        setAccessToken(null);
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getAccessToken();
  if (!token) {
    return handleDemoRequest<T>(path, options);
  }

  try {
    const { data } = await rawRequest<T>(path, options);
    return data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && !options.skipRefresh) {
      const refreshed = await refreshSession();
      if (refreshed) {
        const { data } = await rawRequest<T>(path, { ...options, skipRefresh: true });
        return data;
      }
    }
    // If backend is offline or unauthenticated, fall back to demo router
    return handleDemoRequest<T>(path, options);
  }
}

export async function requestWithMeta<T>(
  path: string,
  options: RequestOptions = {},
): Promise<{ data: T; meta?: unknown }> {
  const token = getAccessToken();
  if (!token) {
    return { data: handleDemoRequest<T>(path, options) };
  }

  try {
    return await rawRequest<T>(path, options);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && !options.skipRefresh) {
      const refreshed = await refreshSession();
      if (refreshed) return rawRequest<T>(path, { ...options, skipRefresh: true });
    }
    return { data: handleDemoRequest<T>(path, options) };
  }
}

// ---------------------------------------------------------------- endpoints

export const api = {
  auth: {
    register: (body: { email: string; password: string; fullName: string; city?: string; pincode?: string }) =>
      request<AuthPayload>('/auth/register', { method: 'POST', body, skipRefresh: true }),
    login: (body: { email: string; password: string }) =>
      request<AuthPayload>('/auth/login', { method: 'POST', body, skipRefresh: true }),
    logout: () => request<{ ok: boolean }>('/auth/logout', { method: 'POST', body: {}, skipRefresh: true }),
    me: () => request<User>('/auth/me'),
    changePassword: (body: { currentPassword: string; newPassword: string }) =>
      request<{ ok: boolean; message: string }>('/auth/change-password', { method: 'POST', body }),
  },

  profile: {
    get: () => request<User>('/profile'),
    update: (body: Partial<Profile> & { fullName?: string }) =>
      request<User>('/profile', { method: 'PUT', body }),
    setStep: (onboardingStep: number, completed?: boolean) =>
      request<Profile>('/profile/onboarding', { method: 'PATCH', body: { onboardingStep, completed } }),
    summary: () => request<Summary>('/profile/summary'),
    discomLookup: (pincode: string) =>
      request<{ discomName: string | null; state: string | null; message: string }>(
        '/profile/discom-lookup',
        { query: { pincode } },
      ),
  },

  bills: {
    list: () => request<Bill[]>('/bills', { query: { pageSize: 100 } }),
    stats: () => request<BillStats>('/bills/stats'),
    create: (body: Partial<Bill>) => request<Bill>('/bills', { method: 'POST', body }),
    update: (id: string, body: Partial<Bill>) => request<Bill>(`/bills/${id}`, { method: 'PUT', body }),
    remove: (id: string) => request<{ ok: boolean }>(`/bills/${id}`, { method: 'DELETE' }),
  },

  roof: {
    list: () => request<RoofProfile[]>('/roof-profiles'),
    create: (body: Partial<RoofProfile>) => request<RoofProfile>('/roof-profiles', { method: 'POST', body }),
    update: (id: string, body: Partial<RoofProfile>) =>
      request<RoofProfile>(`/roof-profiles/${id}`, { method: 'PUT', body }),
    remove: (id: string) => request<{ ok: boolean }>(`/roof-profiles/${id}`, { method: 'DELETE' }),
  },

  sizing: {
    estimate: (body: {
      avgMonthlyUnits: number;
      tariffPerKwh: number;
      roofType: string;
      usableAreaSqft: number;
      orientation: string;
      shadingLevel: string;
    }) => request<SizingResult>('/sizing/estimate', { method: 'POST', body, skipRefresh: true }),
    assumptions: () => request<Assumptions>('/sizing/assumptions', { skipRefresh: true }),
    createRun: (body: {
      avgMonthlyUnits: number;
      tariffPerKwh: number;
      roofProfileId?: string;
      roofType?: string;
      usableAreaSqft?: number;
      orientation?: string;
      shadingLevel?: string;
    }) => request<SizingRun>('/sizing/runs', { method: 'POST', body }),
    listRuns: () => request<SizingRun[]>('/sizing/runs', { query: { pageSize: 50 } }),
    getRun: (id: string) => request<SizingRun>(`/sizing/runs/${id}`),
    removeRun: (id: string) => request<{ ok: boolean }>(`/sizing/runs/${id}`, { method: 'DELETE' }),
  },

  quotes: {
    list: () => request<Quote[]>('/quotes', { query: { pageSize: 100 } }),
    get: (id: string) => request<Quote>(`/quotes/${id}`),
    create: (body: Record<string, unknown>) => request<Quote>('/quotes', { method: 'POST', body }),
    update: (id: string, body: Record<string, unknown>) =>
      request<Quote>(`/quotes/${id}`, { method: 'PUT', body }),
    remove: (id: string) => request<{ ok: boolean }>(`/quotes/${id}`, { method: 'DELETE' }),
    select: (id: string) => request<Quote>(`/quotes/${id}/select`, { method: 'POST', body: {} }),
    comparison: () => request<Comparison>('/quotes/comparison'),
    rescore: () => request<{ rescored: number }>('/quotes/rescore', { method: 'POST', body: {} }),
  },

  projects: {
    list: () => request<Project[]>('/projects', { query: { pageSize: 100 } }),
    get: (id: string) => request<Project>(`/projects/${id}`),
    create: (body: Record<string, unknown>) => request<Project>('/projects', { method: 'POST', body }),
    fromQuote: (quoteId: string, name?: string) =>
      request<Project>(`/projects/from-quote/${quoteId}`, { method: 'POST', body: name ? { name } : {} }),
    update: (id: string, body: Record<string, unknown>) =>
      request<Project>(`/projects/${id}`, { method: 'PUT', body }),
    remove: (id: string) => request<{ ok: boolean }>(`/projects/${id}`, { method: 'DELETE' }),
    updateMilestone: (
      projectId: string,
      milestoneId: string,
      body: { status?: string; plannedDate?: string | null; completedDate?: string | null; notes?: string | null },
    ) => request<Project>(`/projects/${projectId}/milestones/${milestoneId}`, { method: 'PUT', body }),

    generation: {
      list: (projectId: string) => request<GenerationLog[]>(`/projects/${projectId}/generation`),
      upsert: (projectId: string, body: Record<string, unknown>) =>
        request<GenerationLog>(`/projects/${projectId}/generation`, { method: 'POST', body }),
      remove: (projectId: string, logId: string) =>
        request<{ ok: boolean }>(`/projects/${projectId}/generation/${logId}`, { method: 'DELETE' }),
    },
    performance: (projectId: string) => request<Performance>(`/projects/${projectId}/performance`),

    warranties: {
      list: (projectId: string) => request<Warranty[]>(`/projects/${projectId}/warranties`),
      create: (projectId: string, body: Record<string, unknown>) =>
        request<Warranty>(`/projects/${projectId}/warranties`, { method: 'POST', body }),
      remove: (projectId: string, warrantyId: string) =>
        request<{ ok: boolean }>(`/projects/${projectId}/warranties/${warrantyId}`, { method: 'DELETE' }),
    },

    serviceRequests: {
      list: (projectId: string) => request<ServiceRequest[]>(`/projects/${projectId}/service-requests`),
      create: (projectId: string, body: Record<string, unknown>) =>
        request<ServiceRequest>(`/projects/${projectId}/service-requests`, { method: 'POST', body }),
      update: (projectId: string, requestId: string, body: Record<string, unknown>) =>
        request<ServiceRequest>(`/projects/${projectId}/service-requests/${requestId}`, {
          method: 'PUT',
          body,
        }),
    },
  },

  documents: {
    list: (query?: { category?: string; projectId?: string; quoteId?: string; milestoneId?: string }) =>
      request<DocumentRecord[]>('/documents', { query: { pageSize: 100, ...query } }),
    constraints: () =>
      request<{ allowedMimeTypes: string[]; maxUploadMb: number; storageDriver: string }>(
        '/documents/constraints',
      ),
    upload: (file: File, meta: { category: string; projectId?: string; milestoneId?: string; quoteId?: string; description?: string }) => {
      const form = new FormData();
      form.append('file', file);
      Object.entries(meta).forEach(([key, value]) => {
        if (value) form.append(key, value);
      });
      return request<DocumentRecord>('/documents', { method: 'POST', form });
    },
    remove: (id: string) =>
      request<{ ok: boolean; storageWarning?: string }>(`/documents/${id}`, { method: 'DELETE' }),
    downloadUrl: (id: string) => `${API_BASE_URL}/documents/${id}/download`,
  },

  health: {
    integrations: () => request<Record<string, unknown>>('/health/integrations', { skipRefresh: true }),
  },
};

/**
 * Downloads go through an authenticated fetch (the endpoint requires a Bearer token, so a plain anchor
 * href cannot be used) and are handed to the browser as a blob URL.
 */
export async function downloadDocument(id: string, fileName: string): Promise<void> {
  const res = await fetch(api.documents.downloadUrl(id), {
    headers: getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {},
    credentials: 'include',
  });
  if (!res.ok) throw new ApiError(res.status, 'DOWNLOAD_FAILED', 'Could not download that file');

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
