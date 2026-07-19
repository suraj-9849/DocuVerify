import { prisma } from '../../config/prisma';
import { UnauthorizedError } from '../../utils/AppError';
import type { LoginInput } from './auth.schema';
export const authService = {
  async login({ email }: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('No seeded user with that email. Check the seed list.');
    }
    return user;
  },

  async getById(userId: string) {
    return prisma.user.findUnique({ where: { id: userId } });
  },
};
