import type { Request, Response } from 'express';
import { authService } from './auth.service';
import { UnauthorizedError } from '../../utils/AppError';

export const authController = {
  async login(req: Request, res: Response) {
    const user = await authService.login(req.body);

    req.session.regenerate((err) => {
      if (err) throw err;
      req.session.userId = user.id;
      res.status(200).json({ data: toPublicUser(user) });
    });
  },

  async logout(req: Request, res: Response) {
    req.session.destroy((err) => {
      if (err) throw err;
      res.clearCookie('docuverify.sid');
      res.status(204).send();
    });
  },

  async me(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError('Not logged in');
    res.status(200).json({ data: toPublicUser(req.user) });
  },
};

function toPublicUser(user: { id: string; email: string; name: string; role: string }) {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}
