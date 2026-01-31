const { Asset, Dealer, User } = require('../models');
const { Op } = require('sequelize');
const { AppError } = require('../middleware/errorHandler');
const { 
  generateBarcodeValue, 
  generateBarcodeImage,
  checkBarcodeUniqueness 
} = require('../services/barcodeService');

exports.createAsset = async (req, res, next) => {
  try {
    const {
      fixtureNo,
      assetNo,
      dimension,
      standType,
      brand,
      dealerId,
      installationDate,
      location,
      status,
    } = req.body;

    const dealer = await Dealer.findByPk(dealerId);
    if (!dealer) {
      return next(new AppError('Dealer not found', 404));
    }

    if (!dealer.isActive) {
      return next(new AppError('Cannot create asset for inactive dealer', 400));
    }

    const userDealerRef = req.user.dealerRef || req.user.dealer_ref;
    if (req.user.role === 'DEALER' && userDealerRef !== dealerId) {
      return next(new AppError('You can only create assets for your own dealership', 403));
    }

    const existingAsset = await Asset.findOne({ where: { assetNo } });
    if (existingAsset) {
      return next(new AppError('Asset number already exists', 400));
    }

    const duplicateFixture = await Asset.findOne({ where: { fixtureNo, dealerId } });
    if (duplicateFixture) {
      return next(new AppError('Fixture number already exists for this dealer', 400));
    }

    const installDate = new Date(installationDate);
    if (installDate > new Date()) {
      return next(new AppError('Installation date cannot be in the future', 400));
    }

    let barcodeValue = generateBarcodeValue(dealer.dealerCode, fixtureNo);
    
    let isUnique = await checkBarcodeUniqueness(Asset, barcodeValue);
    let attempts = 0;
    while (!isUnique && attempts < 5) {
      barcodeValue = generateBarcodeValue(dealer.dealerCode, `${fixtureNo}-${attempts}`);
      isUnique = await checkBarcodeUniqueness(Asset, barcodeValue);
      attempts++;
    }

    if (!isUnique) {
      return next(new AppError('Failed to generate unique barcode. Please try again.', 500));
    }

    const barcodeImage = await generateBarcodeImage(barcodeValue, assetNo);

    const assetLocation = location || {
      address: dealer.location.address,
      latitude: dealer.location.latitude,
      longitude: dealer.location.longitude,
      googleMapLink: dealer.location.googleMapLink,
    };

    const asset = await Asset.create({
      fixtureNo,
      assetNo,
      dimension,
      standType,
      brand,
      dealerId,
      installationDate: installDate,
      location: assetLocation,
      barcodeValue,
      barcodeImagePath: barcodeImage.relativePath,
      status: status || 'ACTIVE',
      createdBy: req.user._id || req.user.id,
    });

    const populatedAsset = await Asset.findByPk(asset.id, {
      include: [
        { model: Dealer, as: 'dealer', attributes: ['dealerCode', 'name', 'shopName'] },
        { model: User, as: 'creator', attributes: ['name', 'email'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: populatedAsset,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllAssets = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      dealerId, 
      brand, 
      status,
      startDate,
      endDate 
    } = req.query;

    const where = {};

    const userDealerRef = req.user.dealerRef || req.user.dealer_ref;
    if (req.user.role === 'DEALER') {
      where.dealerId = userDealerRef;
    }

    if (dealerId && req.user.role === 'ADMIN') {
      where.dealerId = dealerId;
    }

    if (search) {
      where[Op.or] = [
        { fixtureNo: { [Op.iLike]: `%${search}%` } },
        { assetNo: { [Op.iLike]: `%${search}%` } },
        { brand: { [Op.iLike]: `%${search}%` } },
        { barcodeValue: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (brand) {
      where.brand = { [Op.iLike]: `%${brand}%` };
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.installationDate = {};
      if (startDate) where.installationDate[Op.gte] = new Date(startDate);
      if (endDate) where.installationDate[Op.lte] = new Date(endDate);
    }

    const total = await Asset.count({ where });
    const assets = await Asset.findAll({
      where,
      include: [
        { model: Dealer, as: 'dealer', attributes: ['dealerCode', 'name', 'shopName', 'email'] },
        { model: User, as: 'creator', attributes: ['name', 'email'] },
        { model: User, as: 'updater', attributes: ['name', 'email'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

    res.status(200).json({
      success: true,
      count: assets.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: assets,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAssetById = async (req, res, next) => {
  try {
    const asset = await Asset.findByPk(req.params.id, {
      include: [
        { model: Dealer, as: 'dealer', attributes: ['dealerCode', 'name', 'shopName', 'email', 'phone', 'location'] },
        { model: User, as: 'creator', attributes: ['name', 'email'] },
        { model: User, as: 'updater', attributes: ['name', 'email'] }
      ]
    });

    if (!asset) {
      return next(new AppError('Asset not found', 404));
    }

    const userDealerRef = req.user.dealerRef || req.user.dealer_ref;
    if (req.user.role === 'DEALER' && asset.dealerId !== userDealerRef) {
      return next(new AppError('You do not have permission to access this asset', 403));
    }

    res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findByPk(req.params.id);

    if (!asset) {
      return next(new AppError('Asset not found', 404));
    }

    const userDealerRef = req.user.dealerRef || req.user.dealer_ref;
    if (req.user.role === 'DEALER' && asset.dealerId !== userDealerRef) {
      return next(new AppError('You can only update your own assets', 403));
    }

    const {
      fixtureNo,
      assetNo,
      dimension,
      standType,
      brand,
      installationDate,
      location,
      status,
    } = req.body;

    if (assetNo && assetNo !== asset.assetNo) {
      const existingAsset = await Asset.findOne({ 
        where: { 
          assetNo,
          id: { [Op.ne]: asset.id }
        } 
      });
      if (existingAsset) {
        return next(new AppError('Asset number already exists', 400));
      }
    }

    if (fixtureNo && fixtureNo !== asset.fixtureNo) {
      const duplicateFixture = await Asset.findOne({ 
        where: {
          fixtureNo, 
          dealerId: asset.dealerId,
          id: { [Op.ne]: asset.id }
        }
      });
      if (duplicateFixture) {
        return next(new AppError('Fixture number already exists for this dealer', 400));
      }
    }

    if (installationDate) {
      const installDate = new Date(installationDate);
      if (installDate > new Date()) {
        return next(new AppError('Installation date cannot be in the future', 400));
      }
      asset.installationDate = installDate;
    }

    if (fixtureNo) asset.fixtureNo = fixtureNo;
    if (assetNo) asset.assetNo = assetNo;
    if (dimension) asset.dimension = dimension;
    if (standType) asset.standType = standType;
    if (brand) asset.brand = brand;
    if (location) asset.location = location;
    if (status) asset.status = status;
    
    asset.updatedBy = req.user._id || req.user.id;
    await asset.save();

    const updatedAsset = await Asset.findByPk(asset.id, {
      include: [
        { model: Dealer, as: 'dealer', attributes: ['dealerCode', 'name', 'shopName'] },
        { model: User, as: 'creator', attributes: ['name', 'email'] },
        { model: User, as: 'updater', attributes: ['name', 'email'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Asset updated successfully',
      data: updatedAsset,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findByPk(req.params.id);

    if (!asset) {
      return next(new AppError('Asset not found', 404));
    }

    if (req.user.role === 'DEALER') {
      return next(new AppError('Dealers cannot delete assets. Please contact admin.', 403));
    }

    asset.isDeleted = true;
    asset.updatedBy = req.user._id || req.user.id;
    await asset.save();

    res.status(200).json({
      success: true,
      message: 'Asset deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAssetStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DAMAGED'].includes(status)) {
      return next(new AppError('Invalid status value', 400));
    }

    const asset = await Asset.findByPk(req.params.id);

    if (!asset) {
      return next(new AppError('Asset not found', 404));
    }

    const userDealerRef = req.user.dealerRef || req.user.dealer_ref;
    if (req.user.role === 'DEALER' && asset.dealerId !== userDealerRef) {
      return next(new AppError('You can only update your own assets', 403));
    }

    asset.status = status;
    asset.updatedBy = req.user._id || req.user.id;
    await asset.save();

    res.status(200).json({
      success: true,
      message: 'Asset status updated successfully',
      data: asset,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAssetsByDealer = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const dealerId = req.params.dealerId;

    const userDealerRef = req.user.dealerRef || req.user.dealer_ref;
    if (req.user.role === 'DEALER' && userDealerRef !== dealerId) {
      return next(new AppError('You can only view your own assets', 403));
    }

    const dealer = await Dealer.findByPk(dealerId);
    if (!dealer) {
      return next(new AppError('Dealer not found', 404));
    }

    const total = await Asset.count({ where: { dealerId } });
    const assets = await Asset.findAll({
      where: { dealerId },
      include: [
        { model: User, as: 'creator', attributes: ['name', 'email'] },
        { model: User, as: 'updater', attributes: ['name', 'email'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

    res.status(200).json({
      success: true,
      count: assets.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      dealer: {
        dealerCode: dealer.dealerCode,
        name: dealer.name,
        shopName: dealer.shopName,
      },
      data: assets,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAssetBrands = async (req, res, next) => {
  try {
    const where = {};
    
    const userDealerRef = req.user.dealerRef || req.user.dealer_ref;
    if (req.user.role === 'DEALER') {
      where.dealerId = userDealerRef;
    }

    const assets = await Asset.findAll({
      where,
      attributes: [[Asset.sequelize.fn('DISTINCT', Asset.sequelize.col('brand')), 'brand']],
      raw: true
    });

    const brands = assets.map(a => a.brand).filter(Boolean).sort();

    res.status(200).json({
      success: true,
      count: brands.length,
      data: brands,
    });
  } catch (error) {
    next(error);
  }
};
