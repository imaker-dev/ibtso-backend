const Asset = require('../models/Asset');
const Dealer = require('../models/Dealer');
const Client = require('../models/Client');
const Brand = require('../models/Brand');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const { 
  generateBarcodeValue, 
  generateBarcodeImage,
  checkBarcodeUniqueness 
} = require('../services/barcodeService');
const fs = require('fs');
const path = require('path');

// Helper function to convert image paths to full URLs
const getImageUrls = (images) => {
  const appUrl = process.env.APP_URL || 'http://localhost:5000';
  return images.map(img => `${appUrl}/${img.replace(/\\/g, '/')}`);
};

exports.createAsset = async (req, res, next) => {
  try {
    const {
      fixtureNo,
      assetNo,
      dimension,
      standType,
      brandId,
      dealerId,
      clientId,
      installationDate,
      status,
    } = req.body;

    // Parse dimension if it's a string (from FormData)
    let parsedDimension = dimension;
    if (typeof dimension === 'string') {
      try {
        parsedDimension = JSON.parse(dimension);
      } catch (e) {
        return next(new AppError('Invalid dimension format', 400));
      }
    }

    // Verify dealer exists
    const dealer = await Dealer.findById(dealerId);
    if (!dealer) {
      return next(new AppError('Dealer not found', 404));
    }

    if (!dealer.isActive) {
      return next(new AppError('Cannot create asset for inactive dealer', 400));
    }

    // Verify brand exists
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return next(new AppError('Brand not found', 404));
    }

    // Verify client exists if provided
    if (clientId) {
      const client = await Client.findById(clientId);
      if (!client) {
        return next(new AppError('Client not found', 404));
      }
    }

    const existingAsset = await Asset.findOne({ assetNo });
    if (existingAsset) {
      return next(new AppError('Asset number already exists', 400));
    }

    const duplicateFixture = await Asset.findOne({ fixtureNo, dealerId });
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

    const barcodeImage = await generateBarcodeImage(barcodeValue, assetNo, dealer.dealerCode);

    // Always use dealer's location for the asset
    const assetLocation = {
      address: dealer.location.address,
      latitude: dealer.location.latitude,
      longitude: dealer.location.longitude,
      googleMapLink: dealer.location.googleMapLink,
    };

    // Handle uploaded images
    const imagePaths = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        imagePaths.push(file.path.replace(/\\/g, '/'));
      });
    }

    const assetData = {
      fixtureNo,
      assetNo,
      dimension: parsedDimension,
      standType,
      brandId,
      dealerId,
      installationDate: installDate,
      location: assetLocation,
      barcodeValue,
      barcodeImagePath: barcodeImage.relativePath,
      status: status || 'ACTIVE',
      createdBy: req.user._id || req.user.id,
      images: imagePaths,
    };

    if (clientId) {
      assetData.clientId = clientId;
    }

    const asset = await Asset.create(assetData);

    const populatedAsset = await Asset.findById(asset._id)
      .populate('dealerId', 'dealerCode name shopName email phone location')
      .populate('brandId', 'name isActive')
      .populate('clientId', 'name email phone company')
      .populate('createdBy', 'name email');

    const responseData = populatedAsset.toObject();
    responseData.imageUrls = getImageUrls(responseData.images || []);

    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: responseData,
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
        { barcodeValue: { $regex: search, $options: 'i' } },
      ];
    }

    if (brand) {
      // Brand search by brandId if valid ObjectId, otherwise skip
      if (brand.match(/^[0-9a-fA-F]{24}$/)) {
        query.brandId = brand;
      }
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
      .populate('dealerId', 'dealerCode name shopName email phone location')
      .populate('brandId', 'name isActive')
      .populate('clientId', 'name email phone company')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const assetsWithUrls = assets.map(asset => {
      const assetData = asset.toObject();
      assetData.imageUrls = getImageUrls(assetData.images || []);
      return assetData;
    });

    res.status(200).json({
      success: true,
      count: assets.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: assetsWithUrls,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAssetById = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('dealerId', 'dealerCode name shopName email phone location vatRegistration')
      .populate('brandId', 'name isActive')
      .populate('clientId', 'name email phone company address vatin placeOfSupply country')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!asset) {
      return next(new AppError('Asset not found', 404));
    }

    if (req.user.role === 'DEALER' && asset.dealerId._id.toString() !== req.user.dealerRef.toString()) {
      return next(new AppError('You do not have permission to access this asset', 403));
    }

    const assetData = asset.toObject();
    assetData.imageUrls = getImageUrls(assetData.images || []);

    res.status(200).json({
      success: true,
      data: assetData,
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
      brandId,
      clientId,
      installationDate,
      status,
    } = req.body;

    // Parse dimension if it's a string (from FormData)
    let parsedDimension = dimension;
    if (dimension && typeof dimension === 'string') {
      try {
        parsedDimension = JSON.parse(dimension);
      } catch (e) {
        return next(new AppError('Invalid dimension format', 400));
      }
    }

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

    // Verify brand if provided
    if (brandId) {
      const brand = await Brand.findById(brandId);
      if (!brand) {
        return next(new AppError('Brand not found', 404));
      }
      asset.brandId = brandId;
    }

    // Verify client if provided
    if (clientId !== undefined) {
      if (clientId) {
        const client = await Client.findById(clientId);
        if (!client) {
          return next(new AppError('Client not found', 404));
        }
        asset.clientId = clientId;
      } else {
        asset.clientId = null;
      }
    }

    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      const newImagePaths = [];
      req.files.forEach(file => {
        newImagePaths.push(file.path.replace(/\\/g, '/'));
      });
      // Append new images to existing ones
      asset.images = [...asset.images, ...newImagePaths];
    }

    if (fixtureNo) asset.fixtureNo = fixtureNo;
    if (assetNo) asset.assetNo = assetNo;
    if (parsedDimension) asset.dimension = parsedDimension;
    if (standType) asset.standType = standType;
    if (status) asset.status = status;
    // Location is always synced from dealer, not updated directly
    
    asset.updatedBy = req.user._id;
    await asset.save();

    const updatedAsset = await Asset.findById(asset._id)
      .populate('dealerId', 'dealerCode name shopName email phone location')
      .populate('brandId', 'name isActive')
      .populate('clientId', 'name email phone company')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    const assetData = updatedAsset.toObject();
    assetData.imageUrls = getImageUrls(assetData.images || []);

    res.status(200).json({
      success: true,
      message: 'Asset updated successfully',
      data: assetData,
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
