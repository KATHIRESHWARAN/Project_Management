# Backend - Project Management System

Node.js & Express.js REST API with MySQL, JWT Authentication, and bcrypt password hashing.

## Features
- Modular MVC architecture (`controllers`, `routes`, `middleware`, `validators`, `config`, `utils`)
- JWT Authentication (`jsonwebtoken`) with `Bearer` tokens
- Password hashing with `bcryptjs` (salt rounds: 10)
- Parameterized SQL queries via `mysql2/promise` to prevent SQL Injection
- Strict data isolation and ownership authorization (projects & tasks tied to authenticated user ID)
- Request validation with `express-validator`
- Brute-force protection on auth endpoints with `express-rate-limit`
- Centralized error and 404 handling

## Setup & Running

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and set your MySQL credentials:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=YOUR_MYSQL_PASSWORD
   DB_NAME=project_management
   DB_PORT=3306
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRES_IN=1d
   ```

3. **Database Setup**:
   Execute `database/schema.sql` and `database/seed.sql` in MySQL:
   ```bash
   mysql -u root -p < ../database/schema.sql
   mysql -u root -p < ../database/seed.sql
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Start Production Server**:
   ```bash
   npm start
   ```
