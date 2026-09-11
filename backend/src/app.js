const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');
const logger = require('./utils/logger');

const app = express();

// Trust first proxy (Render, Railway, Heroku, Nginx) for accurate IP rate-limiting
app.set('trust proxy', 1);

// Configure Cross-Origin Resource Sharing (CORS)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map((url) => url.trim()) : []),
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, Postman, health checks)
    if (!origin) return callback(null, true);

    // If FRONTEND_URL is set to '*' or in development, allow all origins
    if (process.env.FRONTEND_URL === '*' || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // Match allowed origins, Netlify domains, Vercel domains, and local ports
    const isAllowed =
      allowedOrigins.some((allowed) => allowed.replace(/\/$/, '') === origin.replace(/\/$/, '')) ||
      /\.netlify\.app$/.test(origin) ||
      /\.vercel\.app$/.test(origin) ||
      /^http:\/\/localhost(:\d+)?$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked: Origin ${origin} is not allowed.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Body parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Standardized HTTP request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Root and /api Welcome Endpoints
app.get(['/', '/api'], (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Project Management System REST API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me (Protected)',
      },
      projects: '/api/projects (Protected)',
      tasks: '/api/tasks (Protected)',
      dashboard: '/api/dashboard/stats (Protected)',
    },
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Project Management System API is running smoothly.',
    timestamp: new Date().toISOString(),
  });
});

// Mount application routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Handle 404 for undefined routes
app.use(notFoundHandler);

// Centralized error handling
app.use(errorHandler);

module.exports = app;
