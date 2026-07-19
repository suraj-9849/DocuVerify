import { AuditAction, DocumentStatus, Prisma, Role, type User } from '@prisma/client';
import { prisma } from '../../config/prisma';
import {
  ForbiddenError,
  InvalidTransitionError,
  NotFoundError,
  StaleWriteError,
} from '../../utils/AppError';
import type {
  CreateDocumentInput,
  ListDocumentsQuery,
  RejectInput,
  UpdateDocumentInput,
  VersionedActionInput,
} from './documents.schema';

function visibilityWhere(user: User): Prisma.DocumentWhereInput {
  switch (user.role) {
    case Role.ADMIN:
      return {}; 
    case Role.REVIEWER:
      return {};
    case Role.AUTHOR:
      return {
        OR: [{ authorId: user.id }, { status: DocumentStatus.PUBLISHED }],
      };
    case Role.VIEWER:
    default:
      return { status: DocumentStatus.PUBLISHED };
  }
}

async function assertVisible(user: User, documentId: string) {
  const doc = await prisma.document.findFirst({
    where: { id: documentId, ...visibilityWhere(user) },
  });
  if (!doc) {
    throw new NotFoundError('Document not found');
  }
  return doc;
}

export const documentsService = {
  async list(user: User, query: ListDocumentsQuery) {
    const where: Prisma.DocumentWhereInput = { ...visibilityWhere(user) };

    if (query.status) where.status = query.status;
    if (query.mine) where.authorId = user.id;

    return prisma.document.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  },

  async getById(user: User, documentId: string) {
    const doc = await assertVisible(user, documentId);
    return prisma.document.findUnique({
      where: { id: doc.id },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  },

  async getHistory(user: User, documentId: string) {
    await assertVisible(user, documentId);
    return prisma.auditEvent.findMany({
      where: { documentId },
      orderBy: { createdAt: 'asc' },
      include: { actor: { select: { id: true, name: true, email: true, role: true } } },
    });
  },

  async create(user: User, input: CreateDocumentInput) {
    if (user.role !== Role.AUTHOR) {
      throw new ForbiddenError('Only authors can create documents');
    }

    return prisma.$transaction(async (tx) => {
      const doc = await tx.document.create({
        data: {
          title: input.title,
          body: input.body,
          status: DocumentStatus.DRAFT,
          authorId: user.id,
        },
      });

      await tx.auditEvent.create({
        data: {
          documentId: doc.id,
          actorId: user.id,
          action: AuditAction.CREATED,
          newStatus: DocumentStatus.DRAFT,
        },
      });

      return doc;
    });
  },

  async update(user: User, documentId: string, input: UpdateDocumentInput) {
    const doc = await requireExists(documentId);

    if (doc.authorId !== user.id) {
      throw new ForbiddenError('Only the owner can edit this document');
    }
    if (doc.status !== DocumentStatus.DRAFT && doc.status !== DocumentStatus.REJECTED) {
      throw new InvalidTransitionError(
        `A document in "${doc.status}" cannot be edited. Only draft or rejected documents are editable.`,
      );
    }

    return transitionWithAudit({
      documentId,
      expectedVersion: input.version,
      actorId: user.id,
      action: AuditAction.EDITED,
      data: { title: input.title, body: input.body },
    });
  },

  async submit(user: User, documentId: string, input: VersionedActionInput) {
    const doc = await requireExists(documentId);

    if (doc.authorId !== user.id) {
      throw new ForbiddenError('Only the owner can submit this document');
    }
    assertTransitionAllowed(doc.status, DocumentStatus.DRAFT, DocumentStatus.SUBMITTED);

    return transitionWithAudit({
      documentId,
      expectedVersion: input.version,
      actorId: user.id,
      action: AuditAction.SUBMITTED,
      newStatus: DocumentStatus.SUBMITTED,
      prevStatus: doc.status,
    });
  },

  async approve(user: User, documentId: string, input: VersionedActionInput) {
    const doc = await requireExists(documentId);

    if (user.role !== Role.REVIEWER && user.role !== Role.ADMIN) {
      throw new ForbiddenError('Only reviewers can approve documents');
    }
    if (doc.authorId === user.id) {
      throw new ForbiddenError('You cannot approve your own document');
    }
    assertTransitionAllowed(doc.status, DocumentStatus.SUBMITTED, DocumentStatus.APPROVED);

    return transitionWithAudit({
      documentId,
      expectedVersion: input.version,
      actorId: user.id,
      action: AuditAction.APPROVED,
      newStatus: DocumentStatus.APPROVED,
      prevStatus: doc.status,
    });
  },

  async reject(user: User, documentId: string, input: RejectInput) {
    const doc = await requireExists(documentId);

    if (user.role !== Role.REVIEWER && user.role !== Role.ADMIN) {
      throw new ForbiddenError('Only reviewers can reject documents');
    }
    if (doc.authorId === user.id) {
      throw new ForbiddenError('You cannot reject your own document');
    }
    assertTransitionAllowed(doc.status, DocumentStatus.SUBMITTED, DocumentStatus.REJECTED);

    return transitionWithAudit({
      documentId,
      expectedVersion: input.version,
      actorId: user.id,
      action: AuditAction.REJECTED,
      newStatus: DocumentStatus.REJECTED,
      prevStatus: doc.status,
      comment: input.comment,
    });
  },

  async reopen(user: User, documentId: string, input: VersionedActionInput) {
    const doc = await requireExists(documentId);

    if (doc.authorId !== user.id) {
      throw new ForbiddenError('Only the owner can reopen this document');
    }
    assertTransitionAllowed(doc.status, DocumentStatus.REJECTED, DocumentStatus.DRAFT);

    return transitionWithAudit({
      documentId,
      expectedVersion: input.version,
      actorId: user.id,
      action: AuditAction.REOPENED,
      newStatus: DocumentStatus.DRAFT,
      prevStatus: doc.status,
    });
  },

  async publish(user: User, documentId: string, input: VersionedActionInput) {
    const doc = await requireExists(documentId);

    if (user.role !== Role.REVIEWER && user.role !== Role.ADMIN) {
      throw new ForbiddenError('Only a reviewer or admin can publish a document');
    }
    assertTransitionAllowed(doc.status, DocumentStatus.APPROVED, DocumentStatus.PUBLISHED);

    return transitionWithAudit({
      documentId,
      expectedVersion: input.version,
      actorId: user.id,
      action: AuditAction.PUBLISHED,
      newStatus: DocumentStatus.PUBLISHED,
      prevStatus: doc.status,
    });
  },

  async archive(user: User, documentId: string, input: VersionedActionInput) {
    const doc = await requireExists(documentId);

    if (user.role !== Role.ADMIN) {
      throw new ForbiddenError('Only an admin can archive a document');
    }
    const archivableFrom: DocumentStatus[] = [
      DocumentStatus.DRAFT,
      DocumentStatus.SUBMITTED,
      DocumentStatus.APPROVED,
      DocumentStatus.PUBLISHED,
      DocumentStatus.REJECTED,
    ];
    if (!archivableFrom.includes(doc.status)) {
      throw new InvalidTransitionError(`A document in "${doc.status}" cannot be archived.`);
    }

    return transitionWithAudit({
      documentId,
      expectedVersion: input.version,
      actorId: user.id,
      action: AuditAction.ARCHIVED,
      newStatus: DocumentStatus.ARCHIVED,
      prevStatus: doc.status,
    });
  },
};

async function requireExists(documentId: string) {
  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc) throw new NotFoundError('Document not found');
  return doc;
}

function assertTransitionAllowed(
  current: DocumentStatus,
  requiredFrom: DocumentStatus,
  target: DocumentStatus,
) {
  if (current !== requiredFrom) {
    throw new InvalidTransitionError(
      `Cannot move from "${current}" to "${target}". This document must be in "${requiredFrom}" first.`,
    );
  }
}

interface TransitionParams {
  documentId: string;
  expectedVersion: number;
  actorId: string;
  action: AuditAction;
  newStatus?: DocumentStatus;
  prevStatus?: DocumentStatus;
  comment?: string;
  data?: { title: string; body: string };
}

async function transitionWithAudit(params: TransitionParams) {
  const { documentId, expectedVersion, actorId, action, newStatus, prevStatus, comment, data } =
    params;

  try {
    return await prisma.$transaction(async (tx) => {
      const updated = await tx.document.update({
        where: {
          id: documentId,
          version: expectedVersion, 
        },
        data: {
          ...(data ?? {}),
          ...(newStatus ? { status: newStatus } : {}),
          version: { increment: 1 },
        },
      });

      await tx.auditEvent.create({
        data: {
          documentId,
          actorId,
          action,
          comment,
          prevStatus,
          newStatus,
        },
      });

      return updated;
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new StaleWriteError();
    }
    throw err;
  }
}
