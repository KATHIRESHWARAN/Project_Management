const express = require('express');
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const {
  createProjectValidator,
  updateProjectValidator,
  projectIdParamValidator,
} = require('../validators/projectValidator');
const validate = require('../middleware/validateMiddleware');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// All project routes require authentication
router.use(authenticateToken);

// GET /api/projects
router.get('/', getProjects);

// GET /api/projects/:id
router.get('/:id', projectIdParamValidator, validate, getProjectById);

// POST /api/projects
router.post('/', createProjectValidator, validate, createProject);

// PUT /api/projects/:id
router.put('/:id', updateProjectValidator, validate, updateProject);

// DELETE /api/projects/:id
router.delete('/:id', projectIdParamValidator, validate, deleteProject);

module.exports = router;
