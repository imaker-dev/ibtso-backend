const mongoose = require('mongoose');

const dealerSchema = new mongoose.Schema(
  {
    dealerCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide dealer name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone number'],
      trim: true,
      validate: {
        validator: function(v) {
          return /^[\d\s\-\+\(\)]+$/.test(v);
        },
        message: 'Please provide a valid phone number'
      }
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    shopName: {
      type: String,
      required: [true, 'Please provide shop name'],
      trim: true,
    },
    vatRegistration: {
      type: String,
      required: [true, 'Please provide VAT registration number'],
      trim: true,
      unique: true,
    },
    location: {
      address: {
        type: String,
        required: [true, 'Please provide address'],
        trim: true,
      },
      latitude: {
        type: Number,
        required: [true, 'Please provide latitude'],
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        required: [true, 'Please provide longitude'],
        min: -180,
        max: 180,
      },
      googleMapLink: {
        type: String,
        trim: true,
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
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
  },
  {
    timestamps: true,
  }
);

dealerSchema.index({ dealerCode: 1 });
dealerSchema.index({ email: 1 });
dealerSchema.index({ vatRegistration: 1 });
dealerSchema.index({ isDeleted: 1 });

dealerSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

module.exports = mongoose.model('Dealer', dealerSchema);
