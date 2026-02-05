const express = require('express');
const router = express.Router();
const { getClientAssets } = require('../controllers/clientAssetController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);
router.use(restrictTo('CLIENT'));

// GET /api/v1/assets/client/me
router.get('/me', getClientAssets);

module.exports = router;
