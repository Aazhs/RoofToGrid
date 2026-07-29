/** Rate limits (NFR-S5): global 300/15 min, auth 20/15 min, public sizing 30/15 min. */
import rateLimit, { type Options } from 'express-rate-limit';
import { env } from '../config/env';

const WINDOW_MS = 15 * 60 * 1000;

function make(max: number, message: string): ReturnType<typeof rateLimit> {
  const options: Partial<Options> = {
    windowMs: WINDOW_MS,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => env.isTest,
    handler: (_req, res) => {
      res.status(429).json({ error: { code: 'RATE_LIMITED', message } });
    },
  };
  return rateLimit(options);
}

export const globalLimiter = make(300, 'Too many requests. Please slow down and try again shortly.');

export const authLimiter = make(
  20,
  'Too many sign-in attempts. Please wait a few minutes before trying again.',
);

export const publicSizingLimiter = make(
  30,
  'You have run a lot of estimates. Create a free account to keep going.',
);

export const uploadLimiter = make(60, 'Too many uploads in a short time. Please try again shortly.');
