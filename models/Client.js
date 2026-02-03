const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide client name'],
      trim: true,
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
    phone: {
      type: String,
      required: [false, 'Please provide phone number'],
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^[\d\s\-\+\(\)]+$/.test(v);
        },
        message: 'Please provide a valid phone number'
      }
    },
    company: {
      type: String,
      required: [false, 'Please provide company name'],
      trim: true,
    },
    address: {
      type: String,
      required: [false, 'Please provide address'],
      trim: true,
    },
    vatin: {
      type: String,
      required: [false, 'Please provide VATIN'],
      trim: true,
      uppercase: true,
    },
    placeOfSupply: {
      type: String,
      required: [false, 'Please provide place of supply'],
      trim: true,
    },
    country: {
      type: String,
      required: [false, 'Please provide country'],
      trim: true,
    },
    dealerIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dealer',
    }],
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
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

clientSchema.index({ name: 1 });
clientSchema.index({ email: 1 });
clientSchema.index({ dealerIds: 1 });
clientSchema.index({ isDeleted: 1 });

clientSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

module.exports = mongoose.model('Client', clientSchema);
