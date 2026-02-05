const { body, param, query, validationResult } = require('express-validator');

/**
 * Centralized input validators for ShopEase API
 * Prevents XSS, SQL injection, NoSQL injection, and malformed data
 */

// Sanitize string inputs: trim, remove script tags, limit length
const sanitizeString = (maxLen = 200) =>
  body('*')
    .if(val => typeof val === 'string')
    .trim()
    .isLength({ max: maxLen })
    .withMessage(`String must be ${maxLen} characters or less`)
    .escape(); // Escape HTML entities to prevent XSS

// User validators
const validateUserSignup = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  body('email')
    .trim()
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and numbers'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 15 }).withMessage('Phone number too long')
    .matches(/^[+\d\-\s()]+$/).withMessage('Invalid phone number format')
];

const validateUserLogin = [
  body('email')
    .trim()
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password required')
];

// Product validators
const validateProductCreate = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name required')
    .isLength({ min: 3, max: 100 }).withMessage('Product name must be 3-100 characters'),
  body('description')
    .trim()
    .optional()
    .isLength({ max: 1000 }).withMessage('Description too long'),
  body('price')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category required')
    .isLength({ max: 50 }).withMessage('Category too long'),
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'archived']).withMessage('Invalid product status')
];

// Order validators
const validateOrderCreate = [
  body('items')
    .isArray({ min: 1 }).withMessage('Order must contain at least one item')
    .custom((items) => {
      items.forEach(item => {
        if (!item.productId || !item.quantity) {
          throw new Error('Each item must have productId and quantity');
        }
        if (!Number.isInteger(item.quantity) || item.quantity < 1) {
          throw new Error('Quantity must be a positive integer');
        }
      });
      return true;
    }),
  body('shippingAddress')
    .optional()
    .isObject().withMessage('Shipping address must be an object'),
  body('shippingAddress.firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Invalid first name'),
  body('shippingAddress.email')
    .optional()
    .isEmail().withMessage('Invalid email in shipping address'),
  body('paymentMethod')
    .isIn(['card', 'bank_transfer', 'flutterwave', 'paystack', 'paypal', 'apple_pay', 'google_pay'])
    .withMessage('Invalid payment method')
];

// Payment validators
const validatePaymentInitiate = [
  param('orderId')
    .isMongoId().withMessage('Invalid order ID'),
  body('method')
    .isIn(['flutterwave', 'paystack', 'card', 'bank_transfer'])
    .withMessage('Invalid payment method'),
  body('amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Amount must be positive')
];

// Search/Filter validators
const validatePaginationQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be >= 1'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('sort')
    .optional()
    .matches(/^[-\w]+$/).withMessage('Invalid sort parameter'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search query too long')
    .escape() // Prevent injection
];

// Generic validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({
        field: e.param,
        message: e.msg
      }))
    });
  }
  next();
};

module.exports = {
  sanitizeString,
  validateUserSignup,
  validateUserLogin,
  validateProductCreate,
  validateOrderCreate,
  validatePaymentInitiate,
  validatePaginationQuery,
  handleValidationErrors
};
