# DESIGN.md

## What are the most important invariants in your system?

1. **A document can only move along the arrows in the state diagram.** Any
   other (from → to) pair is rejected server-side, always — `draft →
   published` directly, submitting twice, approving a draft, etc.
2. **Every state-changing action produces exactly one audit event, written
   in the same transaction as the state change.** A document can never end
   up published with no record of who published it.
3. **Stale writes never silently win.** If two people act on the same
   document from different "reads", the second one to hit the server on a
   stale version is rejected with a conflict, not allowed to overwrite.
4. **Visibility is enforced identically everywhere.** The same
   `visibilityWhere()` filter backs both the list endpoint and the
   single-document fetch, so there's no "guess the ID" path around it.
5. **Permission checks combine role *and* ownership.** "A reviewer can
   approve" is necessary but not sufficient — "not their own document" is
   checked in the same function, not left to be assumed by the caller.

## Which invariants are enforced by the database, and which by application code?

- **Database:** the `version` column plus the extended unique filter
  (`WHERE id = ? AND version = ?`) on every mutating `UPDATE` — this makes
  optimistic-concurrency enforcement atomic at the DB layer, not a
  check-then-write race in application code. Foreign keys (`Document.authorId`,
  `AuditEvent.documentId/actorId`) guarantee referential integrity. The
  `DocumentStatus`/`Role`/`AuditAction` Postgres enums make invalid values
  impossible to store, independent of the app layer.
- **Application code:** the actual transition graph (which status can move
  to which), role checks, ownership checks, and the "reviewer can't approve
  their own document" rule. These are business rules, not data-shape rules,
  so they belong in the service layer where they can carry a clear error
  message back to the caller.

## How do permissions work?

Two layers, both server-side:
1. **`requireAuth` / `requireRole` middleware** — gates a route entirely
   (must be logged in; must hold one of these roles).
2. **Service-layer checks** — anything that depends on the *specific*
   resource: "only the owner of *this* document can edit it", "you can't
   approve *your own* document". These can't live in middleware because
   they need the document's row, not just the caller's role.

The client never asserts who the user is or what they're allowed to do —
the session cookie only carries an opaque session id; the server looks up
the user and role from that on every request. Hiding a button in the UI is
cosmetic; the same check is repeated in the service function regardless of
what the client sends.

## How do you prevent stale or conflicting updates?

Optimistic concurrency via a `version` integer on `Document`. Every
mutating request (edit, submit, approve, reject, reopen, publish, archive)
must include the `version` the client last read. The update runs as:

```ts
tx.document.update({
  where: { id: documentId, version: expectedVersion },
  data: { ...changes, version: { increment: 1 } },
});
```

If another transaction already bumped the version, this `WHERE` matches
zero rows and Prisma throws `P2025`, which the service maps to a `409
STALE_WRITE`. The frontend's `useDocument` hook catches that specific code,
refetches the document so the user sees the current (correct) state, and
surfaces a clear "someone else changed this" message rather than retrying
the stale write.

## How do you keep audit events consistent with document state changes?

Every transition funnels through one function, `transitionWithAudit()`,
which wraps the document update and the audit-event insert in a single
`prisma.$transaction(...)`. If either write fails, both roll back — there
is no code path that updates status without logging it, or vice versa.
Creation is handled the same way (`create()` wraps the initial insert and
the `CREATED` audit event in one transaction).

## What failure cases did you consider?

- Two people acting on the same document from stale pages (handled via
  `version`, see above).
- A crash between "status updated" and "audit event written" — impossible
  by construction, since they're one transaction.
- A viewer or unauthenticated request hitting a private endpoint directly
  (not just via a hidden button) — every route checks auth/role/ownership
  server-side regardless of what the UI shows.
- Rejecting without a comment — enforced by Zod at the request-validation
  layer before it ever reaches the service.
- A reviewer approving their own document — explicit ownership check even
  though the role check alone would pass.
- Invalid/duplicate transitions (submitting an already-submitted document,
  publishing a draft) — rejected by the state-machine check with a
  descriptive error, not a generic 500.
- A user probing for document IDs that exist but aren't theirs to see —
  `getById` returns the same `404 NOT_FOUND` whether the document doesn't
  exist or is simply invisible to that role, so existence isn't leaked.

## What would you improve with more time?

- Server-driven pagination and search on the document list, rather than
  fetching the whole visible set.
- WebSocket/SSE push so a reviewer viewing a document sees a live "this was
  just updated" banner instead of only finding out on their next action.
- A dedicated `restore` transition out of `archived` (the brief allows
  archiving from most states but doesn't require restore — the audit trail
  already supports it if we add the transition).
- Rate limiting on `/api/auth/login` and general API rate limiting via
  `express-rate-limit`.
- E2E tests (Playwright) covering the full approve/reject/publish flow
  through the actual UI, on top of the current service-level unit tests.
- Field-level diffing in the audit log for `EDITED` events (currently it
  records that an edit happened, not a before/after diff of the content).

## What would need to change for a real production system?

- Real authentication (password hashing + a proper identity provider, or at
  minimum rate-limited magic links) instead of seeded-user login.
- A managed Postgres instance with connection pooling (e.g. PgBouncer or
  Prisma Accelerate) rather than a single long-lived `PrismaClient`.
- Structured audit export (e.g. to an append-only log store or SIEM) for
  compliance retention independent of the app database.
- Horizontal scaling of the API would need sessions moved out of
  memory-store defaults into a shared store (Redis) — `express-session`'s
  default `MemoryStore` is explicitly single-process and was fine only
  because this is a local/demo deployment.
- Input size limits, structured logging with request correlation IDs, and
  proper secrets management (not `.env` files) in CI/CD.

---

## Optional: something learned outside the usual web stack

Working through Prisma's "extended" unique-filter behavior for this
challenge (`where: { id, version }` on an `update`) was a good reminder that
optimistic concurrency doesn't need an extra round trip to check-then-write —
letting the database's `WHERE` clause do the atomic compare-and-swap is both
simpler and race-free, which is the same idea behind `CAS` instructions at
the CPU level or `ETag`/`If-Match` in HTTP. It's a small pattern, but it's
one of those places where understanding the primitive underneath (atomic
conditional writes) generalizes way past this one ORM call.
