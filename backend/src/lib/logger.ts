/** Structured JSON logging with request ids and PII redaction (NFR-S8). */
import pino from 'pino';
import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import pinoHttp from 'pino-http';
import { env } from '../config/env';

export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: 'rooftogrid-api', env: env.NODE_ENV },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.currentPassword',
      'req.body.newPassword',
      'req.body.refreshToken',
      'res.headers["set-cookie"]',
      'password',
      'passwordHash',
      'token',
      'accessToken',
      'refreshToken',
    ],
    censor: '[redacted]',
  },
  transport:
    env.isProduction || env.isTest
      ? undefined
      : { target: 'pino/file', options: { destination: 1 } },
});

export const httpLogger = pinoHttp({
  logger,
  autoLogging: { ignore: (req) => req.url === '/health' || req.url === '/api/v1/health' },
  genReqId: (req: IncomingMessage, res: ServerResponse) => {
    const existing = (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
    res.setHeader('x-request-id', existing);
    return existing;
  },
  customLogLevel: (req, res, err) => {
    // A failing readiness probe is expected signal, not an application error worth a stack trace.
    if (req.url?.startsWith('/api/v1/health')) return res.statusCode >= 500 ? 'warn' : 'debug';
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req: (req) => ({ id: req.id, method: req.method, url: req.url }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
});
