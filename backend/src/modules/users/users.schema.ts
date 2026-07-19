import { z } from 'zod';
import { Role } from '@prisma/client';

export const createUserSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  name: z.string().trim().min(1, 'Name cannot be empty').max(100),
  role: z.nativeEnum(Role),
});

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid user id'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
