/** Request augmentation for auth context and validated input. */
import type { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface AuthContext {
      userId: string;
      email: string;
      role: UserRole;
    }

    interface Request {
      /** Set by requireAuth / optionalAuth. */
      auth?: AuthContext;
      /** Set by the validate() middleware. Services only ever read from here (NFR-S3). */
      valid?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

export {};
