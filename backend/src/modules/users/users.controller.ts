import type { Request, Response } from 'express';
import { usersService } from './users.service';

export const usersController = {
  async list(_req: Request, res: Response) {
    const users = await usersService.list();
    res.status(200).json({ data: users });
  },

  async create(req: Request, res: Response) {
    const user = await usersService.create(req.body);
    res.status(201).json({ data: user });
  },

  async updateRole(req: Request, res: Response) {
    const user = await usersService.updateRole(req.params.id!, req.body);
    res.status(200).json({ data: user });
  },

  async delete(req: Request, res: Response) {
    await usersService.delete(req.params.id!);
    res.status(204).send();
  },
};
