# TaskForge - Full-Stack Project Management System

A production-ready full-stack Project Management System built with **React, Node.js, Express.js, and MySQL**.

## 📑 Table of Contents

1. Project Overview
2. Project Objectives
3. Key Features
4. IIT Technical Requirements
5. Technology Stack
6. System Architecture
7. Folder Structure
8. Database Design
9. Prerequisites
10. Environment Variables
11. Database Setup
12. Installation & Getting Started
13. Authentication & Authorization
14. Role-Based Access Control
15. Pagination & Sorting
16. Audit Logging
17. REST API Documentation
18. Testing
19. Docker Support
20. CI/CD Pipeline
21. Application Deployment
22. Security Practices
23. Testing & Verification
24. Screenshots
25. Future Enhancements

---

## 1. Project Overview

**TaskForge** is a full-stack Project Management System that allows users to create and manage projects, organize tasks, track progress, and monitor project statistics through a centralized dashboard.

The application follows a structured client-server architecture:

**React Frontend → Express REST API → MySQL Database**

The system also incorporates authentication, authorization, validation, security controls, testing, containerization, CI/CD, and production deployment practices.

---

## 2. Project Objectives

The main objectives of TaskForge are:

* Provide secure user registration and authentication.
* Allow users to create and manage projects.
* Allow users to create, update, complete, and delete tasks.
* Track project and task progress.
* Provide dashboard statistics.
* Implement role-based access control.
* Maintain audit records of important system actions.
* Support pagination and sorting for large datasets.
* Provide automated unit and integration testing.
* Containerize the application using Docker.
* Automate testing and deployment using CI/CD.
* Deploy the application to a production environment.

---

## 3. Key Features

### 🔐 Authentication

* User registration
* User login
* JWT-based authentication
* Password hashing using bcrypt
* Logout functionality
* Protected routes
* Authentication rate limiting
* Input validation

### 📁 Project Management

* Create projects
* View projects
* Update projects
* Delete projects
* Project status tracking
* Start and end dates
* Project search
* Project filtering
* Project progress calculation

### ✅ Task Management

* Create tasks
* Update tasks
* Delete tasks
* Complete tasks
* Task priority
* Task status
* Task filtering
* Task search
* Project-based task organization

### 📊 Dashboard

* Total projects
* Total tasks
* Completed tasks
* Pending tasks
* Projects in progress
* Recent projects
* Project completion progress

---

# 4. IIT Technical Requirements

| Requirement               | Status          |
| ------------------------- | --------------- |
| Docker Support            | 🟡 To Implement |
| Unit Tests                | 🟡 To Implement |
| Integration Tests         | 🟡 To Implement |
| Pagination                | 🟡 To Implement |
| Sorting                   | 🟡 To Implement |
| Audit Logs                | 🟡 To Implement |
| Role-Based Access Control | 🟡 To Implement |
| CI/CD Pipeline            | 🟡 To Implement |
| Application Deployment    | 🟡 To Implement |

> The status should be changed to **🟢 Implemented** after each requirement has been completed and verified.

---

# 5. Technology Stack

## Frontend

* React 19
* Vite
* JavaScript
* React Router
* Axios
* Vanilla CSS

## Backend

* Node.js
* Express.js
* MySQL2
* JWT
* bcryptjs
* express-validator
* express-rate-limit
* CORS
* dotenv

## Testing

* Unit Testing: **[Testing Framework]**
* Integration Testing: **[Testing Framework]**
* API Testing: **[Tool/Framework]**

## DevOps

* Docker
* Docker Compose
* Git
* GitHub
* GitHub Actions

## Deployment

* Frontend: **[Netlify / Vercel / Other]**
* Backend: **[Render / Railway / Other]**
* Database: **[Aiven / Other MySQL Provider]**

---

# 6. System Architecture

```text
                 ┌─────────────────────┐
                 │      User/Client     │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │   React + Vite      │
                 │     Frontend        │
                 └──────────┬──────────┘
                            │ REST API
                            ▼
                 ┌─────────────────────┐
                 │ Node.js + Express   │
                 │      Backend        │
                 └──────────┬──────────┘
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
        Authentication   RBAC         Audit Logs
                            │
                            ▼
                 ┌─────────────────────┐
                 │       MySQL         │
                 │      Database       │
                 └─────────────────────┘
```

---

# 7. Role-Based Access Control

The application uses role-based permissions to control access to protected resources.

Example roles:

| Role  | Permissions                                  |
| ----- | -------------------------------------------- |
| Admin | Manage users, projects, tasks and audit logs |
| User  | Manage own projects and tasks                |

