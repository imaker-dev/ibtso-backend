const express = require('express');
const router = express.Router();
const {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  getBrandsByDealer,
} = require('../controllers/brandController');
const {
  assignBrandToDealers,
  unassignBrandFromDealers,
  getDealersForBrand,
  getAllBrandAssignments,
} = require('../controllers/brandAssignmentController');
const { protect, restrictTo } = require('../middleware/auth');
const { createBrandValidation, updateBrandValidation, assignBrandValidation } = require('../middleware/validator');

router.use(protect);
router.use(restrictTo('ADMIN'));

// Brand CRUD - Admin only (independent brands)
router.post('/', createBrandValidation, createBrand);
router.get('/', getAllBrands);
router.get('/:id', getBrandById);
router.put('/:id', updateBrandValidation, updateBrand);
router.delete('/:id', deleteBrand);

// Brand assignment operations
router.post('/:brandId/assign-dealers', assignBrandValidation, assignBrandToDealers);
router.post('/:brandId/unassign-dealers', assignBrandValidation, unassignBrandFromDealers);
router.get('/:brandId/dealers', getDealersForBrand);
router.get('/assignments/all', getAllBrandAssignments);

// Get brands by dealer
router.get('/dealer/:dealerId', getBrandsByDealer);

module.exports = router;
