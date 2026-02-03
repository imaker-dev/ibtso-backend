const Brand = require('../models/Brand');
const BrandAssignment = require('../models/BrandAssignment');
const Dealer = require('../models/Dealer');
const { AppError } = require('../middleware/errorHandler');

// Create brand (Admin only - independent of dealers)
exports.createBrand = async (req, res, next) => {
  try {
    const { name } = req.body;

    // Generate default name if not provided
    const brandName = name || `Brand_${Date.now()}`;

    const brand = await Brand.create({
      name: brandName,
      createdBy: req.user._id,
    });

    const populatedBrand = await Brand.findById(brand._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: populatedBrand,
    });
  } catch (error) {
    next(error);
  }
};

// Get all brands (Admin only)
exports.getAllBrands = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;

    const query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const brands = await Brand.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Brand.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        brands,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        totalBrands: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get brand by ID (Admin only)
exports.getBrandById = async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!brand) {
      return next(new AppError('Brand not found', 404));
    }

    // Get assigned dealers for this brand
    const assignments = await BrandAssignment.find({ brandId: req.params.id, isActive: true })
      .populate('dealerId', 'dealerCode name shopName email')
      .populate('assignedBy', 'name email');

    res.status(200).json({
      success: true,
      data: {
        ...brand.toObject(),
        assignedDealers: assignments.map(a => ({
          dealer: a.dealerId,
          assignedBy: a.assignedBy,
          assignedAt: a.createdAt,
        })),
        totalAssignedDealers: assignments.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update brand (Admin only)
exports.updateBrand = async (req, res, next) => {
  try {
    const { name, isActive } = req.body;

    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return next(new AppError('Brand not found', 404));
    }

    const updateData = { updatedBy: req.user._id };
    if (name !== undefined) updateData.name = name;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedBrand = await Brand.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Brand updated successfully',
      data: updatedBrand,
    });
  } catch (error) {
    next(error);
  }
};

// Delete brand (Admin only - soft delete)
exports.deleteBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return next(new AppError('Brand not found', 404));
    }

    brand.isDeleted = true;
    brand.updatedBy = req.user._id;
    await brand.save();

    res.status(200).json({
      success: true,
      message: 'Brand deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get brands for a specific dealer (Admin only)
exports.getBrandsByDealer = async (req, res, next) => {
  try {
    const { dealerId } = req.params;

    const dealer = await Dealer.findById(dealerId);
    if (!dealer) {
      return next(new AppError('Dealer not found', 404));
    }

    // Get brand assignments for this dealer
    const assignments = await BrandAssignment.find({ dealerId, isActive: true })
      .populate({
        path: 'brandId',
        populate: {
          path: 'createdBy',
          select: 'name email',
        },
      })
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    const brands = assignments.map(a => ({
      ...a.brandId.toObject(),
      assignedBy: a.assignedBy,
      assignedAt: a.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        dealer: {
          dealerId: dealer._id,
          dealerCode: dealer.dealerCode,
          name: dealer.name,
          shopName: dealer.shopName,
        },
        totalBrands: brands.length,
        brands,
      },
    });
  } catch (error) {
    next(error);
  }
};
