const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('./errorHandler');

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('You are not logged in. Please log in to get access', 401)
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id).select('+password');

    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token no longer exists', 401)
      );
    }

    if (!currentUser.isActive) {
      return next(
        new AppError('Your account has been disabled. Please contact admin', 403)
      );
    }

    if (currentUser.isDeleted) {
      return next(
        new AppError('Your account has been deleted', 403)
      );
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('Password recently changed. Please log in again', 401)
      );
    }

    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired. Please log in again', 401));
    }
    next(error);
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.checkOwnership = (Model, resourceParam = 'id') => {
  return async (req, res, next) => {
    try {
      if (req.user.role === 'ADMIN') {
        return next();
      }

      const resource = await Model.findById(req.params[resourceParam]);

      if (!resource) {
        return next(new AppError('Resource not found', 404));
      }

      if (req.user.role === 'DEALER') {
        const userDealerRef = req.user.dealerRef;
        if (resource.dealerId && resource.dealerId.toString() !== userDealerRef.toString()) {
          return next(
            new AppError('You do not have permission to access this resource', 403)
          );
        }
        
        if (resource._id && resource._id.toString() !== userDealerRef.toString()) {
          return next(
            new AppError('You do not have permission to access this resource', 403)
          );
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
