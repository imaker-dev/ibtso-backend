const { Dealer, User, Asset } = require('../models');
const { Op } = require('sequelize');
const { generateTemporaryPassword, generateDealerCode } = require('../utils/generatePassword');
const { AppError } = require('../middleware/errorHandler');

exports.createDealer = async (req, res, next) => {
  try {
    const { name, phone, email, shopName, vatRegistration, location } = req.body;

    const existingUser = await User.findOne({ 
      where: { 
        email,
        isDeleted: false 
      } 
    });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    const existingDealer = await Dealer.findOne({ 
      where: {
        [Op.or]: [{ email }, { vatRegistration }],
        isDeleted: false
      }
    });
    
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
        latitude: location.latitude || 0,
        longitude: location.longitude || 0,
        googleMapLink: location.googleMapLink || (location.latitude && location.longitude ? `https://maps.google.com/?q=${location.latitude},${location.longitude}` : ''),
      },
      userId: user.id,
      createdBy: req.user.id,
    });

    user.dealerRef = dealer.id;
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

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { dealerCode: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { shopName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const total = await Dealer.count({ where });
    const dealers = await Dealer.findAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['name', 'email'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

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
    const dealer = await Dealer.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['name', 'email'] }
      ]
    });

    if (!dealer) {
      return next(new AppError('Dealer not found', 404));
    }

    const assets = await Asset.findAll({
      where: { dealerId: dealer.id, isDeleted: false },
      attributes: ['fixtureNo', 'assetNo', 'brand', 'status', 'barcodeValue', 'barcodeImagePath', 'installationDate', 'dimension', 'standType', 'location', 'created_at'],
      include: [
        { model: User, as: 'creator', attributes: ['name', 'email'] }
      ],
      order: [['created_at', 'DESC']]
    });

    const assetCount = assets.length;

    res.status(200).json({
      success: true,
      data: {
        dealer,
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
    const { name, phone, email, shopName, vatRegistration, location, isActive } = req.body;

    const dealer = await Dealer.findByPk(req.params.id);

    if (!dealer) {
      return next(new AppError('Dealer not found', 404));
    }

    if (email && email !== dealer.email) {
      const existingDealer = await Dealer.findOne({ 
        where: { 
          email,
          id: { [Op.ne]: dealer.id }
        } 
      });
      if (existingDealer) {
        return next(new AppError('Email already in use by another dealer', 400));
      }
    }

    if (vatRegistration && vatRegistration !== dealer.vatRegistration) {
      const existingVat = await Dealer.findOne({ 
        where: {
          vatRegistration,
          id: { [Op.ne]: dealer.id }
        }
      });
      if (existingVat) {
        return next(new AppError('VAT registration already in use', 400));
      }
    }

    if (name) dealer.name = name;
    if (phone) dealer.phone = phone;
    if (email) dealer.email = email;
    if (shopName) dealer.shopName = shopName;
    if (vatRegistration) dealer.vatRegistration = vatRegistration;
    if (location) dealer.location = location;
    if (isActive !== undefined) dealer.isActive = isActive;

    await dealer.save();

    if (isActive !== undefined) {
      await User.update(
        { isActive },
        { where: { id: dealer.userId } }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Dealer updated successfully',
      data: dealer,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteDealer = async (req, res, next) => {
  try {
    const dealer = await Dealer.findByPk(req.params.id);

    if (!dealer) {
      return next(new AppError('Dealer not found', 404));
    }

    const activeAssets = await Asset.count({ 
      where: { 
        dealerId: dealer.id,
        status: 'ACTIVE'
      } 
    });
    
    if (activeAssets > 0) {
      return next(
        new AppError(`Cannot delete dealer with ${activeAssets} active assets. Please reassign or delete assets first.`, 400)
      );
    }

    dealer.isDeleted = true;
    await dealer.save();

    await User.update(
      { isDeleted: true, isActive: false },
      { where: { id: dealer.userId } }
    );

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
    const dealer = await Dealer.findByPk(req.params.id);

    if (!dealer) {
      return next(new AppError('Dealer not found', 404));
    }

    dealer.isActive = !dealer.isActive;
    await dealer.save();

    await User.update(
      { isActive: dealer.isActive },
      { where: { id: dealer.userId } }
    );

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
    const dealer = await Dealer.findByPk(req.params.id);

    if (!dealer) {
      return next(new AppError('Dealer not found', 404));
    }

    const temporaryPassword = generateTemporaryPassword();

    const user = await User.findByPk(dealer.userId);
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
    const userDealerRef = req.user.dealerRef || req.user.dealer_ref;
    const dealerId = req.user.role === 'DEALER' ? userDealerRef : req.params.id;

    const dealer = await Dealer.findByPk(dealerId);
    if (!dealer) {
      return next(new AppError('Dealer not found', 404));
    }

    const totalAssets = await Asset.count({ where: { dealerId } });
    const activeAssets = await Asset.count({ where: { dealerId, status: 'ACTIVE' } });
    const inactiveAssets = await Asset.count({ where: { dealerId, status: 'INACTIVE' } });
    const maintenanceAssets = await Asset.count({ where: { dealerId, status: 'MAINTENANCE' } });
    const damagedAssets = await Asset.count({ where: { dealerId, status: 'DAMAGED' } });

    const recentAssets = await Asset.findAll({
      where: { dealerId },
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['fixtureNo', 'assetNo', 'brand', 'status', 'created_at']
    });

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
