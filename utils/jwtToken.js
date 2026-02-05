const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id, user.role);

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    dealerRef: user.dealerRef,
    clientRef: user.clientRef,
    isTemporaryPassword: user.isTemporaryPassword,
  };

  res.status(statusCode).json({
    success: true,
    message,
    token,
    data: {
      user: userResponse
    }
  });
};

module.exports = { generateToken, sendTokenResponse };
