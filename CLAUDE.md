# Rareform — Claude Code Guide

## Project Overview
Rareform is a personal productivity planner. Angular 20 SPA frontend (`client/`) + Express/Node backend (`server/`) in the same repo. PostgreSQL for persistence. JWT auth via httpOnly cookies. Hosted on Render as a single web service.

## Repo Structure
```
rareform/
├── client/          # Angular 20 SPA (standalone components, TailwindCSS)
├── server/          # Express API (TypeScript, pg, bcryptjs, jsonwebtoken)
│   ├── src/
│   │   ├── index.ts              # Entry point
│   │   ├── db.ts                 # pg Pool singleton
│   │   ├── middleware/requireAuth.ts
│   │   └── routes/auth.ts        # /login /me /logout /register
│   ├── migrations/               # SQL files, run in order by migrate.ts
│   ├── scripts/migrate.ts        # Migration runner
│   └── scripts/seed.ts           # Seeds a test user
├── proxy.conf.json  # Dev: /api/* → localhost:3000
├── render.yaml      # Render deployment config
├── angular.json
├── tailwind.config.js
└── tsconfig*.json
```

## Running Locally (two terminals)

**Terminal 1 — Express API on :3000**
```bash
npm run server:dev
```

**Terminal 2 — Angular dev server on :4200**
```bash
npm start
```

Angular proxies `/api/*` to Express via `proxy.conf.json`. The `APP_INITIALIZER` in `app.config.ts` calls `GET /api/auth/me` on startup to hydrate auth state before any route guard runs.

## Database

**First-time local setup** (PostgreSQL must be installed):
```sql
-- In psql as superuser
CREATE DATABASE rareform_dev;
CREATE USER rareform_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE rareform_dev TO rareform_user;
\c rareform_dev
GRANT ALL ON SCHEMA public TO rareform_user;
```

Create `server/.env` from `server/.env.example` and fill in:
```
DATABASE_URL=postgresql://rareform_user:your_password@localhost:5432/rareform_dev
JWT_SECRET=<node -e "console.log(require('crypto').randomBytes(48).toString('base64'))">
NODE_ENV=development
PORT=3000
```

**Migrations and seed:**
```bash
npm run server:migrate   # applies unapplied .sql files from server/migrations/
npm run server:seed      # inserts testuser / testpassword123 (idempotent)
```

## Testing
```bash
npm test                 # Karma/Jasmine, all specs under client/
```

**Testing conventions learned the hard way:**
- Angular standalone component tests that use `RouterLink` need `provideRouter([])` in providers, not a bare navigate-only spy. After that, get the router with `TestBed.inject(Router)` and `spyOn(router, 'navigate')`.
- Date assertions in specs must use local-time arithmetic (not `toISOString()` which is UTC). The `PeriodService` uses `date-fns`'s `format()` which is local time — mismatches occur when the local clock and UTC are on different calendar days.
- Observable-returning service methods (like `login()`, `logout()`) must have their spies return `of(...)` in tests, and callers must `.subscribe()`.

## Auth Architecture
- JWT signed with `JWT_SECRET`, stored in `planner_session` httpOnly cookie (7-day expiry)
- `AuthService` (`client/app/services/auth.service.ts`) holds `currentUser` as an Angular signal
- `isAuthenticated()` reads the signal synchronously — `authGuard` stays synchronous
- `APP_INITIALIZER` calls `checkAuthStatus()` to hydrate the signal from the server before routing
- `requireAuth` middleware in Express validates the cookie on protected routes

## Data Services
- **Tasks and Tags**: backed by `HttpPlannerDataService` (real HTTP calls to Express). Wired in `app.config.ts` via `{ provide: PlannerDataService, useClass: HttpPlannerDataService }`.
- **Goals**: not yet implemented server-side — `HttpPlannerDataService` returns `of([])` for all goal methods so initialization never blocks.
- **UserService**: still backed by `MockUserService`.
- Tests use `MockPlannerDataService` explicitly via `TestBed` providers — the real service is never instantiated in specs.

## Server Routes (`server/src/routes/planner.ts`)
All routes require the `requireAuth` middleware. Routes are mounted at `/api` in `index.ts`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tasks?date=YYYY-MM-DD` | Fetch tasks for a day |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/:id` | Update text/completed/tags/goalIds |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/tags` | Fetch user's tag list |
| POST | `/api/tags` | Add a tag (ON CONFLICT DO NOTHING) |
| PATCH | `/api/tags/:name` | Rename tag + cascade to tasks (transactional) |
| DELETE | `/api/tags/:name` | Delete tag + cascade to tasks (transactional) |

Tag rename/delete use `pool.connect()` for explicit BEGIN/COMMIT, and `array_replace` / `array_remove` PostgreSQL functions to cascade changes to all task rows.

## Migrations
- `001_create_users.sql` — users table
- `002_create_tasks.sql` — tasks table (user_id FK, tags TEXT[], goal_ids INTEGER[], date DATE). Index on (user_id, date).
- `003_create_user_tags.sql` — per-user canonical tag list. Composite PK (user_id, name) enforces uniqueness.

## Virtual Default Tags (`PlannerStoreService`)
New users have no tags in the DB. Five default tags (`'happy house', 'survive', 'strong body', 'sharp mind', 'create'`) are shown as "virtual" until first use.

- `dbTags` signal: what the server returned (source of truth for real tags)
- `dismissedDefaults` signal: defaults the user deleted before ever using them
- `globalTags` computed: `dbTags ∪ (DEFAULT_TAGS not in dbTags and not dismissed)`

Behaviour on action:
- **Delete virtual tag** → added to `dismissedDefaults`; no DB call
- **Rename virtual tag** → calls `addTag(newName)`; old default auto-drops from computed
- **Apply virtual tag to task** → `addTag` called first (materializes it), then `updateTask`

Dismissed defaults reset on page refresh (ephemeral by design — no data was ever written for them).

## Optimistic Updates (PlannerStoreService)
`updateTask`, `addTaskTag`, `addGoalTag`, and `removeTaskTag` all update the local cache immediately before the server responds. The server response reconciles with the authoritative `updatedAt`. Errors are silently swallowed for now (no rollback).

## Deployment (Render)
Configured in `render.yaml`. Single web service: build compiles Angular then the server TypeScript, runs migrations, then starts Express. Express serves both the API and the Angular static bundle in production.

Build command:
```
npm ci && npm run build && cd server && npm ci && npm run build && node dist/scripts/migrate.js
```

Start command:
```
node server/dist/src/index.js
```

`JWT_SECRET` is auto-generated by Render. `DATABASE_URL` is injected from the attached PostgreSQL instance.
