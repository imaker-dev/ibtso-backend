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
      required: [false, 'Please provide dealer name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [false, 'Please provide phone number'],
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
      required: [false, 'Please provide email'],
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    shopName: {
      type: String,
      required: [false, 'Please provide shop name'],
      trim: true,
    },
    vatRegistration: {
      type: String,
      required: [false, 'Please provide VAT registration number'],
      trim: true,
      unique: true,
      sparse: true,
    },
    location: {
      address: {
        type: String,
        required: [false, 'Please provide address'],
        trim: false,
      },
      latitude: {
        type: Number,
        required: [false, 'Please provide latitude'],
      },
      longitude: {
        type: Number,
        required: [false, 'Please provide longitude'],
      },
      googleMapLink: {
        type: String,
        trim: false,
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
