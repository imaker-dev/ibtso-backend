const express = require('express');
const router = express.Router();
const {
  createAsset,
  getAllAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  updateAssetStatus,
  getAssetsByDealer,
  getAssetBrands,
} = require('../controllers/assetController');
const { protect, restrictTo } = require('../middleware/auth');
const { 
  createAssetValidation,
  paginationValidation 
} = require('../middleware/validator');
const { uploadAssetImages, handleMulterError } = require('../middleware/upload');

router.use(protect);

router.get('/brands', getAssetBrands);

router.get('/dealer/:dealerId', paginationValidation, getAssetsByDealer);

router
  .route('/')
  .get(paginationValidation, getAllAssets)
  .post(uploadAssetImages, handleMulterError, createAssetValidation, createAsset);

router
  .route('/:id')
  .get(getAssetById)
  .put(uploadAssetImages, handleMulterError, updateAsset)
  .delete(restrictTo('ADMIN'), deleteAsset);

router.patch('/:id/status', updateAssetStatus);

module.exports = router;
