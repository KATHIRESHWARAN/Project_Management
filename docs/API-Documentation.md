# REST API Documentation

Base URL: `http://localhost:5000/api`

All JSON requests should include the header:
`Content-Type: application/json`

All protected endpoints require the header:
`Authorization: Bearer <jwt_token>`

---

## 1. Authentication Endpoints

### 1.1 Register User
- **Method**: `POST`
- **URL**: `/api/auth/register`
- **Auth Required**: No
- **Rate Limit**: 15 requests per 15 minutes
- **Request Body**:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
- **Success Response** (`201 Created`):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "fullName": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Validation failure (e.g. invalid email format, password < 6 chars)
  - `409 Conflict`: Email already exists

### 1.2 Login User
- **Method**: `POST`
- **URL**: `/api/auth/login`
- **Auth Required**: No
- **Rate Limit**: 15 requests per 15 minutes
- **Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "fullName": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Missing email or password
  - `401 Unauthorized`: Invalid email or password

### 1.3 Logout User
- **Method**: `POST`
- **URL**: `/api/auth/logout`
- **Auth Required**: Yes
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 1.4 Current User Profile
- **Method**: `GET`
- **URL**: `/api/auth/me`
- **Auth Required**: Yes
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-09-11T09:00:00.000Z"
  }
}
```

---

## 2. Dashboard Endpoints

### 2.1 Get Dashboard Statistics
- **Method**: `GET`
- **URL**: `/api/dashboard/stats`
- **Auth Required**: Yes
- **Description**: Returns live aggregated metrics calculated strictly from the authenticated user's records.
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "totalProjects": 4,
    "totalTasks": 9,
    "completedTasks": 5,
    "pendingTasks": 2,
    "projectsInProgress": 2,
    "recentProjects": [
      {
        "id": 1,
        "name": "Client Portfolio Website",
        "status": "IN_PROGRESS",
        "startDate": "2026-09-01",
        "endDate": "2026-09-30",
        "totalTasks": 3,
        "completedTasks": 1
      }
    ]
  }
}
```

---

## 3. Project Endpoints

### 3.1 List All User Projects
- **Method**: `GET`
- **URL**: `/api/projects`
- **Auth Required**: Yes
- **Query Parameters**:
  - `search` (optional): Filter projects by name substring (case-insensitive)
  - `status` (optional): Filter by `NOT_STARTED`, `IN_PROGRESS`, or `COMPLETED`
- **Example**: `GET /api/projects?search=portfolio&status=IN_PROGRESS`
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "name": "Client Portfolio Website",
      "description": "Redesigning and launching a modern portfolio.",
      "status": "IN_PROGRESS",
      "startDate": "2026-09-01",
      "endDate": "2026-09-30",
      "createdAt": "2026-09-11T09:00:00.000Z",
      "taskCount": 3,
      "completedTaskCount": 1
    }
  ]
}
```

### 3.2 Get Project By ID
- **Method**: `GET`
- **URL**: `/api/projects/:id`
- **Auth Required**: Yes
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "name": "Client Portfolio Website",
    "description": "Redesigning and launching a modern portfolio.",
    "status": "IN_PROGRESS",
    "startDate": "2026-09-01",
    "endDate": "2026-09-30",
    "createdAt": "2026-09-11T09:00:00.000Z"
  }
}
```
- **Error Responses**:
  - `404 Not Found`: Project not found or does not belong to the user

### 3.3 Create Project
- **Method**: `POST`
- **URL**: `/api/projects`
- **Auth Required**: Yes
- **Request Body**:
```json
{
  "name": "Portfolio Website",
  "description": "Personal portfolio website",
  "status": "IN_PROGRESS",
  "startDate": "2026-09-11",
  "endDate": "2026-09-20"
}
```
- **Success Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": 6,
    "userId": 1,
    "name": "Portfolio Website",
    "description": "Personal portfolio website",
    "status": "IN_PROGRESS",
    "startDate": "2026-09-11",
    "endDate": "2026-09-20",
    "createdAt": "2026-09-11T09:30:00.000Z"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Validation failure (name missing, invalid status, invalid dates)

### 3.4 Update Project
- **Method**: `PUT`
- **URL**: `/api/projects/:id`
- **Auth Required**: Yes
- **Request Body**:
```json
{
  "name": "Updated Portfolio Title",
  "description": "Updated project description",
  "status": "COMPLETED",
  "startDate": "2026-09-11",
  "endDate": "2026-09-25"
}
```
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": { ... }
}
```
- **Error Responses**:
  - `404 Not Found`: Project not found or owned by another user

### 3.5 Delete Project
- **Method**: `DELETE`
- **URL**: `/api/projects/:id`
- **Auth Required**: Yes
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## 4. Task Endpoints

### 4.1 List Tasks
- **Method**: `GET`
- **URL**: `/api/tasks`
- **Auth Required**: Yes
- **Query Parameters**:
  - `search` (optional): Filter task names by substring
  - `status` (optional): `PENDING`, `IN_PROGRESS`, `COMPLETED`
  - `priority` (optional): `LOW`, `MEDIUM`, `HIGH`
  - `projectId` (optional): Filter by specific project
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "projectId": 1,
      "projectName": "Client Portfolio Website",
      "name": "Design Figma Wireframes",
      "description": "Create wireframes for homepage and about pages.",
      "priority": "HIGH",
      "status": "COMPLETED",
      "dueDate": "2026-09-05",
      "createdAt": "2026-09-11T09:00:00.000Z"
    }
  ]
}
```

### 4.2 Get Task By ID
- **Method**: `GET`
- **URL**: `/api/tasks/:id`
- **Auth Required**: Yes
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "projectId": 1,
    "name": "Design Figma Wireframes",
    "description": "Create wireframes for homepage and about pages.",
    "priority": "HIGH",
    "status": "COMPLETED",
    "dueDate": "2026-09-05",
    "createdAt": "2026-09-11T09:00:00.000Z"
  }
}
```

### 4.3 Create Task
- **Method**: `POST`
- **URL**: `/api/tasks`
- **Auth Required**: Yes
- **Request Body**:
```json
{
  "projectId": 1,
  "name": "Create Homepage",
  "description": "Build responsive homepage",
  "priority": "HIGH",
  "status": "PENDING",
  "dueDate": "2026-09-15"
}
```
- **Success Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 11,
    "projectId": 1,
    "name": "Create Homepage",
    "description": "Build responsive homepage",
    "priority": "HIGH",
    "status": "PENDING",
    "dueDate": "2026-09-15",
    "createdAt": "2026-09-11T09:30:00.000Z"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Missing required task fields or invalid format
  - `404 Not Found`: Project does not exist or does not belong to the user

### 4.4 Update Task
- **Method**: `PUT`
- **URL**: `/api/tasks/:id`
- **Auth Required**: Yes
- **Request Body**:
```json
{
  "name": "Updated Task Name",
  "description": "Updated details",
  "priority": "HIGH",
  "status": "COMPLETED",
  "dueDate": "2026-09-20"
}
```
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": { ... }
}
```

### 4.5 Delete Task
- **Method**: `DELETE`
- **URL**: `/api/tasks/:id`
- **Auth Required**: Yes
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```
