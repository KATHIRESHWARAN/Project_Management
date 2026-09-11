const express = require('express');
const { getStats } = require('../controllers/dashboardController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// Protected dashboard routes
router.use(authenticateToken);

// GET /api/dashboard/stats
router.get('/stats', getStats);

module.exports = router;
