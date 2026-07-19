import { prisma } from '../../config/prisma';
import { NotFoundError } from '../../utils/AppError';
import type { CreateUserInput, UpdateUserRoleInput } from './users.schema';

export const usersService = {
  async list() {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(input: CreateUserInput) {
    return prisma.user.create({ data: input });
  },

  async updateRole(id: string, input: UpdateUserRoleInput) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('User not found');
    return prisma.user.update({ where: { id }, data: { role: input.role } });
  },

  async delete(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('User not found');
    await prisma.user.delete({ where: { id } });
  },
};
