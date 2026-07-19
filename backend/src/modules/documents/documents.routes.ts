import { Router } from 'express';
import { documentsController } from './documents.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import {
  createDocumentSchema,
  idParamSchema,
  listDocumentsQuerySchema,
  rejectSchema,
  updateDocumentSchema,
  versionedActionSchema,
} from './documents.schema';

export const documentsRouter = Router();

documentsRouter.use(requireAuth);

documentsRouter.get(
  '/',
  validate({ query: listDocumentsQuerySchema }),
  asyncHandler(documentsController.list),
);

documentsRouter.post(
  '/',
  validate({ body: createDocumentSchema }),
  asyncHandler(documentsController.create),
);

documentsRouter.get(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(documentsController.getById),
);

documentsRouter.get(
  '/:id/history',
  validate({ params: idParamSchema }),
  asyncHandler(documentsController.getHistory),
);

documentsRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateDocumentSchema }),
  asyncHandler(documentsController.update),
);

documentsRouter.post(
  '/:id/submit',
  validate({ params: idParamSchema, body: versionedActionSchema }),
  asyncHandler(documentsController.submit),
);

documentsRouter.post(
  '/:id/approve',
  validate({ params: idParamSchema, body: versionedActionSchema }),
  asyncHandler(documentsController.approve),
);

documentsRouter.post(
  '/:id/reject',
  validate({ params: idParamSchema, body: rejectSchema }),
  asyncHandler(documentsController.reject),
);

documentsRouter.post(
  '/:id/reopen',
  validate({ params: idParamSchema, body: versionedActionSchema }),
  asyncHandler(documentsController.reopen),
);

documentsRouter.post(
  '/:id/publish',
  validate({ params: idParamSchema, body: versionedActionSchema }),
  asyncHandler(documentsController.publish),
);

documentsRouter.post(
  '/:id/archive',
  validate({ params: idParamSchema, body: versionedActionSchema }),
  asyncHandler(documentsController.archive),
);
