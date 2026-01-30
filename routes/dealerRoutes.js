const express = require('express');
const router = express.Router();
const {
  createDealer,
  getAllDealers,
  getDealerById,
  updateDealer,
  deleteDealer,
  toggleDealerStatus,
  resetDealerPassword,
  getDealerStats,
} = require('../controllers/dealerController');
const { protect, restrictTo } = require('../middleware/auth');
const { 
  createDealerValidation, 
  updateDealerValidation,
  paginationValidation 
} = require('../middleware/validator');

router.use(protect);

router.get('/stats/:id', getDealerStats);

router.get('/my-stats', restrictTo('DEALER'), getDealerStats);

router
  .route('/')
  .get(paginationValidation, getAllDealers)
  .post(restrictTo('ADMIN'), createDealerValidation, createDealer);

router
  .route('/:id')
  .get(getDealerById)
  .put(restrictTo('ADMIN'), updateDealerValidation, updateDealer)
  .delete(restrictTo('ADMIN'), deleteDealer);

router.patch('/:id/toggle-status', restrictTo('ADMIN'), toggleDealerStatus);
router.post('/:id/reset-password', restrictTo('ADMIN'), resetDealerPassword);

module.exports = router;
