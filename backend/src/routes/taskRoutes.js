const express = require('express');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const {
  createTaskValidator,
  updateTaskValidator,
  taskIdParamValidator,
} = require('../validators/taskValidator');
const validate = require('../middleware/validateMiddleware');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// All task routes require authentication
router.use(authenticateToken);

// GET /api/tasks
router.get('/', getTasks);

// GET /api/tasks/:id
router.get('/:id', taskIdParamValidator, validate, getTaskById);

// POST /api/tasks
router.post('/', createTaskValidator, validate, createTask);

// PUT /api/tasks/:id
router.put('/:id', updateTaskValidator, validate, updateTask);

// DELETE /api/tasks/:id
router.delete('/:id', taskIdParamValidator, validate, deleteTask);

module.exports = router;
