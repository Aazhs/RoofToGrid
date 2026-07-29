import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, sendData } from '../../lib/http';
import { requireAuth } from '../../middleware/auth';
import { idParam, validate } from '../../middleware/validate';
import { monitoringRouter } from '../monitoring/routes';
import {
  createProjectSchema,
  fromQuoteSchema,
  listProjectsQuery,
  milestoneParams,
  updateMilestoneSchema,
  updateProjectSchema,
  type CreateProjectInput,
  type ListProjectsQuery,
  type UpdateMilestoneInput,
  type UpdateProjectInput,
} from './schema';
import * as service from './service';

export const projectsRouter = Router();

projectsRouter.use(requireAuth);

projectsRouter.get(
  '/',
  validate({ query: listProjectsQuery }),
  asyncHandler(async (req, res) => {
    const { items, meta } = await service.listProjects(
      req.auth!.userId,
      req.valid?.query as ListProjectsQuery,
    );
    sendData(res, items, 200, meta);
  }),
);

/** Lifecycle template — declared before `/:id` so it is not read as an id. */
projectsRouter.get('/milestone-template', (_req, res) => {
  sendData(res, service.milestoneTemplate());
});

projectsRouter.post(
  '/',
  validate({ body: createProjectSchema }),
  asyncHandler(async (req, res) => {
    sendData(res, await service.createProject(req.auth!.userId, req.valid?.body as CreateProjectInput), 201);
  }),
);

/** AC-C1 */
projectsRouter.post(
  '/from-quote/:quoteId',
  validate({ params: z.object({ quoteId: z.string().min(1) }), body: fromQuoteSchema }),
  asyncHandler(async (req, res) => {
    const { quoteId } = req.valid?.params as { quoteId: string };
    const { name } = req.valid?.body as { name?: string };
    sendData(res, await service.createProjectFromQuote(req.auth!.userId, quoteId, name), 201);
  }),
);

projectsRouter.get(
  '/:id',
  validate({ params: idParam }),
  asyncHandler(async (req, res) => {
    const { id } = req.valid?.params as { id: string };
    sendData(res, await service.getProject(req.auth!.userId, id));
  }),
);

projectsRouter.put(
  '/:id',
  validate({ params: idParam, body: updateProjectSchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.valid?.params as { id: string };
    sendData(res, await service.updateProject(req.auth!.userId, id, req.valid?.body as UpdateProjectInput));
  }),
);

projectsRouter.delete(
  '/:id',
  validate({ params: idParam }),
  asyncHandler(async (req, res) => {
    const { id } = req.valid?.params as { id: string };
    await service.deleteProject(req.auth!.userId, id);
    sendData(res, { ok: true });
  }),
);

/** AC-C3 / AC-C4 / AC-C7 */
projectsRouter.put(
  '/:id/milestones/:milestoneId',
  validate({ params: milestoneParams, body: updateMilestoneSchema }),
  asyncHandler(async (req, res) => {
    const { id, milestoneId } = req.valid?.params as { id: string; milestoneId: string };
    sendData(
      res,
      await service.updateMilestone(
        req.auth!.userId,
        id,
        milestoneId,
        req.valid?.body as UpdateMilestoneInput,
      ),
    );
  }),
);

// Monitoring lives under /projects/:id/* (generation, performance, warranties, service requests).
projectsRouter.use('/', monitoringRouter);
