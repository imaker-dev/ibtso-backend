const express = require('express');
const router = express.Router();
const {
  scanBarcode,
  scanBarcodePublic,
  regenerateBarcodeForAsset,
  downloadBarcode,
  downloadAllBarcodesAsPDF,
  downloadAllBarcodesAsZIP,
  downloadAllAssetsPDF,
  downloadSingleAssetQR,
  downloadMultipleAssetsQR,
} = require('../controllers/barcodeController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/public/scan/:barcodeValue', scanBarcodePublic);

router.use(protect);

router.get('/scan/:barcodeValue', scanBarcode);

router.get('/download/:assetId', downloadBarcode);

router.post('/regenerate/:assetId', restrictTo('ADMIN'), regenerateBarcodeForAsset);

// router.get('/check/:barcodeValue', checkBarcodeAvailability); // Function not implemented

router.get('/dealer/:dealerId/download-pdf', restrictTo('ADMIN'), downloadAllBarcodesAsPDF);

router.get('/dealer/:dealerId/download-zip', restrictTo('ADMIN'), downloadAllBarcodesAsZIP);

// Download all assets PDF (admin only) - supports date range filtering
router.get('/download-all-pdf', restrictTo('ADMIN'), downloadAllAssetsPDF);

// Download single asset QR as PNG
router.get('/download-qr/:assetId', downloadSingleAssetQR);

// Download multiple assets QR as PDF (POST with assetIds array in body)
router.post('/download-multiple-qr', downloadMultipleAssetsQR);

module.exports = router;