Authorization is enforced on the **backend**, not only through frontend route protection.

Example:

```text
User → Login
     ↓
JWT Generated
     ↓
JWT contains user identity/role
     ↓
Authentication Middleware
     ↓
Role Middleware
     ↓
Protected Controller
```

---

# 8. Pagination & Sorting

Pagination prevents large datasets from being returned in a single API response.

Example:

```http
GET /api/projects?page=1&limit=10
```

Sorting:

```http
GET /api/projects?sortBy=created_at&order=desc
```

Supported parameters:

| Parameter | Example        |
| --------- | -------------- |
| page      | `1`            |
| limit     | `10`           |
| sortBy    | `created_at`   |
| order     | `asc` / `desc` |

The backend validates sorting fields to prevent unsafe SQL queries.

---

# 9. Audit Logging

Important user actions are recorded in an audit log.

Example actions:

* User login
* User logout
* Project creation
* Project update
* Project deletion
* Task creation
* Task update
* Task deletion
* Status changes

Example audit record:

```text
User: John Doe
Action: CREATE_PROJECT
Resource: Project #12
Timestamp: 2026-09-11 10:30:00
```

Audit logs provide traceability and help administrators understand important changes made within the system.

---

# 10. Testing

## Unit Tests

Unit tests verify individual functions or modules independently.

Examples:

* Authentication validation
* Password validation
* Token generation
* Project validation
* Task validation
* Utility functions

Run:

```bash
npm test
```

## Integration Tests

Integration tests verify that multiple parts of the application work together.

Examples:

```text
Register → Database → JWT
Login → Authentication → Protected API
Create Project → MySQL → Retrieve Project
Create Task → Project → Database
```

Example:

```bash
npm run test:integration
```

---

# 11. Docker Support

The application can be containerized using Docker.

Expected services:

```text
┌───────────────┐
│   Frontend    │
│    Docker     │
└───────┬───────┘
        │
┌───────▼───────┐
│    Backend    │
│    Docker     │
└───────┬───────┘
        │
┌───────▼───────┐
│     MySQL     │
│    Docker     │
└───────────────┘
```

Start the application:

```bash
docker compose up --build
```

Stop the application:

```bash
docker compose down
```

---

# 12. CI/CD Pipeline

The project uses GitHub Actions to automate the development workflow.

```text
Developer
   │
   ▼
Git Push
   │
   ▼
GitHub Repository
   │
   ▼
GitHub Actions
   │
   ├── Install Dependencies
   ├── Run Unit Tests
   ├── Run Integration Tests
   ├── Build Application
   └── Deploy
        │
        ▼
   Production
```

The pipeline ensures that code is tested and built automatically before deployment.

---

# 13. Application Deployment

The application is deployed using separate production services for the frontend, backend, and database.

### Frontend

```bash
npm run build
```

Production output:

```text
frontend/dist/
```

### Backend

The backend runs as a production Node.js application.

### Database

The production application connects to a hosted MySQL-compatible database using environment variables.

Production environment variables must never be committed to Git.

---

# 14. Security Practices

* Password hashing using bcrypt
* JWT authentication
* Protected API routes
* Role-based authorization
* Parameterized SQL queries
* Input validation
* Authentication rate limiting
* CORS configuration
* Environment-based secrets
* User-level data isolation
* Secure production configuration

---

# 15. Verification Checklist

Before final submission, verify:

* [ ] Registration works
* [ ] Login works
* [ ] Logout works
* [ ] Protected routes work
* [ ] RBAC works
* [ ] Projects CRUD works
* [ ] Tasks CRUD works
* [ ] Pagination works
* [ ] Sorting works
* [ ] Audit logs are generated
* [ ] Unit tests pass
* [ ] Integration tests pass
* [ ] Docker starts successfully
* [ ] CI/CD pipeline passes
* [ ] Production deployment works
* [ ] Database connection works in production
* [ ] No secrets are committed to GitHub

---

# 16. Screenshots

Add screenshots demonstrating:

### Authentication

* Login
* Registration

### Dashboard

* Statistics
* Recent projects

### Project Management

* Project list
* Create project
* Edit project

### Task Management

* Task list
* Task filters
* Task completion

### Administration

* RBAC
* Audit logs

### DevOps

* Docker containers
* GitHub Actions pipeline
* Production application

---

# 17. Future Enhancements

Possible future improvements:

* Email notifications
* Project collaboration
* Real-time updates using WebSockets
* File attachments
* Advanced analytics
* Activity timeline
* Password reset
* Refresh-token authentication
* Cloud object storage
* Mobile application
