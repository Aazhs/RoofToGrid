/** API surface, versioned under /api/v1 (NFR-X5, design §4). */
import { Router } from 'express';
import { authRouter } from './modules/auth/routes';
import { billsRouter } from './modules/bills/routes';
import { documentsRouter } from './modules/documents/routes';
import { healthRouter } from './modules/health/routes';
import { profileRouter } from './modules/profile/routes';
import { projectsRouter } from './modules/projects/routes';
import { quotesRouter } from './modules/quotes/routes';
import { roofRouter } from './modules/roof/routes';
import { sizingRouter } from './modules/sizing/routes';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/profile', profileRouter);
apiRouter.use('/bills', billsRouter);
apiRouter.use('/roof-profiles', roofRouter);
apiRouter.use('/sizing', sizingRouter);
apiRouter.use('/quotes', quotesRouter);
apiRouter.use('/projects', projectsRouter);
apiRouter.use('/documents', documentsRouter);

apiRouter.get('/', (_req, res) => {
  res.json({
    data: {
      name: 'RoofToGrid API',
      version: 'v1',
      status: 'operational',
      endpoints: [
        '/api/v1/health',
        '/api/v1/auth',
        '/api/v1/profile',
        '/api/v1/bills',
        '/api/v1/roof-profiles',
        '/api/v1/sizing',
        '/api/v1/quotes',
        '/api/v1/projects',
        '/api/v1/documents',
      ],
    },
  });
});
