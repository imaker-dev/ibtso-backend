const mongoose = require('mongoose');

const brandAssignmentSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
    },
    dealerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dealer',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    unassignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    unassignedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a brand can only be assigned once to a dealer
brandAssignmentSchema.index({ brandId: 1, dealerId: 1 }, { unique: true });
brandAssignmentSchema.index({ brandId: 1 });
brandAssignmentSchema.index({ dealerId: 1 });
brandAssignmentSchema.index({ isActive: 1 });

// Only return active assignments by default
brandAssignmentSchema.pre(/^find/, function (next) {
  this.where({ isActive: true });
  next();
});

module.exports = mongoose.model('BrandAssignment', brandAssignmentSchema);
