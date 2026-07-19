# Controlled Document Approval System

A document goes through `draft → submitted → approved → published`, with
`rejected` and `archived` off-ramps. The server is the only thing that
decides whether a transition is legal, and every state change is written to
an append-only audit log **in the same transaction** as the state change
itself.

Stack: **React 18 + Vite + TypeScript + Tailwind + shadcn-style components**
on the frontend, **Express + TypeScript + Prisma + PostgreSQL + Zod** on the
backend, seeded-user session auth, cookie-based sessions.

---

## 1. Run it with Docker (fastest)

Requires Docker + Docker Compose only.

```bash
docker compose up --build
```

This starts Postgres, runs migrations, seeds the 5 users, starts the API on
`http://localhost:4000`, and serves the built frontend on
`http://localhost:5173`.

To reset the database entirely:

```bash
docker compose down -v
```

## 2. Run it locally (without Docker)

### Prerequisites
- Node.js 20+
- A PostgreSQL database (local install, or `docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16-alpine`)

### Backend

```bash
cd backend
cp .env.example .env
# edit .env and set DATABASE_URL to your Postgres instance

npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

The API runs on `http://localhost:4000`. Health check: `GET /health`.

### Frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_URL defaults to http://localhost:4000/api

npm install
npm run dev
```

The app runs on `http://localhost:5173`.

### Environment variables

**backend/.env**

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | API port (default `4000`) |
| `CLIENT_ORIGIN` | Comma-separated allowed CORS origins |
| `SESSION_SECRET` | Secret used to sign the session cookie |
| `NODE_ENV` | `development` \| `production` \| `test` |

**frontend/.env**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API, e.g. `http://localhost:4000/api` |

## 3. Seeded logins

There's no signup/password — log in with any of these emails from the login
screen (or tap the quick-login chips):

| Email | Role |
|---|---|
| `alice@example.com` | author |
| `bob@example.com` | reviewer |
| `carol@example.com` | reviewer |
| `admin@example.com` | admin |
| `viewer@example.com` | viewer |

## 4. Running tests

```bash
cd backend
npm test
```

Tests cover the state-machine invariants: illegal transitions are rejected,
ownership is enforced, a reviewer can't approve their own document, and a
stale version raises a conflict instead of silently overwriting.

## 5. Project structure

```
backend/
  prisma/schema.prisma      # data model — the source of truth
  prisma/seed.ts
  src/
    config/                 # env, prisma client, logger
    middlewares/            # auth, validation, error handling
    modules/
      auth/                 # login/logout/me
      documents/             # the core: schema, service (state machine), controller, routes
    utils/                  # AppError hierarchy, asyncHandler
    app.ts / server.ts

frontend/
  src/
    api/                     # axios client + typed endpoint wrappers
    components/
      ui/                    # shadcn-style primitives (button, card, dialog, ...)
      layout/                # Navbar, ProtectedRoute, ErrorBoundary, PageSpinner
      document/               # DocumentCard, StatusBadge, AuditTimeline, TransitionActions, DocumentForm
    context/AuthContext.tsx
    hooks/                    # useAuth, useDocuments, useDocument
    pages/                    # lazy-loaded route pages
    routes/                   # router config with Suspense + code splitting
```

## 6. What's deliberately out of scope

Per the challenge brief: signup flow, password reset, email sending, OAuth,
file upload, rich text editing, a complex admin dashboard, real deployment,
pixel-perfect styling, mobile-perfect layout.

See `DESIGN.md` for the design rationale, invariants, and tradeoffs.
