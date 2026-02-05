const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getDealerDashboard,
  getSystemStats,
  getClientDashboard,
} = require('../controllers/dashboardController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

router.get('/admin', restrictTo('ADMIN'), getAdminDashboard);

router.get('/dealer', restrictTo('DEALER'), getDealerDashboard);

router.get('/client', restrictTo('CLIENT'), getClientDashboard);

router.get('/system-stats', restrictTo('ADMIN'), getSystemStats);

module.exports = router;
