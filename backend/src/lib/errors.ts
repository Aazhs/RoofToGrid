/**
 * Error taxonomy. One class, machine-readable `code`, mapped to HTTP by the error middleware
 * (design §6, NFR-S8).
 */

export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;
  readonly expose: boolean;

  constructor(code: string, status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.expose = status < 500;
    Error.captureStackTrace?.(this, AppError);
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new AppError('BAD_REQUEST', 400, message, details);

export const unauthorized = (message = 'Authentication required') =>
  new AppError('UNAUTHORIZED', 401, message);

export const forbidden = (message = 'You do not have access to this resource') =>
  new AppError('FORBIDDEN', 403, message);

/** Not-found doubles as not-owned so tenancy never leaks (AC-C8, NFR-S6). */
export const notFound = (resource = 'Resource') =>
  new AppError('NOT_FOUND', 404, `${resource} not found`);

export const conflict = (message: string, code = 'CONFLICT') => new AppError(code, 409, message);

export const unsupportedMediaType = (message: string) =>
  new AppError('UNSUPPORTED_FILE_TYPE', 415, message); // AC-A4 / AC-E2

export const validationError = (message: string, details?: unknown) =>
  new AppError('VALIDATION_ERROR', 422, message, details);

export const payloadTooLarge = (message: string) => new AppError('FILE_TOO_LARGE', 413, message);

export const tooManyRequests = (message = 'Too many requests, please try again later') =>
  new AppError('RATE_LIMITED', 429, message);

export const notImplemented = (feature: string) =>
  new AppError('NOT_IMPLEMENTED', 501, `${feature} is not available yet`);

export const serviceUnavailable = (message: string) =>
  new AppError('SERVICE_UNAVAILABLE', 503, message);
