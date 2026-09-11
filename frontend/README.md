# Frontend - TaskForge Project Management System

Modern, responsive Single Page Application built with React 19, Vite, React Router DOM v7, and Axios.

## Features
- Complete Authentication flow (Registration, Login, Session persistence, Protected routes)
- Executive Dashboard with 5 live statistics cards and recent projects
- Projects management (Create, Read, Update, Delete, Name Search, Status Filtering)
- Task management (Create, Read, Update, Delete, Priority tags, Status toggle, Name Search, Filters)
- Progress tracking with visual percentage bars
- Centralized Axios client with automatic Bearer token injection and 401 interception
- Pure modern Vanilla CSS design system (no bulky CSS framework dependencies)
- 100% responsive for Desktop, Tablet, and Mobile devices

## Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Copy `.env.example` to `.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Production Build**:
   ```bash
   npm run build
   ```
