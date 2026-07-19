import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid document id'),
});

export const createDocumentSchema = z.object({
  title: z.string().trim().min(1, 'Title cannot be empty').max(200),
  body: z.string().trim().min(1, 'Body cannot be empty').max(50000),
});

export const updateDocumentSchema = z.object({
  title: z.string().trim().min(1, 'Title cannot be empty').max(200),
  body: z.string().trim().min(1, 'Body cannot be empty').max(50000),
  version: z.number().int().positive(),
});


export const versionedActionSchema = z.object({
  version: z.number().int().positive(),
});

export const rejectSchema = z.object({
  version: z.number().int().positive(),
  comment: z.string().trim().min(1, 'A comment is required to reject a document').max(2000),
});

export const listDocumentsQuerySchema = z.object({
  status: z
    .enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ARCHIVED'])
    .optional(),
  mine: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type VersionedActionInput = z.infer<typeof versionedActionSchema>;
export type RejectInput = z.infer<typeof rejectSchema>;
export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;
