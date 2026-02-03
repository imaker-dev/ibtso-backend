const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [false, 'Please provide brand name'],
      trim: true,
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
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

brandSchema.index({ name: 1 });
brandSchema.index({ isDeleted: 1 });

brandSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

module.exports = mongoose.model('Brand', brandSchema);
