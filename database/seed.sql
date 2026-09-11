-- Project Management System Seed Data
-- Safe demo credentials:
-- User 1: john@example.com / password123
-- User 2: jane@example.com / password123

USE project_management;

-- Insert Users (password is bcrypt hashed for 'password123')
INSERT INTO users (id, full_name, email, password) VALUES
(1, 'John Doe', 'john@example.com', '$2b$10$Y/X/aQ9miEYwFkzlUTSCo.mTipcUOBE2/ZFHgP0PQgcIt2nEZhwnm'),
(2, 'Jane Smith', 'jane@example.com', '$2b$10$Y/X/aQ9miEYwFkzlUTSCo.mTipcUOBE2/ZFHgP0PQgcIt2nEZhwnm')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- Insert Sample Projects for John Doe (User 1)
INSERT INTO projects (id, user_id, name, description, status, start_date, end_date) VALUES
(1, 1, 'Client Portfolio Website', 'Redesigning and launching a modern portfolio for creative agency with interactive showcase.', 'IN_PROGRESS', '2026-09-01', '2026-09-30'),
(2, 1, 'Mobile Banking App API', 'Scalable RESTful API backend with token authentication and transactional endpoints.', 'IN_PROGRESS', '2026-08-15', '2026-10-15'),
(3, 1, 'E-Commerce Storefront', 'Full-stack store platform with shopping cart, stripe integration, and checkout flow.', 'COMPLETED', '2026-07-01', '2026-08-25'),
(4, 1, 'Brand Identity & Design System', 'Component library and style guide tokens for cohesive multi-platform branding.', 'NOT_STARTED', '2026-10-01', '2026-11-15')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Sample Projects for Jane Smith (User 2 - used to verify authorization boundaries)
INSERT INTO projects (id, user_id, name, description, status, start_date, end_date) VALUES
(5, 2, 'Jane Private Analytics Engine', 'Confidential data pipeline and machine learning visualization.', 'IN_PROGRESS', '2026-09-01', '2026-11-30')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Sample Tasks for John's Projects
INSERT INTO tasks (id, project_id, name, description, priority, status, due_date) VALUES
(1, 1, 'Design Figma Wireframes', 'Create wireframes for homepage, about, and case studies pages.', 'HIGH', 'COMPLETED', '2026-09-05'),
(2, 1, 'Develop Hero Animation', 'Implement smooth CSS/Canvas animation for the hero section.', 'MEDIUM', 'IN_PROGRESS', '2026-09-18'),
(3, 1, 'SEO and Meta Optimization', 'Add OpenGraph tags, sitemap generation, and schema markup.', 'LOW', 'PENDING', '2026-09-28'),
(4, 2, 'JWT Middleware Implementation', 'Build secure token validation and role-based route guards.', 'HIGH', 'COMPLETED', '2026-08-20'),
(5, 2, 'Database Schema & Migrations', 'Define tables for accounts, ledgers, and transaction history.', 'HIGH', 'COMPLETED', '2026-08-25'),
(6, 2, 'Rate Limiting & Security Audit', 'Apply express-rate-limit and sanitize user inputs.', 'MEDIUM', 'IN_PROGRESS', '2026-09-22'),
(7, 3, 'Product Catalog Grid', 'Display products with filtering, search, and pagination.', 'HIGH', 'COMPLETED', '2026-07-15'),
(8, 3, 'Stripe Payment Webhook', 'Handle payment confirmation and order receipt dispatch.', 'HIGH', 'COMPLETED', '2026-08-10'),
(9, 4, 'Color Palette & Typography Tokens', 'Establish base design variables for light and dark modes.', 'LOW', 'PENDING', '2026-10-05')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Sample Task for Jane's Project (User 2)
INSERT INTO tasks (id, project_id, name, description, priority, status, due_date) VALUES
(10, 5, 'Jane Secret Task', 'Classified analytics task should not be visible to John.', 'HIGH', 'PENDING', '2026-10-10')
ON DUPLICATE KEY UPDATE name=VALUES(name);
