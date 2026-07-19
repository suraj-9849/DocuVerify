export type Role = 'VIEWER' | 'AUTHOR' | 'REVIEWER' | 'ADMIN';

export type DocumentStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export type AuditAction =
  | 'CREATED'
  | 'EDITED'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'REOPENED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt?: string;
}

export interface DocumentAuthor {
  id: string;
  name: string;
  email: string;
}

export interface Document {
  id: string;
  title: string;
  body: string;
  status: DocumentStatus;
  version: number;
  authorId: string;
  author: DocumentAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  documentId: string;
  actorId: string;
  actor: { id: string; name: string; email: string; role: Role };
  action: AuditAction;
  comment: string | null;
  prevStatus: DocumentStatus | null;
  newStatus: DocumentStatus | null;
  createdAt: string;
}

export interface ApiErrorShape {
  error: { code: string; message: string; details?: unknown };
}
