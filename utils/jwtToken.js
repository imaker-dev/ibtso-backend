const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user.id);

  const userResponse = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    dealerRef: user.dealerRef || user.dealer_ref,
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
