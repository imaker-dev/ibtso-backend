const express = require('express');
const router = express.Router();
const { 
  updateClientProfile, 
  changeClientPassword 
} = require('../controllers/clientProfileController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);
router.use(restrictTo('CLIENT'));

// PUT /api/v1/clients/me/profile
router.put('/profile', updateClientProfile);

// PUT /api/v1/clients/me/change-password
router.put('/change-password', changeClientPassword);

module.exports = router;
