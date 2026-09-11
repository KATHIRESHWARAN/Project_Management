const { body, param, query } = require('express-validator');

const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

const createTaskValidator = [
  body('projectId')
    .notEmpty().withMessage('Project ID is required')
    .isInt({ min: 1 }).withMessage('Project ID must be a valid positive integer'),
  body('name')
    .trim()
    .notEmpty().withMessage('Task name is required')
    .isLength({ max: 255 }).withMessage('Task name cannot exceed 255 characters'),
  body('description')
    .optional({ checkFalsy: true })
    .isString().withMessage('Description must be a string'),
  body('priority')
    .optional()
    .isIn(validPriorities).withMessage(`Priority must be one of: ${validPriorities.join(', ')}`),
  body('status')
    .optional()
    .isIn(validStatuses).withMessage(`Status must be one of: ${validStatuses.join(', ')}`),
  body('dueDate')
    .optional({ checkFalsy: true })
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Due date must be in YYYY-MM-DD format'),
];

const updateTaskValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Task ID must be a positive integer'),
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Task name cannot be empty')
    .isLength({ max: 255 }).withMessage('Task name cannot exceed 255 characters'),
  body('description')
    .optional()
    .isString().withMessage('Description must be a string'),
  body('priority')
    .optional()
    .isIn(validPriorities).withMessage(`Priority must be one of: ${validPriorities.join(', ')}`),
  body('status')
    .optional()
    .isIn(validStatuses).withMessage(`Status must be one of: ${validStatuses.join(', ')}`),
  body('dueDate')
    .optional({ checkFalsy: true })
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Due date must be in YYYY-MM-DD format'),
];

const taskIdParamValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Task ID must be a positive integer'),
];

module.exports = {
  createTaskValidator,
  updateTaskValidator,
  taskIdParamValidator,
};
