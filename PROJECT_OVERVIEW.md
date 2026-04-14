# Rareform — Project Overview

## Purpose
A personal productivity planner with a winter-themed UI. Users can manage tasks and goals across daily, weekly, quarterly, and yearly time horizons.

## Technology Stack
- **Frontend**: Angular 20 (standalone components), TailwindCSS, date-fns
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (via `pg` driver, no ORM)
- **Auth**: JWT in httpOnly cookies (`planner_session`), bcryptjs password hashing
- **Testing**: Karma + Jasmine
- **Deployment**: Render (single web service)

## Application Routes
| Route | Component | Auth required |
|-------|-----------|---------------|
| `/` | → redirects to `/login` | No |
| `/login` | `LoginComponent` | No |
| `/register` | `RegisterComponent` | No |
| `/dashboard` | `DashboardComponent` | Yes (authGuard) |

## Frontend Structure (`client/`)
```
client/
├── app/
│   ├── components/
│   │   ├── login/          # Login form
│   │   ├── register/       # Registration form
│   │   ├── dashboard/      # Main shell, view switching, logout
│   │   ├── daily-tasks/    # Daily to-do list
│   │   ├── goal-list/      # Goals (weekly/quarterly/yearly)
│   │   ├── analysis/       # Analytics view
│   │   ├── tag-management/ # Global tag CRUD
│   │   └── time-navigation/# Period arrow nav + banner
│   ├── guards/auth.guard.ts
│   ├── models/task.interface.ts
│   ├── services/
│   │   ├── auth.service.ts           # JWT auth, currentUser signal
│   │   ├── planner-data.service.ts   # Abstract data service
│   │   ├── mock-planner-data.service.ts # In-memory mock (active)
│   │   ├── user.service.ts           # Abstract user service
│   │   ├── mock-user.service.ts      # Mock (active)
│   │   ├── planner-store.service.ts  # State management
│   │   └── period.service.ts         # Date/period key utilities
│   ├── app.routes.ts
│   └── app.config.ts
├── main.ts
└── styles.css
```

## Backend Structure (`server/`)
```
server/
├── src/
│   ├── index.ts              # Express app, middleware, routing, static serving
│   ├── db.ts                 # pg Pool singleton + query() helper
│   ├── middleware/
│   │   └── requireAuth.ts    # JWT cookie validation
│   └── routes/
│       └── auth.ts           # POST /register, POST /login, GET /me, POST /logout
├── migrations/
│   └── 001_create_users.sql
├── scripts/
│   ├── migrate.ts            # Idempotent migration runner (tracks via schema_migrations table)
│   └── seed.ts               # Seeds testuser / testpassword123
├── .env.example
└── tsconfig.json
```

## Dashboard Views
The dashboard has four modes toggled via a tab bar:
- **Daily** (default) — daily tasks
- **Weekly** — weekly goals (sidebar on daily view, main panel when selected)
- **Quarterly** — quarterly goals
- **Yearly** — yearly goals

## Data Models
```typescript
interface Task {
  id: number;
  text: string;
  completed: boolean;
  tags?: string[];
}

interface Goal {
  id: number;
  text: string;
  completed: boolean;
  tags?: string[];
  linkedGoalId?: number;  // links to a higher-scope goal
}
```

## Auth Flow
1. User registers or logs in → server validates → sets `planner_session` JWT cookie (httpOnly, 7-day expiry)
2. On app load, `APP_INITIALIZER` calls `GET /api/auth/me` → hydrates `AuthService.currentUser` signal
3. `authGuard` reads `isAuthenticated()` synchronously from the signal
4. Logout: `POST /api/auth/logout` → cookie cleared → signal nulled → redirect to `/login`

## Color Scheme
- Daily Tasks: indigo
- Weekly Goals: violet  
- Quarterly Goals: purple
- Yearly Goals: violet
- Auth pages: indigo/violet gradient background

## Future Work
- Real `PlannerDataService` backed by API (tasks, goals persistence)
- Real `UserService` returning logged-in user's profile name
- Goal-linking between time scopes
- Progress tracking and analytics
