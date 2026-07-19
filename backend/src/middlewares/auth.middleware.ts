import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ForbiddenError, UnauthorizedError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';

export const attachUser = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const userId = req.session.userId;
  if (!userId) return next();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    req.user = user;
  } else {
    req.session.userId = undefined;
  }
  next();
});

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError('You must be logged in to do that');
  }
  next();
};
export const requireRole = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('You must be logged in to do that');
    }
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(
        `This action requires one of these roles: ${roles.join(', ')}`,
      );
    }
    next();
  };
};
