# TaskForge - Full-Stack Project Management System

A complete, production-ready, full-stack Project Management System built from scratch with **React (Vite)** on the frontend, **Node.js + Express** on the backend, and **MySQL** as the relational database.

---

## 📑 Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Folder Structure](#folder-structure)
5. [Prerequisites](#prerequisites)
6. [Database Setup](#database-setup)
7. [Environment Variables](#environment-variables)
8. [Installation & Getting Started](#installation--getting-started)
9. [REST API Endpoints Overview](#rest-api-endpoints-overview)
10. [Authentication & Authorization Flow](#authentication--authorization-flow)
11. [Security Practices](#security-practices)
12. [Testing & Verification](#testing--verification)
13. [Deployment Guidelines](#deployment-guidelines)
14. [Screenshots](#screenshots)

---

## 1. Project Overview
**TaskForge** is designed for individuals and teams to organize projects, break them down into actionable tasks, track status and priority, and monitor real-time completion metrics through an executive dashboard. 

The architecture is deliberately structured with clean MVC separation and simple, robust patterns so any developer or fresher can easily understand and explain the complete system end-to-end in a technical interview.

---

## 2. Key Features

### 🔐 Authentication & Session Management
- Secure user registration with validation (name, unique email, password length).
- Password encryption using **bcryptjs** with 10 salt rounds.
- Stateless authentication using **JSON Web Tokens (JWT)** with configurable expiration.
- Rate limiting on auth routes to prevent brute-force attacks.
- Frontend session persistence via `localStorage` with automatic token attachment in Axios requests.

### 🛡️ Strict Authorization & Multi-Tenant Data Isolation
- Strict user-level data isolation enforced on the backend: every project query verifies `WHERE user_id = ?`.
- Tasks can only be viewed, created, updated, or deleted if they belong to a project owned by the authenticated user.
- Frontend Protected Routes redirect unauthenticated users to `/login`.

### 📊 Real-Time Executive Dashboard
- 5 live metric cards calculated on-the-fly from MySQL:
  - **Total Projects**
  - **Total Tasks**
  - **Completed Tasks**
  - **Pending Tasks**
  - **Projects In Progress**
- Recent projects showcase with direct links and quick creation.

### 📁 Project Management (CRUD)
- Create new projects with name, description, status (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`), start date, and end date.
- Real-time client and server validation (e.g. end date cannot be earlier than start date).
- Live search by project name and filter by status.
- Visual task progress bar (% completed) for each project.
- Edit and delete projects with cascade deletion of related tasks.

### ✅ Task Management (CRUD & Completion)
- Create tasks tied to projects with priority (`LOW`, `MEDIUM`, `HIGH`) and status (`PENDING`, `IN_PROGRESS`, `COMPLETED`).
- Filter tasks by status, priority, or search by task name.
- One-click task completion checkbox that dynamically updates project progress and dashboard statistics.
- Visual color-coded priority indicators (High: Rose, Medium: Amber, Low: Sky Blue).

### 🎨 Clean & Modern Design System
- Built with modern Vanilla CSS custom properties.
- Responsive layout supporting Desktop, Tablet, and Mobile devices.
- Modal dialogs for clean create/edit flows.
- Feedback banners, loading spinners, and empty states.

---

## 3. Technology Stack

### Frontend
- **Library**: React 19
- **Build Tool**: Vite
- **Language**: JavaScript (ES Modules)
- **Routing**: React Router DOM (v7)
- **HTTP Client**: Axios (configured with interceptors)
- **Styling**: Vanilla CSS Design System with responsive grid & flexbox

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (v5)
- **Database Driver**: `mysql2/promise` (Connection Pooling)
- **Authentication**: `jsonwebtoken` (JWT)
- **Password Security**: `bcryptjs`
- **Validation**: `express-validator`
- **Rate Limiting**: `express-rate-limit`
- **CORS**: `cors`
- **Configuration**: `dotenv`
- **Dev Server**: `nodemon`

### Database
- **Engine**: MySQL (8.0+)
- **Database Name**: `project_management`
- **Charset**: `utf8mb4` with `utf8mb4_unicode_ci` collation
- **Tables**: `users`, `projects`, `tasks`

---

## 4. Folder Structure

```
e:\IIT/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Top navigation with user badge & logout
│   │   │   ├── Sidebar.jsx         # Navigation drawer for dashboard & projects
│   │   │   ├── ProtectedRoute.jsx  # Route guard for authenticated views
│   │   │   ├── Loading.jsx         # Spinner / skeleton loading component
│   │   │   ├── ErrorMessage.jsx    # User-friendly alert banner
│   │   │   ├── SearchBar.jsx       # Interactive search input with clear button
│   │   │   ├── ProjectCard.jsx     # Project card with progress bar
│   │   │   ├── ProjectForm.jsx     # Create/Edit project modal form
│   │   │   ├── TaskCard.jsx        # Task card with priority tag & toggle
│   │   │   ├── TaskForm.jsx        # Create/Edit task modal form
│   │   │   └── TaskFilters.jsx     # Search, status, and priority filter bar
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx           # User sign-in page with demo filler
│   │   │   ├── Register.jsx        # User registration page
│   │   │   ├── Dashboard.jsx       # 5 Stats cards + recent projects
│   │   │   ├── Projects.jsx        # Catalog with search, filter, and CRUD
│   │   │   ├── ProjectDetails.jsx  # Project info + task management workspace
│   │   │   └── NotFound.jsx        # 404 page
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # React Context for global auth state
│   │   ├── services/
│   │   │   └── api.js              # Axios instance with interceptors
│   │   ├── hooks/
│   │   │   └── useAuth.js          # Hook to access AuthContext
│   │   ├── App.jsx                 # Route definitions
│   │   ├── main.jsx                # Application root entry
│   │   └── index.css               # Modern design system stylesheet
│   │
│   ├── .env                        # Frontend environment variables
│   ├── .env.example
│   ├── index.html                  # HTML entrypoint with Inter font
│   ├── vite.config.js              # Vite configuration (port 3000)
│   ├── package.json
│   └── README.md
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # mysql2 connection pool configuration
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js       # Register, login, logout, getMe
│   │   │   ├── projectController.js    # Project CRUD with user filter
│   │   │   ├── taskController.js       # Task CRUD with project verification
│   │   │   └── dashboardController.js  # Live aggregated metrics from SQL
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js       # Auth endpoints + rate limiter
│   │   │   ├── projectRoutes.js    # /api/projects protected routes
│   │   │   ├── taskRoutes.js       # /api/tasks protected routes
│   │   │   └── dashboardRoutes.js  # /api/dashboard/stats route
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js       # Bearer JWT verification
│   │   │   ├── errorMiddleware.js      # Centralized error & 404 handler
│   │   │   └── validateMiddleware.js   # express-validator result handler
│   │   │
│   │   ├── validators/
│   │   │   ├── authValidator.js        # Auth input rules
│   │   │   ├── projectValidator.js     # Project input rules
│   │   │   └── taskValidator.js        # Task input rules
│   │   │
│   │   ├── utils/
│   │   │   ├── generateToken.js        # JWT signing utility
│   │   │   └── logger.js               # Structured logger
│   │   │
│   │   ├── app.js                  # Express app & middleware setup
│   │   └── server.js               # Server bootstrapper & DB check
│   │
│   ├── .env                        # Backend environment configuration
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── database/
│   ├── schema.sql                  # Database, tables, indexes & FK constraints
│   └── seed.sql                    # Demo users, projects & tasks
│
├── docs/
│   ├── ER-Diagram.md               # Mermaid diagram & schema specifications
│   └── API-Documentation.md        # Comprehensive REST API reference
│
├── .gitignore
└── README.md
```

---

## 5. Prerequisites

Make sure you have the following installed on your machine:
- **Node.js**: v18.x or v20+ (Node v24 is tested and fully supported)
- **npm**: v9+ or v10+
- **MySQL Server**: 8.0 or MySQL compatible service (e.g. XAMPP, MariaDB)

---

## 6. Database Setup

1. Open your MySQL client (MySQL Command Line Client, MySQL Workbench, or PowerShell):
   ```bash
   mysql -u root -p
   ```

2. Run the database schema creation script:
   ```sql
   SOURCE e:/IIT/database/schema.sql;
   ```
   *Or run from terminal:*
   ```bash
   mysql -u root -p < database/schema.sql
   ```

3. (Optional) Load sample seed data with pre-configured demo users and tasks:
   ```sql
   SOURCE e:/IIT/database/seed.sql;
   ```
   *Or run from terminal:*
   ```bash
   mysql -u root -p < database/seed.sql
   ```

### Pre-Configured Seed Users:
| Full Name | Email Address | Password |
|---|---|---|
| John Doe | `john@example.com` | `password123` |
| Jane Smith | `jane@example.com` | `password123` |

---

## 7. Environment Variables

### Backend (`backend/.env`)
Create or edit `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_ROOT_PASSWORD
DB_NAME=project_management
DB_PORT=3306
JWT_SECRET=supersecretjwtkey_pm_system_2026_dev_secure
JWT_EXPIRES_IN=1d
```

### Frontend (`frontend/.env`)
Create or edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 8. Installation & Getting Started

### Step 1: Install Backend Dependencies
Open a terminal in the root workspace and run:
```bash
cd backend
npm install
```

### Step 2: Install Frontend Dependencies
In another terminal tab:
```bash
cd frontend
npm install
```

### Step 3: Start Backend Server
Inside the `backend` folder:
```bash
npm run dev
```
The server will start on `http://localhost:5000/api`. You will see:
```
[Database] Successfully connected to MySQL database: project_management
====================================================
🚀 Project Management API Server running on port 5000
🌐 Base URL: http://localhost:5000/api
🩺 Health Check: http://localhost:5000/api/health
====================================================
```

### Step 4: Start Frontend Client
Inside the `frontend` folder:
```bash
npm run dev
```
Vite will start the client on `http://localhost:3000`. Open `http://localhost:3000` in your web browser.

---

## 9. REST API Endpoints Overview

| Area | Method | Endpoint | Access | Description |
|---|---|---|---|---|
| **Health** | `GET` | `/api/health` | Public | Server health status |
| **Auth** | `POST` | `/api/auth/register` | Public | Register new user account |
| **Auth** | `POST` | `/api/auth/login` | Public | Login & receive JWT |
| **Auth** | `POST` | `/api/auth/logout` | Protected | Clear session |
| **Auth** | `GET` | `/api/auth/me` | Protected | Get authenticated profile |
| **Dashboard** | `GET` | `/api/dashboard/stats` | Protected | Aggregated live metrics |
| **Projects** | `GET` | `/api/projects` | Protected | List user projects (search/filter) |
| **Projects** | `GET` | `/api/projects/:id` | Protected | Get project details & counts |
| **Projects** | `POST` | `/api/projects` | Protected | Create new project |
| **Projects** | `PUT` | `/api/projects/:id` | Protected | Update project details |
| **Projects** | `DELETE` | `/api/projects/:id` | Protected | Delete project & its tasks |
| **Tasks** | `GET` | `/api/tasks` | Protected | List tasks (search/filters) |
| **Tasks** | `GET` | `/api/tasks/:id` | Protected | Get single task details |
| **Tasks** | `POST` | `/api/tasks` | Protected | Create task under user project |
| **Tasks** | `PUT` | `/api/tasks/:id` | Protected | Update task or toggle status |
| **Tasks** | `DELETE` | `/api/tasks/:id` | Protected | Delete task |

> For complete request and response schemas, see [docs/API-Documentation.md](docs/API-Documentation.md).

---

## 10. Authentication & Authorization Flow

```
[User Browser]
      │  (1) POST /api/auth/login with { email, password }
      ▼
[Express Auth Controller]
      │  (2) Validate input with express-validator
      │  (3) Fetch user from MySQL by email
      │  (4) bcrypt.compare(password, user.password)
      │  (5) Sign JWT { id: user.id, email: user.email }
      ▼
[User Browser]
      │  (6) Stores token in localStorage
      │  (7) Future requests include: `Authorization: Bearer <token>`
      ▼
[Auth Middleware]
      │  (8) Verifies signature & expiration via jwt.verify()
      │  (9) Injects req.user = { id, fullName, email }
      ▼
[Business Logic Controllers]
         (10) Applies strict ownership: `WHERE user_id = req.user.id`
```

---

## 11. Security Practices

- **SQL Injection Prevention**: All queries use parameterized queries / prepared statements (`?` placeholders) with `mysql2/promise`. No string concatenation is used.
- **Password Protection**: Passwords are never stored in plain text. Hashed with `bcryptjs` (cost factor 10). Password hashes are excluded from all query outputs and responses.
- **Brute Force Defense**: `express-rate-limit` restricts authentication attempts to 30 requests per 15-minute window per IP.
- **Cross-Site Scripting (XSS)**: React automatically escapes output in JSX.
- **CORS Configuration**: Restricts methods and allows standard headers.
- **Zero Hardcoded Secrets**: Secrets and database credentials are read from `.env` files which are excluded from Git version control.

---

## 12. Testing & Verification

1. **Auth Verification**:
   - Register account -> token returned, redirected to `/dashboard`.
   - Test duplicate email -> receives `409 Conflict`.
   - Test invalid password -> receives validation error.
   - Login with wrong password -> receives `401 Unauthorized`.
   - Logout -> localStorage cleared, redirected to `/login`.

2. **Project Authorization Verification**:
   - Log in as `john@example.com`.
   - View projects -> displays only John's projects.
   - Try to access Jane's project ID (`/api/projects/5`) -> receives `404 Not Found`.

3. **Task Completion & Progress**:
   - Click the check circle on any task -> marks status `COMPLETED`.
   - Project progress bar updates immediately.
   - Dashboard completed tasks counter increments immediately.

---

## 13. Deployment Guidelines

### Production Build
1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. The optimized production bundle will be created in `frontend/dist/`.
3. In production, serve the `frontend/dist` directory through an Nginx web server or Express static file middleware (`express.static`), and run the backend using **PM2**:
   ```bash
   cd backend
   npm install -g pm2
   pm2 start src/server.js --name "pm-backend"
   ```

---

## 14. Screenshots Placeholder

*(Place application screenshots here)*
- **Dashboard View**: Overview of project statistics and recent items.
- **Projects Catalog**: Filterable card grid with progress bars.
- **Project Detail & Task Workspace**: Interactive task list with priority badges and status controls.
- **Authentication Screens**: Modern login and registration cards.
