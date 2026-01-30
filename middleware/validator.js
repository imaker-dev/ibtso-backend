const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    return next(new AppError(errorMessages.join(', '), 400));
  }
  next();
};

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  validate,
];

const createDealerValidation = [
  body('name').trim().notEmpty().withMessage('Dealer name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('shopName').trim().notEmpty().withMessage('Shop name is required'),
  body('vatRegistration')
    .trim()
    .notEmpty()
    .withMessage('VAT registration is required'),
  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('location.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('location.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  validate,
];

const updateDealerValidation = [
  param('id').isUUID().withMessage('Invalid dealer ID'),
  validate,
];

const createAssetValidation = [
  body('fixtureNo').trim().notEmpty().withMessage('Fixture number is required'),
  body('assetNo').trim().notEmpty().withMessage('Asset number is required'),
  body('dimension.length')
    .notEmpty()
    .withMessage('Length is required')
    .isNumeric()
    .withMessage('Length must be a number'),
  body('dimension.height')
    .notEmpty()
    .withMessage('Height is required')
    .isNumeric()
    .withMessage('Height must be a number'),
  body('dimension.depth')
    .notEmpty()
    .withMessage('Depth is required')
    .isNumeric()
    .withMessage('Depth must be a number'),
  body('standType').trim().notEmpty().withMessage('Stand type is required'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('dealerId')
    .notEmpty()
    .withMessage('Dealer ID is required')
    .isUUID()
    .withMessage('Invalid dealer ID'),
  body('installationDate')
    .notEmpty()
    .withMessage('Installation date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('location.latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('location.longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  validate,
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validate,
];

module.exports = {
  validate,
  loginValidation,
  createDealerValidation,
  updateDealerValidation,
  createAssetValidation,
  paginationValidation,
};
