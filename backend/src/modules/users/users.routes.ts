import { Router } from 'express';
import { usersController } from './users.controller';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createUserSchema, updateUserRoleSchema, idParamSchema } from './users.schema';

export const usersRouter = Router();

usersRouter.use(requireAuth);
usersRouter.use(requireRole('ADMIN'));

usersRouter.get('/', asyncHandler(usersController.list));
usersRouter.post('/', validate({ body: createUserSchema }), asyncHandler(usersController.create));
usersRouter.patch('/:id/role', validate({ params: idParamSchema, body: updateUserRoleSchema }), asyncHandler(usersController.updateRole));
usersRouter.delete('/:id', validate({ params: idParamSchema }), asyncHandler(usersController.delete));
