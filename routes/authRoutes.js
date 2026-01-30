const express = require('express');
const router = express.Router();
const { login, changePassword, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { loginValidation } = require('../middleware/validator');

router.post('/login', loginValidation, login);

router.use(protect);

router.get('/me', getMe);
router.put('/change-password', changePassword);
router.put('/update-profile', updateProfile);

module.exports = router;
