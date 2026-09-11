const { validationResult } = require('express-validator');

/**
 * Middleware to check for validation errors from express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array();
    return res.status(400).json({
      success: false,
      message: errorList[0].msg,
      errors: errorList,
    });
  }
  next();
};

module.exports = validate;
