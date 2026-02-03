const Dealer = require('../models/Dealer');
const User = require('../models/User');
const Asset = require('../models/Asset');
const Brand = require('../models/Brand');
const BrandAssignment = require('../models/BrandAssignment');
const { generateTemporaryPassword, generateDealerCode } = require('../utils/generatePassword');
const { AppError } = require('../middleware/errorHandler');

exports.createDealer = async (req, res, next) => {
  try {
    const { name, phone, email, shopName, vatRegistration, location, brandIds } = req.body;

    // Generate dealer code from name or use default
    const dealerName = name || 'DEALER';
    const dealerCode = generateDealerCode(dealerName);

    // Check for existing email if provided
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return next(new AppError('Email already registered', 400));
      }

      const existingDealer = await Dealer.findOne({ email }).lean();
      if (existingDealer) {
        return next(new AppError('Dealer with this email already exists', 400));
      }
    }

    // Check for existing VAT registration if provided
    if (vatRegistration) {
      const existingVat = await Dealer.findOne({ vatRegistration }).lean();
      if (existingVat) {
        return next(new AppError('Dealer with this VAT registration already exists', 400));
      }
    }

    const temporaryPassword = generateTemporaryPassword();

    // Create user with email or generate default email from dealer code
    const userEmail = email || `${dealerCode.toLowerCase()}@ibtso.temp`;
    const userName = name || dealerCode;

    const user = await User.create({
      name: userName,
      email: userEmail,
      password: temporaryPassword,
      role: 'DEALER',
      isTemporaryPassword: true,
    });

    // Build dealer data with optional fields
    const dealerData = {
      dealerCode,
      userId: user._id,
      createdBy: req.user._id,
    };

    if (name) dealerData.name = name;
    if (phone) dealerData.phone = phone;
    if (email) dealerData.email = email;
    if (shopName) dealerData.shopName = shopName;
    if (vatRegistration) dealerData.vatRegistration = vatRegistration;

    // Handle location if provided
    if (location && location.address) {
      dealerData.location = {
        address: location.address,
      };
      if (location.latitude !== undefined) dealerData.location.latitude = location.latitude;
      if (location.longitude !== undefined) dealerData.location.longitude = location.longitude;
      if (location.googleMapLink) {
        dealerData.location.googleMapLink = location.googleMapLink;
      } else if (location.latitude && location.longitude) {
        dealerData.location.googleMapLink = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
      }
    }

    const dealer = await Dealer.create(dealerData);

    user.dealerRef = dealer._id;
    await user.save();

    // Handle brand assignments if provided
    let assignedBrands = [];
    if (brandIds && Array.isArray(brandIds) && brandIds.length > 0) {
      // Verify all brands exist
      const brands = await Brand.find({ _id: { $in: brandIds } });
      if (brands.length !== brandIds.length) {
        return next(new AppError('One or more brand IDs are invalid', 400));
      }

      // Create brand assignments
      const assignments = await Promise.all(
        brandIds.map(brandId =>
          BrandAssignment.create({
            brandId,
            dealerId: dealer._id,
            assignedBy: req.user._id,
          })
        )
      );

      // Get populated brand data
      assignedBrands = await BrandAssignment.find({ dealerId: dealer._id })
        .populate('brandId', 'name isActive');
    }

    res.status(201).json({
      success: true,
      message: 'Dealer created successfully',
      data: {
        dealer,
        assignedBrands: assignedBrands.map(a => a.brandId),
        totalAssignedBrands: assignedBrands.length,
        credentials: {
          email: user.email,
          temporaryPassword,
          message: email 
            ? 'Please share these credentials with the dealer. Password must be changed on first login.'
            : 'Auto-generated email used. Please update dealer email and share credentials. Password must be changed on first login.',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllDealers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { dealerCode: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { shopName: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const total = await Dealer.countDocuments(query);
    const dealers = await Dealer.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get brand counts for each dealer
    const dealersWithBrandCount = await Promise.all(
      dealers.map(async (dealer) => {
        const brandCount = await BrandAssignment.countDocuments({
          dealerId: dealer._id,
          isActive: true,
        });
        return {
          ...dealer.toObject(),
          totalAssignedBrands: brandCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: dealers.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: dealersWithBrandCount,
    });
  } catch (error) {
    next(error);
  }
};

exports.getDealerById = async (req, res, next) => {
  try {
    const dealer = await Dealer.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!dealer) {
      return next(new AppError('Dealer not found', 404));
    }

    const assets = await Asset.find({ dealerId: dealer._id, isDeleted: false })
      .select('fixtureNo assetNo brand status barcodeValue barcodeImagePath installationDate dimension standType location createdAt')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    const assetCount = assets.length;

    const assetsWithUrls = assets.map(asset => {
      const assetObj = asset.toObject();
      return assetObj;
    });

    // Get assigned brands
    const brandAssignments = await BrandAssignment.find({ dealerId: dealer._id })
      .populate('brandId', 'name isActive')
      .populate('assignedBy', 'name email');

    res.status(200).json({
      success: true,
      data: {
        dealer: dealer.toObject(),
        assetCount,
        assets: assetsWithUrls,
        assignedBrands: brandAssignments.map(a => ({
          brand: a.brandId,
          assignedBy: a.assignedBy,
          assignedAt: a.createdAt,
        })),
        totalAssignedBrands: brandAssignments.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateDealer = async (req, res, next) => {
  try {
    const { name, phone, shopName, vatRegistration, location, isActive, email, brandIds } = req.body;

    const dealer = await Dealer.findById(req.params.id);

    if (!dealer) {
      return next(new AppError('Dealer not found', 404));
    }

    if (email && email !== dealer.email) {
      const existingDealer = await Dealer.findOne({ email, _id: { $ne: dealer._id } });
      if (existingDealer) {
        return next(new AppError('Email already in use by another dealer', 400));
      }
    }

    if (vatRegistration && vatRegistration !== dealer.vatRegistration) {
      const existingVat = await Dealer.findOne({ vatRegistration, _id: { $ne: dealer._id } });
      if (existingVat) {
        return next(new AppError('VAT registration already in use', 400));
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (shopName) updateData.shopName = shopName;
    if (vatRegistration) updateData.vatRegistration = vatRegistration;
    if (location) updateData.location = location;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedDealer = await Dealer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (isActive !== undefined) {
      await User.findByIdAndUpdate(dealer.userId, { isActive });
    }

    // Handle brand assignments if provided
    let assignedBrands = [];
    if (brandIds !== undefined) {
      if (Array.isArray(brandIds)) {
        // Verify all brands exist
        if (brandIds.length > 0) {
          const brands = await Brand.find({ _id: { $in: brandIds } });
          if (brands.length !== brandIds.length) {
            return next(new AppError('One or more brand IDs are invalid', 400));
          }
        }

        // Deactivate all existing assignments for this dealer
        await BrandAssignment.updateMany(
          { dealerId: dealer._id, isActive: true },
          { 
            isActive: false, 
            unassignedBy: req.user._id,
            unassignedAt: new Date(),
          }
        );

        // Create new assignments
        if (brandIds.length > 0) {
          await Promise.all(
            brandIds.map(async (brandId) => {
              // Check if assignment already exists (was deactivated)
              const existing = await BrandAssignment.findOne({ brandId, dealerId: dealer._id });
              if (existing) {
                // Reactivate existing assignment
                existing.isActive = true;
                existing.assignedBy = req.user._id;
                existing.unassignedBy = undefined;
                existing.unassignedAt = undefined;
                await existing.save();
              } else {
                // Create new assignment
                await BrandAssignment.create({
                  brandId,
                  dealerId: dealer._id,
                  assignedBy: req.user._id,
                });
              }
            })
          );
        }
      }

      // Get current brand assignments
      assignedBrands = await BrandAssignment.find({ dealerId: dealer._id })
        .populate('brandId', 'name isActive');
    }

    const response = {
      success: true,
      message: 'Dealer updated successfully',
      data: updatedDealer,
    };

    if (brandIds !== undefined) {
      response.data = {
        ...updatedDealer.toObject(),
        assignedBrands: assignedBrands.map(a => a.brandId),
        totalAssignedBrands: assignedBrands.length,
      };
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

exports.deleteDealer = async (req, res, next) => {
  try {
    const dealer = await Dealer.findById(req.params.id);

    if (!dealer) {
      return next(new AppError('Dealer not found', 404));
    }

    const activeAssets = await Asset.countDocuments({ dealerId: dealer._id, status: 'ACTIVE' });
    
    if (activeAssets > 0) {
      return next(
        new AppError(`Cannot delete dealer with ${activeAssets} active assets. Please reassign or delete assets first.`, 400)
      );
    }

    dealer.isDeleted = true;
    await dealer.save();

    await User.findByIdAndUpdate(dealer.userId, { isDeleted: true, isActive: false });

    res.status(200).json({
      success: true,
      message: 'Dealer deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleDealerStatus = async (req, res, next) => {
  try {
    const dealer = await Dealer.findById(req.params.id);

    if (!dealer) {
      return next(new AppError('Dealer not found', 404));
    }

    dealer.isActive = !dealer.isActive;
    await dealer.save();

    await User.findByIdAndUpdate(dealer.userId, { isActive: dealer.isActive });

    res.status(200).json({
      success: true,
      message: `Dealer ${dealer.isActive ? 'activated' : 'deactivated'} successfully`,
      data: dealer,
    });
  } catch (error) {
    next(error);
  }
};

exports.resetDealerPassword = async (req, res, next) => {
  try {
    const dealer = await Dealer.findById(req.params.id);

    if (!dealer) {
      return next(new AppError('Dealer not found', 404));
    }

    const temporaryPassword = generateTemporaryPassword();

    const user = await User.findById(dealer.userId);
    user.password = temporaryPassword;
    user.isTemporaryPassword = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      data: {
        email: user.email,
        temporaryPassword,
        message: 'Please share this temporary password with the dealer.',
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getDealerStats = async (req, res, next) => {
  try {
    const dealerId = req.user.role === 'DEALER' ? req.user.dealerRef : req.params.id;

    const dealer = await Dealer.findById(dealerId);
    if (!dealer) {
      return next(new AppError('Dealer not found', 404));
    }

    const totalAssets = await Asset.countDocuments({ dealerId });
    const activeAssets = await Asset.countDocuments({ dealerId, status: 'ACTIVE' });
    const inactiveAssets = await Asset.countDocuments({ dealerId, status: 'INACTIVE' });
    const maintenanceAssets = await Asset.countDocuments({ dealerId, status: 'MAINTENANCE' });
    const damagedAssets = await Asset.countDocuments({ dealerId, status: 'DAMAGED' });

    const recentAssets = await Asset.find({ dealerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fixtureNo assetNo brand status createdAt');

    res.status(200).json({
      success: true,
      data: {
        dealer,
        statistics: {
          totalAssets,
          activeAssets,
          inactiveAssets,
          maintenanceAssets,
          damagedAssets,
        },
        recentAssets,
      },
    });
  } catch (error) {
    next(error);
  }
};
