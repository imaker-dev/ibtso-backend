const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    fixtureNo: {
      type: String,
      required: [true, 'Please provide fixture number'],
      trim: true,
    },
    assetNo: {
      type: String,
      required: [true, 'Please provide asset number'],
      trim: true,
      unique: true,
    },
    dimension: {
      length: {
        type: Number,
        required: [true, 'Please provide length'],
      },
      height: {
        type: Number,
        required: [true, 'Please provide height'],
      },
      depth: {
        type: Number,
        required: [true, 'Please provide depth'],
      },
      unit: {
        type: String,
        default: 'cm',
        enum: ['cm', 'inch', 'mm', 'm'],
      },
    },
    standType: {
      type: String,
      required: [true, 'Please provide stand type'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Please provide brand'],
      trim: true,
    },
    dealerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dealer',
      required: [true, 'Please provide dealer'],
    },
    installationDate: {
      type: Date,
      required: [true, 'Please provide installation date'],
      validate: {
        validator: function(value) {
          return value <= new Date();
        },
        message: 'Installation date cannot be in the future',
      },
    },
    location: {
      address: {
        type: String,
        required: [false, 'Please provide address'],
        trim: true,
      },
      latitude: {
        type: Number,
        required: [false, 'Please provide latitude'],
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        required: [false, 'Please provide longitude'],
        min: -180,
        max: 180,
      },
      googleMapLink: {
        type: String,
        trim: true,
      },
    },
    barcodeValue: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    barcodeImagePath: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DAMAGED'],
      default: 'ACTIVE',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

assetSchema.virtual('barcodeImageUrl').get(function() {
  const appUrl = process.env.APP_URL || 'http://localhost:5000';
  return `${appUrl}/${this.barcodeImagePath}`;
});

assetSchema.index({ barcodeValue: 1 });
assetSchema.index({ dealerId: 1 });
assetSchema.index({ fixtureNo: 1, dealerId: 1 });
assetSchema.index({ brand: 1 });
assetSchema.index({ isDeleted: 1 });
assetSchema.index({ createdAt: -1 });

assetSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

module.exports = mongoose.model('Asset', assetSchema);
