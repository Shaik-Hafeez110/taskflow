# TaskFlow — Team Task Manager

A full-stack project and task management application with role-based access control (Admin / Member).

**Live Demo:** [Task-Flow App](https://taskflow-production-60e1.up.railway.app/)

---

## Features

- **Authentication** — Signup / Login with JWT tokens (7-day expiry)
- **Role-based access** — Admins create projects and manage teams; Members work on assigned tasks
- **Project management** — Create projects, add/remove members by email
- **Task board** — Kanban view with TODO / IN PROGRESS / DONE columns, priority levels, due dates, and assignees
- **Dashboard** — Real-time stats: task counts by status, overdue tasks, and personal task queue
- **Validations** — Input validation on all endpoints; membership checks on every project/task route

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + bcryptjs |
| Frontend | React 18 + Vite |
| Deployment | Railway |

---

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL running locally (or use a cloud DB URL)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/Shaik-Hafeez110/taskflow.git
cd taskflow

# 2. Install all dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Configure environment
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET

# 4. Run database migrations
npx prisma migrate dev --name init

# 5. Seed demo data
npm run seed

# 6. Start backend (terminal 1)
npm run dev

# 7. Start frontend (terminal 2)
cd ../frontend
npm run dev
```

App runs at `https://taskflow-production-60e1.up.railway.app/`

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/taskflow` |
| `JWT_SECRET` | Secret for signing JWTs | WBcJsCzttnbNaaXkxCgcVHpnScqqtDIf |
| `PORT` | Server port (optional) | `5000` |
| `NODE_ENV` | Environment | `production` |

---

## Demo Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@taskflow.com | admin1234 |
| Member | alice@taskflow.com | member1234 |
| Member | bob@taskflow.com | member1234 |

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | ✓ | Current user info |

### Projects
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/projects` | ✓ | List accessible projects |
| POST | `/api/projects` | Admin | Create project |
| GET | `/api/projects/:id` | Member+ | Project details + members |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project |
| POST | `/api/projects/:id/members` | Admin | Add member by email |
| DELETE | `/api/projects/:id/members/:userId` | Admin | Remove member |

### Tasks
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/tasks/project/:projectId` | Member+ | List tasks (filter: status, priority, assigneeId) |
| POST | `/api/tasks/project/:projectId` | Member+ | Create task |
| GET | `/api/tasks/:id` | ✓ | Get task |
| PUT | `/api/tasks/:id` | ✓ | Update task / change status |
| DELETE | `/api/tasks/:id` | Admin/Creator | Delete task |

### Dashboard
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard` | ✓ | Stats, overdue tasks, personal task queue |

---

## Deploy to Railway

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
3. Select your repo
4. Click **+ New** → **Database** → **PostgreSQL** — Railway auto-sets `DATABASE_URL`
5. In your service **Variables**, add:
   - `JWT_SECRET` = any long random string
   - `NODE_ENV` = `production`
6. Railway auto-detects `railway.json` and runs the build + start commands
7. After deploy, run seed data:
   ```bash
   railway run cd backend && npm run seed
   ```

Your live URL appears in the Railway dashboard under **Settings → Domains**.

---

## Project Structure

```
taskflow/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   └── src/
│       ├── controllers/        # Route handlers
│       ├── middleware/         # auth.js — authenticate, requireAdmin, requireProjectMember
│       ├── routes/             # Express routers
│       ├── utils/seed.js       # Demo data seeder
│       └── index.js            # Express app entry
├── frontend/
│   └── src/
│       ├── components/         # Layout, shared UI
│       ├── context/            # AuthContext (React Context + JWT)
│       ├── pages/              # Dashboard, Projects, ProjectDetail, Login, Signup
│       └── utils/api.js        # Axios instance with auth interceptor
├── railway.json                # Railway build + start config
└── README.md
```

---

## License

MIT
