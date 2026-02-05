const Asset = require('../models/Asset');
const Client = require('../models/Client');
const Brand = require('../models/Brand');
const { AppError } = require('../middleware/errorHandler');

// Get all assets for the logged-in client
exports.getClientAssets = async (req, res, next) => {
  try {
    if (req.user.role !== 'CLIENT') {
      return next(new AppError('Only clients can access their assets', 403));
    }

    const clientId = req.user.clientRef;
    const client = await Client.findById(clientId);
    if (!client) {
      return next(new AppError('Client not found', 404));
    }

    // Get all dealer IDs for this client
    const dealerIds = client.dealerIds;

    // Build query
    const query = { 
      dealerId: { $in: dealerIds }, 
      isDeleted: false 
    };

    // Add search filter
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { assetNo: searchRegex },
        { fixtureNo: searchRegex },
        { barcodeValue: searchRegex }
      ];
    }

    // Add status filter
    if (req.query.status) {
      query.status = req.query.status.toUpperCase();
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Asset.countDocuments(query);

    // Get assets with pagination
    const assets = await Asset.find(query)
      .populate('brandId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('assetNo fixtureNo barcodeValue status brandId installationDate createdAt updatedAt')
      .lean();

    // Format response
    const formattedAssets = assets.map(asset => ({
      _id: asset._id,
      name: asset.assetNo || asset.fixtureNo,
      qrCode: asset.barcodeValue,
      status: asset.status.toLowerCase(),
      brand: asset.brandId ? {
        _id: asset.brandId._id,
        name: asset.brandId.name
      } : null,
      assignedDate: asset.installationDate || asset.createdAt,
      lastScanned: asset.updatedAt,
      createdAt: asset.createdAt
    }));

    res.status(200).json({
      success: true,
      data: {
        assets: formattedAssets,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
