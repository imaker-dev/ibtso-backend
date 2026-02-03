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
  body('name').trim().optional(),
  body('phone').trim().optional(),
  body('email')
    .trim()
    .isEmail()
    .optional({ checkFalsy: true }),
  body('shopName').trim().optional(),
  body('vatRegistration')
    .trim()
    .optional(),
  body('location.address')
    .trim()
    .optional(),
  body('location.latitude')
    .optional()
    .isNumeric()
    .withMessage('Latitude must be a number'),
  body('location.longitude')
    .optional()
    .isNumeric()
    .withMessage('Longitude must be a number'),
  body('brandIds')
    .optional()
    .isArray()
    .withMessage('brandIds must be an array'),
  body('brandIds.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid brand ID in array'),
  validate,
];

const updateDealerValidation = [
  param('id').isMongoId().withMessage('Invalid dealer ID'),
  body('brandIds')
    .optional()
    .isArray()
    .withMessage('brandIds must be an array'),
  body('brandIds.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid brand ID in array'),
  validate,
];

const createAssetValidation = [
  body('fixtureNo').trim().notEmpty().withMessage('Fixture number is required'),
  body('assetNo').trim().notEmpty().withMessage('Asset number is required'),
  body('standType').trim().notEmpty().withMessage('Stand type is required'),
  body('brandId')
    .notEmpty()
    .withMessage('Brand ID is required')
    .isMongoId()
    .withMessage('Invalid brand ID'),
  body('dealerId')
    .notEmpty()
    .withMessage('Dealer ID is required')
    .isMongoId()
    .withMessage('Invalid dealer ID'),
  body('clientId')
    .optional()
    .isMongoId()
    .withMessage('Invalid client ID'),
  body('installationDate')
    .notEmpty()
    .withMessage('Installation date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
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

const createBrandValidation = [
  body('name').trim().optional(),
  validate,
];

const assignBrandValidation = [
  param('brandId').isMongoId().withMessage('Invalid brand ID'),
  body('dealerIds')
    .isArray()
    .withMessage('dealerIds must be an array')
    .notEmpty()
    .withMessage('dealerIds array cannot be empty'),
  body('dealerIds.*')
    .isMongoId()
    .withMessage('Invalid dealer ID in array'),
  validate,
];

const updateBrandValidation = [
  param('id').isMongoId().withMessage('Invalid brand ID'),
  body('name').trim().optional(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  validate,
];

const createClientValidation = [
  body('name').trim().notEmpty().withMessage('Client name is required'),
  body('email')
    .trim()
    .isEmail()
    .optional({ checkFalsy: true }),
  body('phone').trim().optional(),
  body('company').trim().optional(),
  body('address').trim().optional(),
  body('vatin').trim().optional(),
  body('placeOfSupply').trim().optional(),
  body('country').trim().optional(),
  body('dealerIds')
    .optional()
    .isArray()
    .withMessage('dealerIds must be an array'),
  body('dealerIds.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid dealer ID in array'),
  validate,
];

const updateClientValidation = [
  param('id').isMongoId().withMessage('Invalid client ID'),
  body('name').trim().optional(),
  body('email')
    .trim()
    .isEmail()
    .optional({ checkFalsy: true }),
  body('phone').trim().optional(),
  body('company').trim().optional(),
  body('address').trim().optional(),
  body('vatin').trim().optional(),
  body('placeOfSupply').trim().optional(),
  body('country').trim().optional(),
  body('dealerIds')
    .optional()
    .isArray()
    .withMessage('dealerIds must be an array'),
  body('dealerIds.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid dealer ID in array'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  validate,
];

const assignDealersValidation = [
  param('clientId').isMongoId().withMessage('Invalid client ID'),
  body('dealerIds')
    .isArray()
    .withMessage('dealerIds must be an array')
    .notEmpty()
    .withMessage('dealerIds array cannot be empty'),
  body('dealerIds.*')
    .isMongoId()
    .withMessage('Invalid dealer ID in array'),
  validate,
];

module.exports = {
  validate,
  loginValidation,
  createDealerValidation,
  updateDealerValidation,
  createAssetValidation,
  paginationValidation,
  createBrandValidation,
  updateBrandValidation,
  assignBrandValidation,
  createClientValidation,
  updateClientValidation,
  assignDealersValidation,
};
