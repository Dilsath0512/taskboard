# TaskFlow — Task Management Board

A full-stack, Trello-like task management application with role-based access control, drag-and-drop Kanban board, and JWT authentication.

![TaskFlow Preview](./screenshots/board.png)

---

## 🚀 Live Demo

| | URL |
|---|---|
| **Frontend** | https://your-frontend.vercel.app |
| **Backend API** | https://your-backend.onrender.com |

**Admin Login:**
- Email: `admin@taskboard.com`
- Password: `Admin@1234`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite |
| **Styling** | Vanilla CSS (Dark glassmorphism) |
| **Routing** | React Router v6 |
| **HTTP Client** | Axios |
| **Notifications** | React Hot Toast |
| **Backend** | Node.js + Express |
| **Database** | PostgreSQL (Supabase) |
| **Authentication** | JWT + bcrypt |
| **Deployment** | Vercel (frontend) + Render (backend) |

---

## ✨ Features

### User Features
- 🔐 Register and log in securely
- 📋 View personal Kanban board (To Do / Doing / Done)
- ✅ Create tasks with title and description
- 🖱️ Drag and drop tasks between columns
- 👤 Assign unassigned tasks to yourself
- ✏️ Edit and delete your own tasks

### Admin Features
- 🛡️ Access admin dashboard with system overview
- 👥 View all registered users with task stats
- 📊 View all tasks across the entire system
- 🔄 Reassign tasks between any users
- ⚡ Change task statuses inline
- 👑 Promote/demote users to admin role

---

## 📁 Project Structure

```
taskmanagementassignment/
├── frontend/                  # React Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── KanbanBoard.jsx   # Drag-and-drop board
│   │   │   ├── TaskCard.jsx      # Draggable task card
│   │   │   ├── TaskModal.jsx     # Create/Edit modal
│   │   │   ├── Navbar.jsx        # Top navigation
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Auth page
│   │   │   ├── Board.jsx         # User board
│   │   │   └── AdminDashboard.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx   # Global auth state
│   │   ├── services/
│   │   │   └── api.js            # Axios API wrapper
│   │   └── index.css             # Design system
│   └── package.json
│
└── backend/                   # Express REST API
    ├── src/
    │   ├── config/db.js          # PostgreSQL pool
    │   ├── middleware/auth.js    # JWT + role guards
    │   ├── routes/               # auth, tasks, users
    │   └── controllers/          # Business logic
    ├── schema.sql                # Database schema
    ├── seed.js                   # Admin user seeder
    └── server.js
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account (free)
- A [Render](https://render.com) account (free)
- A [Vercel](https://vercel.com) account (free)

---

### 1. Database Setup (Supabase)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of [`backend/schema.sql`](./backend/schema.sql)
3. Copy your **Database URL** from: Settings → Database → Connection string → URI

---

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
JWT_SECRET=your_super_long_random_secret_here
PORT=5000
NODE_ENV=development
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@taskboard.com
ADMIN_PASSWORD=Admin@1234
FRONTEND_URL=http://localhost:5173
```

```bash
npm install
node seed.js        # Create admin user
npm run dev         # Start development server
```

API will be running at: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm install
npm run dev
```

Frontend will be running at: `http://localhost:5173`

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) | ✅ |
| `PORT` | Server port (default: 5000) | ❌ |
| `NODE_ENV` | `development` or `production` | ❌ |
| `FRONTEND_URL` | Frontend URL for CORS | ✅ |
| `ADMIN_NAME` | Admin display name for seeder | ❌ |
| `ADMIN_EMAIL` | Admin email for seeder | ❌ |
| `ADMIN_PASSWORD` | Admin password for seeder | ❌ |

### Frontend (`frontend/.env`)

| Variable | Description | Required |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | ✅ |

---

## 🌐 Deployment

### Backend → Render

1. Push code to GitHub
2. Create a new **Web Service** on Render, connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node server.js`
6. Add all environment variables from `backend/.env`
7. Deploy and copy the URL (e.g., `https://taskflow-api.onrender.com`)
8. Run the seed: in Render Shell → `node seed.js`

### Frontend → Vercel

1. Create a new project on Vercel, connect your GitHub repo
2. Set **Root Directory** to `frontend`
3. Add environment variable: `VITE_API_URL=https://taskflow-api.onrender.com/api`
4. Deploy

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Tasks
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/tasks` | Get tasks (own/all) | Yes |
| POST | `/api/tasks` | Create task | Yes |
| PUT | `/api/tasks/:id` | Update task | Yes |
| PUT | `/api/tasks/:id/assign` | Assign task | Yes |
| DELETE | `/api/tasks/:id` | Delete task | Yes |

### Users (Admin only)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/users` | Get all users | Admin |
| PUT | `/api/users/:id/role` | Update user role | Admin |

---

## 🔒 Security

- Passwords hashed with **bcrypt** (12 salt rounds)
- Authentication via **JWT** (7-day expiry)
- All sensitive data in **environment variables**
- Role validation on every protected backend route
- Admin accounts created **only via seed script** (never via registration)

---

## 📸 Screenshots

> *(Add screenshots after deployment)*

---

## 👤 Contact

- **Name**: [Your Name]
- **Email**: [your@email.com]
- **GitHub**: [github.com/yourusername]
