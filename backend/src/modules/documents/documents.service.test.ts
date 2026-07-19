import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DocumentStatus, Prisma, Role } from '@prisma/client';


const mockDb = vi.hoisted(() => ({
  document: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn(), create: vi.fn() },
  auditEvent: { create: vi.fn(), findMany: vi.fn() },
  $transaction: vi.fn(async (cb: (tx: unknown) => unknown) => cb(mockDb)),
}));

vi.mock('../../config/prisma', () => ({ prisma: mockDb }));

const { documentsService } = await import('./documents.service');

const author = { id: 'author-1', role: Role.AUTHOR } as never;
const otherAuthor = { id: 'author-2', role: Role.AUTHOR } as never;
const reviewer = { id: 'reviewer-1', role: Role.REVIEWER } as never;
const admin = { id: 'admin-1', role: Role.ADMIN } as never;

function doc(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'doc-1',
    title: 't',
    body: 'b',
    status: DocumentStatus.DRAFT,
    version: 1,
    authorId: 'author-1',
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockDb.$transaction.mockImplementation(async (cb: (tx: unknown) => unknown) => cb(mockDb));
});

describe('documents.service — state machine', () => {
  it('rejects submit from a non-draft state', async () => {
    mockDb.document.findUnique.mockResolvedValue(doc({ status: DocumentStatus.APPROVED }));
    await expect(documentsService.submit(author, 'doc-1', { version: 1 })).rejects.toThrow(
      /must be in "DRAFT"/,
    );
  });

  it('rejects submit by a non-owner', async () => {
    mockDb.document.findUnique.mockResolvedValue(doc());
    await expect(documentsService.submit(otherAuthor, 'doc-1', { version: 1 })).rejects.toThrow(
      /Only the owner/,
    );
  });

  it('rejects a reviewer approving their own document', async () => {
    mockDb.document.findUnique.mockResolvedValue(
      doc({ status: DocumentStatus.SUBMITTED, authorId: reviewer.id }),
    );
    await expect(documentsService.approve(reviewer, 'doc-1', { version: 1 })).rejects.toThrow(
      /cannot approve your own document/,
    );
  });

  it('rejects rejection without a comment at the schema layer (service assumes validated input)', async () => {
    mockDb.document.findUnique.mockResolvedValue(doc({ status: DocumentStatus.SUBMITTED }));
    mockDb.document.update.mockResolvedValue(doc({ status: DocumentStatus.REJECTED, version: 2 }));
    await expect(
      documentsService.reject(reviewer, 'doc-1', { version: 1, comment: 'needs work' }),
    ).resolves.toBeDefined();
  });

  it('only admin/reviewer can publish, and only from APPROVED', async () => {
    mockDb.document.findUnique.mockResolvedValue(doc({ status: DocumentStatus.DRAFT }));
    await expect(documentsService.publish(admin, 'doc-1', { version: 1 })).rejects.toThrow(
      /must be in "APPROVED"/,
    );
  });

  it('raises a stale-write conflict when the version no longer matches', async () => {
    mockDb.document.findUnique.mockResolvedValue(doc({ status: DocumentStatus.SUBMITTED }));
    const prismaError = new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: '6.1.0',
    });
    mockDb.document.update.mockRejectedValue(prismaError);

    await expect(documentsService.approve(reviewer, 'doc-1', { version: 1 })).rejects.toThrow(
      /changed by someone else/,
    );
  });

  it('only admin can archive', async () => {
    mockDb.document.findUnique.mockResolvedValue(doc({ status: DocumentStatus.PUBLISHED }));
    await expect(documentsService.archive(reviewer, 'doc-1', { version: 1 })).rejects.toThrow(
      /Only an admin/,
    );
  });
});
