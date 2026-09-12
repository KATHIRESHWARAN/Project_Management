# TaskForge - Full-Stack Project Management System

A complete full-stack Project Management System built with **React (Vite)** on the frontend, **Node.js + Express.js** on the backend, and **MySQL** as the relational database.

TaskForge allows users to create and manage projects, organize tasks, track progress, and monitor overall project statistics through a centralized dashboard.

The application is deployed using **Netlify** for the frontend, **Render** for the backend API, and **Aiven Cloud MySQL** for the production database.

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overvie)
2. [Project Objectives](#2-project-objectives)
3. [Key Features](#3-key-features)
4. [Technology Stack](#4-technology-stack)
5. [System Architecture](#5-system-architecture)
6. [Folder Structure](#6-folder-structure)
7. [Database Design](#7-database-design)
8. [Prerequisites](#8-prerequisites)
9. [Database Setup](#9-database-setup)
10. [Environment Variables](#10-environment-variables)
11. [Installation & Local Development](#11-installation--local-development)
12. [REST API Endpoints](#12-rest-api-endpoints)
13. [Authentication & Authorization](#13-authentication--authorization)
14. [Security Practices](#14-security-practices)
15. [Testing & Verification](#15-testing--verification)
16. [Production Deployment](#16-production-deployment)
17. [Application Workflow](#17-application-workflow)
18. [Screenshots](#18-screenshots)
19. [Future Enhancements](#19-future-enhancements)
20. [Conclusion](#20-conclusion)

---

# 1. Project Overview

**TaskForge** is a full-stack Project Management System designed to help users organize projects and manage tasks efficiently.

The application provides functionality for:

* User registration and login
* Project creation and management
* Task creation and management
* Task priority and status tracking
* Project progress monitoring
* Dashboard statistics
* Project and task searching
* Project and task filtering
* Secure user authentication
* User-level data isolation

The system follows a client-server architecture:

```text
┌──────────────────────┐
│      User / Client   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   React + Vite       │
│      Frontend        │
│      Netlify         │
└──────────┬───────────┘
           │
           │ HTTPS REST API
           ▼
┌──────────────────────┐
│   Node.js + Express  │
│       Backend        │
│       Render         │
└──────────┬───────────┘
           │
           │ Secure MySQL Connection
           ▼
┌──────────────────────┐
│    Aiven Cloud       │
│       MySQL          │
└──────────────────────┘
```

---

# 2. Project Objectives

The main objectives of TaskForge are:

* Provide a secure user authentication system.
* Allow users to create and manage projects.
* Allow users to create and organize tasks within projects.
* Track project and task status.
* Monitor project completion progress.
* Provide centralized dashboard statistics.
* Protect user data through backend authorization.
* Provide a responsive and user-friendly interface.
* Deploy the application using cloud-based services.

---

# 3. Key Features

## 🔐 Authentication & Session Management

* User registration
* User login
* User logout
* Secure password hashing using **bcryptjs**
* JWT-based authentication
* Configurable JWT expiration
* Authentication rate limiting
* Frontend session persistence
* Protected application routes
* Form validation

---

## 🛡️ Authorization & User Data Isolation

TaskForge implements backend authorization to ensure users can only access their own data.

* Project ownership is verified on the backend.
* Users can only access their own projects.
* Tasks are accessible only when they belong to a project owned by the authenticated user.
* Protected frontend routes redirect unauthenticated users to the login page.
* Unauthorized access attempts are rejected by the backend.

This prevents users from accessing another user's project or task information.

---

## 📊 Dashboard

The dashboard provides an overview of project and task activity.

### Dashboard Statistics

* **Total Projects**
* **Total Tasks**
* **Completed Tasks**
* **Pending Tasks**
* **Projects In Progress**

Additional dashboard functionality includes:

* Recent projects
* Project progress information
* Quick project creation
* Live statistics retrieved from MySQL

---

## 📁 Project Management

Users can manage projects using CRUD functionality.

### Project Features

* Create projects
* View projects
* Edit projects
* Delete projects
* Project descriptions
* Project status
* Start date
* End date
* Project search
* Project status filtering
* Project completion progress

### Project Status

```text
NOT_STARTED
IN_PROGRESS
COMPLETED
```

Project progress is calculated based on the completion status of associated tasks.

---

## ✅ Task Management

Tasks are organized within projects.

### Task Features

* Create tasks
* View tasks
* Edit tasks
* Delete tasks
* Mark tasks as completed
* Task status management
* Task priority management
* Task search
* Task filtering

### Task Status

```text
PENDING
IN_PROGRESS
COMPLETED
```

### Task Priority

```text
LOW
MEDIUM
HIGH
```

Completing a task updates the associated project progress and dashboard statistics.

---

## 🎨 User Interface

TaskForge provides a clean and responsive user interface.

Features include:

* Modern dashboard
* Responsive layout
* Desktop, tablet, and mobile support
* Sidebar navigation
* Navigation bar
* Modal forms
* Project cards
* Task cards
* Search functionality
* Filter controls
* Loading indicators
* Error messages
* Empty states
* Progress bars

The application uses a custom **Vanilla CSS design system**.

---

# 4. Technology Stack

## Frontend

| Technology       | Purpose                       |
| ---------------- | ----------------------------- |
| React 19         | User interface                |
| Vite             | Development and build tool    |
| JavaScript       | Application programming       |
| React Router DOM | Client-side routing           |
| Axios            | HTTP requests                 |
| Vanilla CSS      | Styling and responsive design |

---

## Backend

| Technology         | Purpose                            |
| ------------------ | ---------------------------------- |
| Node.js            | JavaScript runtime                 |
| Express.js         | REST API framework                 |
| mysql2/promise     | MySQL database connection          |
| JSON Web Token     | Authentication                     |
| bcryptjs           | Password hashing                   |
| express-validator  | Input validation                   |
| express-rate-limit | Authentication rate limiting       |
| CORS               | Cross-origin request configuration |
| dotenv             | Environment configuration          |
| Nodemon            | Development server                 |

---

## Database

| Technology | Purpose             |
| ---------- | ------------------- |
| MySQL 8.0+ | Relational database |
| Aiven      | Cloud MySQL hosting |
| utf8mb4    | Character encoding  |

### Main Database Tables

```text
users
projects
tasks
```

---

## Cloud Deployment

| Service | Component              |
| ------- | ---------------------- |
| Netlify | Frontend               |
| Render  | Backend / REST API     |
| Aiven   | Cloud MySQL Database   |
| GitHub  | Source Code Repository |

---

# 5. System Architecture

```text
                    ┌─────────────────┐
                    │      User       │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ React + Vite    │
                    │    Frontend     │
                    │    Netlify      │
                    └────────┬────────┘
                             │
                         HTTPS/API
                             │
                             ▼
                    ┌─────────────────┐
                    │ Node.js         │
                    │ Express.js      │
                    │    Backend      │
                    │     Render      │
                    └────────┬────────┘
                             │
                         MySQL/TLS
                             │
                             ▼
                    ┌─────────────────┐
                    │ Aiven Cloud     │
                    │     MySQL       │
                    └─────────────────┘
```

### Application Layers

```text
Frontend
   ↓
API Routes
   ↓
Middleware
   ↓
Controllers
   ↓
Database
```

The backend uses a structured MVC-style organization separating routes, controllers, middleware, validation, and database configuration.

---

# 6. Folder Structure

```text
TaskForge/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── ErrorMessage.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── ProjectCard.jsx
│   │   │   ├── ProjectForm.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   └── TaskFilters.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── ProjectDetails.jsx
│   │   │   └── NotFound.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── .env
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── README.md
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── projectController.js
│   │   │   ├── taskController.js
│   │   │   └── dashboardController.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── projectRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   └── dashboardRoutes.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   └── validateMiddleware.js
│   │   │
│   │   ├── validators/
│   │   │   ├── authValidator.js
│   │   │   ├── projectValidator.js
│   │   │   └── taskValidator.js
│   │   │
│   │   ├── utils/
│   │   │   ├── generateToken.js
│   │   │   └── logger.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── docs/
│   ├── ER-Diagram.md
│   └── API-Documentation.md
│
├── .gitignore
└── README.md
```

---

# 7. Database Design

TaskForge uses MySQL as its relational database.

### Users

Stores registered user account information.

```text
users
├── id
├── full_name
├── email
├── password
└── created_at
```

### Projects

Stores projects created by users.

```text
projects
├── id
├── user_id
├── name
├── description
├── status
├── start_date
├── end_date
└── created_at
```

### Tasks

Stores tasks associated with projects.

```text
tasks
├── id
├── project_id
├── name
├── description
├── priority
├── status
└── created_at
```

### Relationships

```text
users
  │
  │ 1:N
  ▼
projects
  │
  │ 1:N
  ▼
tasks
```

A user can have multiple projects, and each project can contain multiple tasks.

---

# 8. Prerequisites

Make sure the following are installed for local development:

* **Node.js** v18 or later
* **npm** v9 or later
* **Git**
* MySQL-compatible database access

For production, the project uses **Aiven Cloud MySQL**, so a local MySQL server is not required when connecting to the deployed database.

---

# 9. Database Setup

## Local Development

If using a local MySQL database, create the database using the provided schema:

```bash
mysql -u root -p < database/schema.sql
```

Optional sample data:

```bash
mysql -u root -p < database/seed.sql
```

## Production Database

The production application uses **Aiven Cloud MySQL**.

The backend connects to the Aiven database using environment variables.

Database credentials and certificates/secrets must not be committed to GitHub.

---

# 10. Environment Variables

## Backend

Create:

```text
backend/.env
```

Example:

```env
PORT=5000

DB_HOST=your-aiven-host
DB_USER=your-aiven-user
DB_PASSWORD=your-aiven-password
DB_NAME=project_management
DB_PORT=your-aiven-port

JWT_SECRET=your-secure-jwt-secret
JWT_EXPIRES_IN=1d
```

For the deployed Render backend, these values are configured through the Render environment settings.

---

## Frontend

Create:

```text
frontend/.env
```

For local development:

```env
VITE_API_URL=http://localhost:5000/api
```

For production:

```env
VITE_API_URL=https://your-render-backend-url/api
```

> Replace the example URL with your actual Render backend URL.

> Never commit `.env` files, database passwords, JWT secrets, or private certificates to GitHub.

---

# 11. Installation & Local Development

## Step 1: Clone the Repository

```bash
git clone <your-github-repository-url>
cd TaskForge
```

## Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

## Step 3: Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

## Step 4: Configure Environment Variables

Configure:

```text
backend/.env
frontend/.env
```

using the appropriate database and API values.

## Step 5: Start Backend

```bash
cd backend
npm run dev
```

Backend:

```text
http://localhost:5000
```

API:

```text
http://localhost:5000/api
```

Health check:

```text
http://localhost:5000/api/health
```

## Step 6: Start Frontend

```bash
cd frontend
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

# 12. REST API Endpoints

| Area      | Method | Endpoint               | Access    | Description            |
| --------- | ------ | ---------------------- | --------- | ---------------------- |
| Health    | GET    | `/api/health`          | Public    | Server health status   |
| Auth      | POST   | `/api/auth/register`   | Public    | Register new user      |
| Auth      | POST   | `/api/auth/login`      | Public    | Login                  |
| Auth      | POST   | `/api/auth/logout`     | Protected | Logout                 |
| Auth      | GET    | `/api/auth/me`         | Protected | Get authenticated user |
| Dashboard | GET    | `/api/dashboard/stats` | Protected | Dashboard statistics   |
| Projects  | GET    | `/api/projects`        | Protected | List user projects     |
| Projects  | GET    | `/api/projects/:id`    | Protected | Get project details    |
| Projects  | POST   | `/api/projects`        | Protected | Create project         |
| Projects  | PUT    | `/api/projects/:id`    | Protected | Update project         |
| Projects  | DELETE | `/api/projects/:id`    | Protected | Delete project         |
| Tasks     | GET    | `/api/tasks`           | Protected | List tasks             |
| Tasks     | GET    | `/api/tasks/:id`       | Protected | Get task details       |
| Tasks     | POST   | `/api/tasks`           | Protected | Create task            |
| Tasks     | PUT    | `/api/tasks/:id`       | Protected | Update task            |
| Tasks     | DELETE | `/api/tasks/:id`       | Protected | Delete task            |

Detailed request and response documentation is available in:

```text
docs/API-Documentation.md
```

---

# 13. Authentication & Authorization

TaskForge uses **JSON Web Tokens (JWT)** for authentication.

## Authentication Flow

```text
User
 │
 │ Login
 ▼
React Frontend
 │
 │ POST /api/auth/login
 ▼
Express Backend
 │
 │ Validate input
 ▼
MySQL
 │
 │ Retrieve user
 ▼
bcrypt Password Verification
 │
 ▼
JWT Generated
 │
 ▼
Frontend
 │
 │ Stores authentication token
 ▼
Protected API Requests
 │
 │ Authorization: Bearer <token>
 ▼
Authentication Middleware
 │
 ▼
Protected Controller
 │
 ▼
User-Owned Data
```

The backend verifies the JWT before allowing access to protected resources.

Project and task access is restricted according to the authenticated user's ownership.

---

# 14. Security Practices

TaskForge includes several security practices.

### SQL Injection Prevention

Database queries use parameterized queries with placeholders.

```sql
SELECT * FROM users WHERE email = ?
```

### Password Protection

Passwords are hashed using **bcryptjs** and are never stored as plain text.

### JWT Authentication

Protected API endpoints require a valid JWT.

### Authentication Rate Limiting

Authentication endpoints use rate limiting to reduce brute-force login attempts.

### Input Validation

Request data is validated using `express-validator`.

### CORS

Cross-origin requests are controlled through the backend CORS configuration.

### Environment Variables

Sensitive configuration is stored in environment variables.

### User Data Isolation

Backend queries verify ownership using the authenticated user's ID.

### Production Database Security

The production database is hosted using **Aiven Cloud MySQL** and the backend connects using configured environment variables and secure database connection settings.

---

# 15. Testing & Verification

The application can be manually tested through the frontend and API.

## Authentication Testing

* Register a new account.
* Attempt registration with an existing email.
* Login with valid credentials.
* Test invalid login credentials.
* Logout.
* Attempt to access protected pages without authentication.

## Project Testing

* Create a project.
* View projects.
* Edit project information.
* Change project status.
* Search projects.
* Filter projects.
* Delete a project.

## Task Testing

* Create a task.
* Edit a task.
* Change task priority.
* Change task status.
* Mark a task as completed.
* Delete a task.
* Verify project progress updates.

## Authorization Testing

* Login as one user.
* Verify only that user's projects are displayed.
* Attempt to access another user's project.
* Verify unauthorized project data cannot be accessed.

## Dashboard Testing

* Create projects and tasks.
* Complete tasks.
* Verify dashboard statistics update correctly.
* Verify project progress changes when tasks are completed.

---

# 16. Production Deployment

TaskForge is deployed using three cloud services.

## Frontend - Netlify

The React frontend is deployed on **Netlify**.

Create a production build:

```bash
cd frontend
npm run build
```

This generates:

```text
frontend/dist/
```

The `dist` directory is deployed to Netlify.

The frontend uses the production backend URL through:

```env
VITE_API_URL=https://your-render-backend-url/api
```

---

## Backend - Render

The Node.js + Express.js backend is deployed on **Render**.

The backend requires the following environment variables:

```text
PORT
DB_HOST
DB_USER
DB_PASSWORD
DB_NAME
DB_PORT
JWT_SECRET
JWT_EXPIRES_IN
```

The backend provides the REST API used by the Netlify frontend.

Health endpoint:

```text
/api/health
```

---

## Database - Aiven Cloud MySQL

The production database is hosted using **Aiven Cloud MySQL**.

The Render backend connects to the Aiven database using the configured database environment variables.

The production database contains:

```text
users
projects
tasks
```

---

## Production Architecture

```text
                 INTERNET
                    │
                    ▼
          ┌──────────────────┐
          │     Netlify      │
          │ React Frontend   │
          └────────┬─────────┘
                   │
                   │ HTTPS REST API
                   ▼
          ┌──────────────────┐
          │      Render      │
          │ Node + Express   │
          └────────┬─────────┘
                   │
                   │ Secure MySQL
                   ▼
          ┌──────────────────┐
          │      Aiven       │
          │   Cloud MySQL    │
          └──────────────────┘
```

---

# 17. Application Workflow

The overall application workflow is:

```text
1. User Registration
        ↓
2. User Login
        ↓
3. JWT Authentication
        ↓
4. Dashboard
        ↓
5. Create Project
        ↓
6. Add Tasks
        ↓
7. Manage Task Status/Priority
        ↓
8. Track Project Progress
        ↓
9. View Dashboard Statistics
```

---

# 18. Screenshots

Add screenshots of the deployed application in this section.

## Authentication

* Login page
* Registration page

## Dashboard

* Dashboard statistics
* Recent projects
* Project progress

## Project Management

* Projects page
* Create project
* Edit project
* Project filtering

## Task Management

* Project details
* Task list
* Create task
* Task filtering
* Task completion

## Responsive Design

* Desktop view
* Tablet view
* Mobile view

## Deployment

Optional screenshots:

* Netlify deployment
* Render service
* Aiven database

---

# 19. Future Enhancements

The following are optional features that can be considered for future versions:

* Docker support
* Unit tests
* Integration tests
* Pagination
* Sorting
* Audit logs
* Role-based access control
* CI/CD pipeline
* Advanced analytics
* Email notifications
* File attachments
* Real-time collaboration
* Password reset
* Refresh-token authentication

These features are **not part of the current implementation**.

---

# 20. Conclusion

TaskForge demonstrates the development of a complete full-stack Project Management System using modern web technologies.

The project includes:

* Secure authentication
* User authorization
* Project management
* Task management
* Dashboard statistics
* Search and filtering
* Input validation
* Secure database queries
* Responsive user interface
* Cloud-hosted MySQL database
* Production frontend deployment
* Production backend deployment

### Deployment Stack

```text
Frontend  → Netlify
Backend   → Render
Database  → Aiven Cloud MySQL
Source    → GitHub
```

# Future Enhancements

The following features can be added in future versions of TaskForge to further improve its functionality, scalability, security, and maintainability:

* 🐳 **Docker Support** – Containerize the frontend, backend, and database environment for consistent development and deployment.

* 🧪 **Unit Testing** – Add automated tests for individual backend functions, controllers, utilities, and frontend components.

* 🔗 **Integration Testing** – Test complete workflows involving the frontend, backend APIs, authentication, and database.

* 📄 **Pagination** – Implement server-side pagination to efficiently handle large numbers of projects and tasks.

* ↕️ **Sorting** – Allow users to sort projects and tasks by fields such as name, status, priority, and creation date.

* 📝 **Audit Logs** – Maintain a detailed history of important user activities such as project creation, updates, deletions, and task changes.

* 🔐 **Role-Based Access Control (RBAC)** – Introduce multiple user roles with different permissions, such as Administrator and User.

* ⚙️ **CI/CD Pipeline** – Automate testing, building, and deployment using a continuous integration and continuous delivery pipeline.

* 📧 **Email Notifications** – Send notifications for task assignments, project updates, deadlines, and other important events.

* 🔔 **Task Reminders** – Provide reminders for upcoming task and project deadlines.

* 📎 **File Attachments** – Allow users to attach documents and files to projects and tasks.

* 📈 **Advanced Analytics** – Add charts and reports for project progress, task completion, productivity, and project performance.

* 👥 **Team Collaboration** – Allow multiple users to collaborate on the same project and assign tasks to team members.

* 🔄 **Real-Time Updates** – Introduce real-time task and project updates using WebSockets.

* 🔑 **Password Reset** – Add secure password recovery functionality through email verification.

* 🌙 **Theme Customization** – Add light/dark mode and additional user interface customization options.

* 📱 **Mobile Application** – Develop a dedicated mobile application for Android and iOS.


TaskForge provides a practical implementation of a modern full-stack web application with a clear separation between frontend, backend, and database layers.
