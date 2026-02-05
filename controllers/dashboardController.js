const Asset = require('../models/Asset');
const Dealer = require('../models/Dealer');
const Client = require('../models/Client');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

exports.getAdminDashboard = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return next(new AppError('Only admins can access this dashboard', 403));
    }

    const totalDealers = await Dealer.countDocuments({ isDeleted: false });
    const activeDealers = await Dealer.countDocuments({ isDeleted: false, isActive: true });
    const inactiveDealers = await Dealer.countDocuments({ isDeleted: false, isActive: false });

    const totalAssets = await Asset.countDocuments({ isDeleted: false });
    const activeAssets = await Asset.countDocuments({ isDeleted: false, status: 'ACTIVE' });
    const inactiveAssets = await Asset.countDocuments({ isDeleted: false, status: 'INACTIVE' });
    const maintenanceAssets = await Asset.countDocuments({ isDeleted: false, status: 'MAINTENANCE' });
    const damagedAssets = await Asset.countDocuments({ isDeleted: false, status: 'DAMAGED' });

    const assetsByBrand = await Asset.aggregate([
      { $match: { isDeleted: false } },
      { 
        $group: { 
          _id: '$brand', 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const assetsByDealer = await Asset.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$dealerId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'dealers',
          localField: '_id',
          foreignField: '_id',
          as: 'dealer'
        }
      },
      { $unwind: '$dealer' },
      {
        $project: {
          dealerName: '$dealer.name',
          shopName: '$dealer.shopName',
          dealerCode: '$dealer.dealerCode',
          assetCount: '$count'
        }
      }
    ]);

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentAssets = await Asset.find({ 
      isDeleted: false,
      createdAt: { $gte: last30Days }
    })
      .populate('dealerId', 'name shopName dealerCode')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('fixtureNo assetNo brand status createdAt');

    const recentDealers = await Dealer.find({ 
      isDeleted: false,
      createdAt: { $gte: last30Days }
    })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('dealerCode name shopName email isActive createdAt');

    const assetsCreatedPerMonth = await Asset.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        dealers: {
          total: totalDealers,
          active: activeDealers,
          inactive: inactiveDealers,
        },
        assets: {
          total: totalAssets,
          active: activeAssets,
          inactive: inactiveAssets,
          maintenance: maintenanceAssets,
          damaged: damagedAssets,
        },
        analytics: {
          assetsByBrand,
          assetsByDealer,
          assetsCreatedPerMonth,
        },
        recent: {
          assets: recentAssets,
          dealers: recentDealers,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getDealerDashboard = async (req, res, next) => {
  try {
    if (req.user.role !== 'DEALER') {
      return next(new AppError('Only dealers can access this dashboard', 403));
    }

    const dealerId = req.user.dealerRef;

    const dealer = await Dealer.findById(dealerId);
    if (!dealer) {
      return next(new AppError('Dealer not found', 404));
    }

    const totalAssets = await Asset.countDocuments({ dealerId, isDeleted: false });
    const activeAssets = await Asset.countDocuments({ dealerId, isDeleted: false, status: 'ACTIVE' });
    const inactiveAssets = await Asset.countDocuments({ dealerId, isDeleted: false, status: 'INACTIVE' });
    const maintenanceAssets = await Asset.countDocuments({ dealerId, isDeleted: false, status: 'MAINTENANCE' });
    const damagedAssets = await Asset.countDocuments({ dealerId, isDeleted: false, status: 'DAMAGED' });

    const assetsByBrand = await Asset.aggregate([
      { $match: { dealerId: dealer._id, isDeleted: false } },
      { 
        $group: { 
          _id: '$brand', 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } }
    ]);

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentAssets = await Asset.find({ 
      dealerId,
      isDeleted: false,
      createdAt: { $gte: last30Days }
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('fixtureNo assetNo brand status barcodeValue createdAt');

    const assetsCreatedPerMonth = await Asset.aggregate([
      { $match: { dealerId: dealer._id, isDeleted: false } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        dealer: {
          dealerCode: dealer.dealerCode,
          name: dealer.name,
          shopName: dealer.shopName,
          location: dealer.location,
        },
        assets: {
          total: totalAssets,
          active: activeAssets,
          inactive: inactiveAssets,
          maintenance: maintenanceAssets,
          damaged: damagedAssets,
        },
        analytics: {
          assetsByBrand,
          assetsCreatedPerMonth,
        },
        recentAssets,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getSystemStats = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return next(new AppError('Only admins can access system stats', 403));
    }

    const totalUsers = await User.countDocuments({ isDeleted: false });
    const activeUsers = await User.countDocuments({ isDeleted: false, isActive: true });
    const adminUsers = await User.countDocuments({ isDeleted: false, role: 'ADMIN' });
    const dealerUsers = await User.countDocuments({ isDeleted: false, role: 'DEALER' });

    const totalDealers = await Dealer.countDocuments({ isDeleted: false });
    const totalAssets = await Asset.countDocuments({ isDeleted: false });

    const dbStats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        admins: adminUsers,
        dealers: dealerUsers,
      },
      entities: {
        dealers: totalDealers,
        assets: totalAssets,
      },
      systemHealth: {
        status: 'operational',
        timestamp: new Date(),
      }
    };

    res.status(200).json({
      success: true,
      data: dbStats,
    });
  } catch (error) {
    next(error);
  }
};

// Client Dashboard Stats
exports.getClientDashboard = async (req, res, next) => {
  try {
    if (req.user.role !== 'CLIENT') {
      return next(new AppError('Only clients can access this dashboard', 403));
    }

    const clientId = req.user.clientRef;
    const client = await Client.findById(clientId);
    if (!client) {
      return next(new AppError('Client not found', 404));
    }

    // Get all dealer IDs for this client
    const dealerIds = client.dealerIds;

    // Asset statistics
    const totalAssets = await Asset.countDocuments({ 
      dealerId: { $in: dealerIds }, 
      isDeleted: false 
    });
    const activeAssets = await Asset.countDocuments({ 
      dealerId: { $in: dealerIds }, 
      isDeleted: false, 
      status: 'ACTIVE' 
    });
    const maintenanceAssets = await Asset.countDocuments({ 
      dealerId: { $in: dealerIds }, 
      isDeleted: false, 
      status: 'MAINTENANCE' 
    });
    const inactiveAssets = await Asset.countDocuments({ 
      dealerId: { $in: dealerIds }, 
      isDeleted: false, 
      status: 'INACTIVE' 
    });

    // Calculate profile completion percentage
    let profileFields = ['name', 'email', 'phone', 'company', 'address'];
    let completedFields = 0;
    profileFields.forEach(field => {
      if (client[field] && client[field].toString().trim() !== '') {
        completedFields++;
      }
    });
    const completionPercentage = Math.round((completedFields / profileFields.length) * 100);

    // Recent activity (recently updated assets)
    const recentActivity = await Asset.find({ 
      dealerId: { $in: dealerIds }, 
      isDeleted: false 
    })
      .select('fixtureNo assetNo status updatedAt')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    const recentActivityFormatted = recentActivity.map(asset => ({
      _id: asset._id,
      name: asset.assetNo || asset.fixtureNo,
      status: asset.status.toLowerCase(),
      updatedAt: asset.updatedAt
    }));

    res.status(200).json({
      success: true,
      data: {
        assets: {
          total: totalAssets,
          active: activeAssets,
          maintenance: maintenanceAssets,
          inactive: inactiveAssets
        },
        profile: {
          completionPercentage,
          lastLogin: req.user.lastLogin
        },
        recentActivity: recentActivityFormatted
      }
    });
  } catch (error) {
    next(error);
  }
};
