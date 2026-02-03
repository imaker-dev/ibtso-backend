const Brand = require('../models/Brand');
const BrandAssignment = require('../models/BrandAssignment');
const Dealer = require('../models/Dealer');
const { AppError } = require('../middleware/errorHandler');

// Assign brand to dealers (Admin only)
exports.assignBrandToDealers = async (req, res, next) => {
  try {
    const { brandId } = req.params;
    const { dealerIds } = req.body;

    if (!dealerIds || !Array.isArray(dealerIds) || dealerIds.length === 0) {
      return next(new AppError('Please provide an array of dealer IDs', 400));
    }

    // Verify brand exists
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return next(new AppError('Brand not found', 404));
    }

    // Verify all dealers exist
    const dealers = await Dealer.find({ _id: { $in: dealerIds } });
    if (dealers.length !== dealerIds.length) {
      return next(new AppError('One or more dealer IDs are invalid', 400));
    }

    // Get existing assignments
    const existingAssignments = await BrandAssignment.find({
      brandId,
      dealerId: { $in: dealerIds },
      isActive: true,
    });

    const existingDealerIds = existingAssignments.map(a => a.dealerId.toString());
    const newDealerIds = dealerIds.filter(id => !existingDealerIds.includes(id));

    // Create new assignments
    const newAssignments = await Promise.all(
      newDealerIds.map(dealerId =>
        BrandAssignment.create({
          brandId,
          dealerId,
          assignedBy: req.user._id,
        })
      )
    );

    // Get all current assignments with populated data
    const allAssignments = await BrandAssignment.find({ brandId, isActive: true })
      .populate('dealerId', 'dealerCode name shopName email')
      .populate('assignedBy', 'name email');

    res.status(200).json({
      success: true,
      message: `Brand assigned to ${newAssignments.length} new dealer(s). ${existingDealerIds.length} dealer(s) already assigned.`,
      data: {
        brand: {
          _id: brand._id,
          name: brand.name,
        },
        totalAssignedDealers: allAssignments.length,
        assignedDealers: allAssignments.map(a => ({
          dealer: a.dealerId,
          assignedBy: a.assignedBy,
          assignedAt: a.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Unassign brand from dealers (Admin only)
exports.unassignBrandFromDealers = async (req, res, next) => {
  try {
    const { brandId } = req.params;
    const { dealerIds } = req.body;

    if (!dealerIds || !Array.isArray(dealerIds) || dealerIds.length === 0) {
      return next(new AppError('Please provide an array of dealer IDs', 400));
    }

    // Verify brand exists
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return next(new AppError('Brand not found', 404));
    }

    // Deactivate assignments (soft delete)
    const result = await BrandAssignment.updateMany(
      {
        brandId,
        dealerId: { $in: dealerIds },
        isActive: true,
      },
      {
        isActive: false,
        unassignedBy: req.user._id,
        unassignedAt: new Date(),
      }
    );

    // Get remaining active assignments
    const remainingAssignments = await BrandAssignment.find({ brandId, isActive: true })
      .populate('dealerId', 'dealerCode name shopName email')
      .populate('assignedBy', 'name email');

    res.status(200).json({
      success: true,
      message: `Brand unassigned from ${result.modifiedCount} dealer(s)`,
      data: {
        brand: {
          _id: brand._id,
          name: brand.name,
        },
        totalAssignedDealers: remainingAssignments.length,
        assignedDealers: remainingAssignments.map(a => ({
          dealer: a.dealerId,
          assignedBy: a.assignedBy,
          assignedAt: a.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all dealers assigned to a brand (Admin only)
exports.getDealersForBrand = async (req, res, next) => {
  try {
    const { brandId } = req.params;

    const brand = await Brand.findById(brandId);
    if (!brand) {
      return next(new AppError('Brand not found', 404));
    }

    const assignments = await BrandAssignment.find({ brandId, isActive: true })
      .populate('dealerId', 'dealerCode name shopName email phone location')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        brand: {
          _id: brand._id,
          name: brand.name,
          isActive: brand.isActive,
        },
        totalAssignedDealers: assignments.length,
        dealers: assignments.map(a => ({
          dealer: a.dealerId,
          assignedBy: a.assignedBy,
          assignedAt: a.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all brand assignments (Admin only)
exports.getAllBrandAssignments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, brandId, dealerId } = req.query;

    const query = { isActive: true };
    if (brandId) query.brandId = brandId;
    if (dealerId) query.dealerId = dealerId;

    const assignments = await BrandAssignment.find(query)
      .populate('brandId', 'name isActive')
      .populate('dealerId', 'dealerCode name shopName email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await BrandAssignment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        assignments,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        totalAssignments: count,
      },
    });
  } catch (error) {
    next(error);
  }
};
