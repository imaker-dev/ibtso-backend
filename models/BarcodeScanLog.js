const mongoose = require('mongoose');

const barcodeScanLogSchema = new mongoose.Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      index: true,
    },
    barcodeValue: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    dealerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dealer',
      required: true,
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      default: null,
      index: true,
    },
    scanType: {
      type: String,
      enum: ['PUBLIC', 'AUTHENTICATED'],
      default: 'PUBLIC',
      index: true,
    },
    scannedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    referer: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

barcodeScanLogSchema.index({ scannedAt: -1, dealerId: 1 });
barcodeScanLogSchema.index({ scannedAt: -1, assetId: 1 });
barcodeScanLogSchema.index({ barcodeValue: 1, scannedAt: -1 });

module.exports = mongoose.model('BarcodeScanLog', barcodeScanLogSchema);
