const express = require('express');
const router = express.Router();
const {
  scanBarcode,
  scanBarcodePublic,
  regenerateBarcodeForAsset,
  downloadBarcode,
  checkBarcodeAvailability,
  downloadAllBarcodesAsPDF,
  downloadAllBarcodesAsZIP,
} = require('../controllers/barcodeController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/public/scan/:barcodeValue', scanBarcodePublic);

router.use(protect);

router.get('/scan/:barcodeValue', scanBarcode);

router.get('/download/:assetId', downloadBarcode);

router.post('/regenerate/:assetId', restrictTo('ADMIN'), regenerateBarcodeForAsset);

router.get('/check/:barcodeValue', checkBarcodeAvailability);

router.get('/dealer/:dealerId/download-pdf', restrictTo('ADMIN'), downloadAllBarcodesAsPDF);

router.get('/dealer/:dealerId/download-zip', restrictTo('ADMIN'), downloadAllBarcodesAsZIP);

module.exports = router;
