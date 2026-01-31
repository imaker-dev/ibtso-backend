const { User, Dealer } = require('../models');
const { sendTokenResponse } = require('../utils/jwtToken');
const { AppError } = require('../middleware/errorHandler');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ 
      where: { email },
      attributes: { include: ['password'] }
    });

    if (!user || !(await user.matchPassword(password))) {
      return next(new AppError('Invalid email or password', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Your account has been disabled', 403));
    }

    if (user.isDeleted) {
      return next(new AppError('Your account has been deleted', 403));
    }

    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new AppError('Please provide current and new password', 400));
    }

    if (newPassword.length < 6) {
      return next(new AppError('Password must be at least 6 characters', 400));
    }

    const user = await User.findByPk(req.user._id || req.user.id, {
      attributes: { include: ['password'] }
    });

    if (!(await user.matchPassword(currentPassword))) {
      return next(new AppError('Current password is incorrect', 401));
    }

    user.password = newPassword;
    user.isTemporaryPassword = false;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user._id || req.user.id, {
      include: [{ model: Dealer, as: 'dealer', required: false }]
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const user = await User.findByPk(req.user._id || req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    user.name = name;
    user.email = email;
    await user.save();
    
    const updatedUser = user;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
