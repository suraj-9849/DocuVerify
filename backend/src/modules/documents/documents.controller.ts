import type { Request, Response } from 'express';
import { documentsService } from './documents.service';

export const documentsController = {
  async list(req: Request, res: Response) {
    const docs = await documentsService.list(req.user!, req.query as never);
    res.status(200).json({ data: docs });
  },

  async getById(req: Request, res: Response) {
    const doc = await documentsService.getById(req.user!, req.params.id as string);
    res.status(200).json({ data: doc });
  },

  async getHistory(req: Request, res: Response) {
    const events = await documentsService.getHistory(req.user!, req.params.id as string);
    res.status(200).json({ data: events });
  },

  async create(req: Request, res: Response) {
    const doc = await documentsService.create(req.user!, req.body);
    res.status(201).json({ data: doc });
  },

  async update(req: Request, res: Response) {
    const doc = await documentsService.update(req.user!, req.params.id as string, req.body);
    res.status(200).json({ data: doc });
  },

  async submit(req: Request, res: Response) {
    const doc = await documentsService.submit(req.user!, req.params.id as string, req.body);
    res.status(200).json({ data: doc });
  },

  async approve(req: Request, res: Response) {
    const doc = await documentsService.approve(req.user!, req.params.id as string, req.body);
    res.status(200).json({ data: doc });
  },

  async reject(req: Request, res: Response) {
    const doc = await documentsService.reject(req.user!, req.params.id as string, req.body);
    res.status(200).json({ data: doc });
  },

  async reopen(req: Request, res: Response) {
    const doc = await documentsService.reopen(req.user!, req.params.id as string, req.body);
    res.status(200).json({ data: doc });
  },

  async publish(req: Request, res: Response) {
    const doc = await documentsService.publish(req.user!, req.params.id as string, req.body);
    res.status(200).json({ data: doc });
  },

  async archive(req: Request, res: Response) {
    const doc = await documentsService.archive(req.user!, req.params.id as string, req.body);
    res.status(200).json({ data: doc });
  },
};
