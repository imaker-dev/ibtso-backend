const Dealer = require('../models/Dealer');
const User = require('../models/User');
const Asset = require('../models/Asset');
const { generateTemporaryPassword, generateDealerCode } = require('../utils/generatePassword');
const { AppError } = require('../middleware/errorHandler');

exports.createDealer = async (req, res, next) => {
  try {
    const { name, phone, email, shopName, vatRegistration, location } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    const existingDealer = await Dealer.findOne({ 
      $or: [{ email }, { vatRegistration }] 
    }).lean();
    
    if (existingDealer) {
      return next(new AppError('Dealer with this email or VAT registration already exists', 400));
    }

    const temporaryPassword = generateTemporaryPassword();
    const dealerCode = generateDealerCode(name);

    const user = await User.create({
      name,
      email,
      password: temporaryPassword,
      role: 'DEALER',
      isTemporaryPassword: true,
    });

    const dealer = await Dealer.create({
      dealerCode,
      name,
      phone,
      email,
      shopName,
      vatRegistration,
      location: {
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        googleMapLink: location.googleMapLink || `https://maps.google.com/?q=${location.latitude},${location.longitude}`,
      },
      userId: user._id,
      createdBy: req.user._id,
    });

    user.dealerRef = dealer._id;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Dealer created successfully',
      data: {
        dealer,
        credentials: {
          email: user.email,
          temporaryPassword,
          message: 'Please share these credentials with the dealer. Password must be changed on first login.',
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

    res.status(200).json({
      success: true,
      count: dealers.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: dealers,
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
      .select('fixtureNo assetNo brand status barcodeValue barcodeImageUrl installationDate dimension standType location createdAt')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    const assetCount = assets.length;

    res.status(200).json({
      success: true,
      data: {
        dealer: dealer.toObject(),
        assetCount,
        assets,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateDealer = async (req, res, next) => {
  try {
    const { name, phone, shopName, vatRegistration, location, isActive } = req.body;

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

    res.status(200).json({
      success: true,
      message: 'Dealer updated successfully',
      data: updatedDealer,
    });
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
