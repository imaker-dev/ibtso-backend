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

    const dealer = await Dealer.findById(dealerId);
    if (!dealer) {
      return next(new AppError('Dealer not found', 404));
    }

    if (!dealer.isActive) {
      return next(new AppError('Cannot create asset for inactive dealer', 400));
    }

    if (req.user.role === 'DEALER' && req.user.dealerRef.toString() !== dealerId) {
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

    const query = {};

    if (req.user.role === 'DEALER') {
      query.dealerId = req.user.dealerRef;
    }

    if (dealerId && req.user.role === 'ADMIN') {
      query.dealerId = dealerId;
    }

    if (search) {
      query.$or = [
        { fixtureNo: { $regex: search, $options: 'i' } },
        { assetNo: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { barcodeValue: { $regex: search, $options: 'i' } },
      ];
    }

    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.installationDate = {};
      if (startDate) query.installationDate.$gte = new Date(startDate);
      if (endDate) query.installationDate.$lte = new Date(endDate);
    }

    const total = await Asset.countDocuments(query);
    const assets = await Asset.find(query)
      .populate('dealerId', 'dealerCode name shopName email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

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
    const asset = await Asset.findById(req.params.id)
      .populate('dealerId', 'dealerCode name shopName email phone location')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!asset) {
      return next(new AppError('Asset not found', 404));
    }

    if (req.user.role === 'DEALER' && asset.dealerId._id.toString() !== req.user.dealerRef.toString()) {
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
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return next(new AppError('Asset not found', 404));
    }

    if (req.user.role === 'DEALER' && asset.dealerId.toString() !== req.user.dealerRef.toString()) {
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
      const existingAsset = await Asset.findOne({ assetNo, _id: { $ne: asset._id } });
      if (existingAsset) {
        return next(new AppError('Asset number already exists', 400));
      }
    }

    if (fixtureNo && fixtureNo !== asset.fixtureNo) {
      const duplicateFixture = await Asset.findOne({ 
        fixtureNo, 
        dealerId: asset.dealerId,
        _id: { $ne: asset._id }
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
    
    asset.updatedBy = req.user._id;
    await asset.save();

    const updatedAsset = await Asset.findById(asset._id)
      .populate('dealerId', 'dealerCode name shopName')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

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
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return next(new AppError('Asset not found', 404));
    }

    if (req.user.role === 'DEALER') {
      return next(new AppError('Dealers cannot delete assets. Please contact admin.', 403));
    }

    asset.isDeleted = true;
    asset.updatedBy = req.user._id;
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

    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return next(new AppError('Asset not found', 404));
    }

    if (req.user.role === 'DEALER' && asset.dealerId.toString() !== req.user.dealerRef.toString()) {
      return next(new AppError('You can only update your own assets', 403));
    }

    asset.status = status;
    asset.updatedBy = req.user._id;
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

    if (req.user.role === 'DEALER' && req.user.dealerRef.toString() !== dealerId) {
      return next(new AppError('You can only view your own assets', 403));
    }

    const dealer = await Dealer.findById(dealerId);
    if (!dealer) {
      return next(new AppError('Dealer not found', 404));
    }

    const total = await Asset.countDocuments({ dealerId });
    const assets = await Asset.find({ dealerId })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

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
    const query = {};
    
    if (req.user.role === 'DEALER') {
      query.dealerId = req.user.dealerRef;
    }

    const brands = await Asset.distinct('brand', query);

    res.status(200).json({
      success: true,
      count: brands.length,
      data: brands.sort(),
    });
  } catch (error) {
    next(error);
  }
};
