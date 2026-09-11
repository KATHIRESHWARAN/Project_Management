const { body, param } = require('express-validator');

const validStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];

const createProjectValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ max: 255 }).withMessage('Project name cannot exceed 255 characters'),
  body('description')
    .optional({ checkFalsy: true })
    .isString().withMessage('Description must be a string'),
  body('status')
    .optional()
    .isIn(validStatuses).withMessage(`Status must be one of: ${validStatuses.join(', ')}`),
  body('startDate')
    .optional({ checkFalsy: true })
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Start date must be in YYYY-MM-DD format'),
  body('endDate')
    .optional({ checkFalsy: true })
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('End date must be in YYYY-MM-DD format')
    .custom((endDate, { req }) => {
      if (req.body.startDate && endDate) {
        if (new Date(endDate) < new Date(req.body.startDate)) {
          throw new Error('End date cannot be earlier than start date');
        }
      }
      return true;
    }),
];

const updateProjectValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Project ID must be a positive integer'),
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Project name cannot be empty')
    .isLength({ max: 255 }).withMessage('Project name cannot exceed 255 characters'),
  body('description')
    .optional()
    .isString().withMessage('Description must be a string'),
  body('status')
    .optional()
    .isIn(validStatuses).withMessage(`Status must be one of: ${validStatuses.join(', ')}`),
  body('startDate')
    .optional({ checkFalsy: true })
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Start date must be in YYYY-MM-DD format'),
  body('endDate')
    .optional({ checkFalsy: true })
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('End date must be in YYYY-MM-DD format')
    .custom((endDate, { req }) => {
      if (req.body.startDate && endDate) {
        if (new Date(endDate) < new Date(req.body.startDate)) {
          throw new Error('End date cannot be earlier than start date');
        }
      }
      return true;
    }),
];

const projectIdParamValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Project ID must be a positive integer'),
];

module.exports = {
  createProjectValidator,
  updateProjectValidator,
  projectIdParamValidator,
};
