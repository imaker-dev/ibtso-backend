const { Asset, Dealer, User } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const { AppError } = require('../middleware/errorHandler');

exports.getAdminDashboard = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return next(new AppError('Only admins can access this dashboard', 403));
    }

    const totalDealers = await Dealer.count({ where: { isDeleted: false } });
    const activeDealers = await Dealer.count({ where: { isDeleted: false, isActive: true } });
    const inactiveDealers = await Dealer.count({ where: { isDeleted: false, isActive: false } });

    const totalAssets = await Asset.count({ where: { isDeleted: false } });
    const activeAssets = await Asset.count({ where: { isDeleted: false, status: 'ACTIVE' } });
    const inactiveAssets = await Asset.count({ where: { isDeleted: false, status: 'INACTIVE' } });
    const maintenanceAssets = await Asset.count({ where: { isDeleted: false, status: 'MAINTENANCE' } });
    const damagedAssets = await Asset.count({ where: { isDeleted: false, status: 'DAMAGED' } });

    const assetsByBrandRaw = await Asset.findAll({
      where: { isDeleted: false },
      attributes: [
        'brand',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['brand'],
      order: [[literal('"count"'), 'DESC']],
      limit: 10,
      raw: true
    });

    const assetsByBrand = assetsByBrandRaw.map(item => ({
      _id: item.brand,
      count: parseInt(item.count)
    }));

    const assetsByDealerRaw = await Asset.findAll({
      where: { isDeleted: false },
      attributes: [
        'dealerId',
        [fn('COUNT', col('Asset.id')), 'assetCount']
      ],
      include: [
        {
          model: Dealer,
          as: 'dealer',
          attributes: ['name', 'shopName', 'dealerCode']
        }
      ],
      group: ['dealerId', 'dealer.id'],
      order: [[literal('"assetCount"'), 'DESC']],
      limit: 10,
      raw: false
    });

    const assetsByDealer = assetsByDealerRaw.map(item => ({
      dealerName: item.dealer?.name,
      shopName: item.dealer?.shopName,
      dealerCode: item.dealer?.dealerCode,
      assetCount: parseInt(item.get('assetCount'))
    }));

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentAssets = await Asset.findAll({
      where: {
        isDeleted: false,
        created_at: { [Op.gte]: last30Days }
      },
      include: [
        { model: Dealer, as: 'dealer', attributes: ['name', 'shopName', 'dealerCode'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 10,
      attributes: ['fixtureNo', 'assetNo', 'brand', 'status', 'created_at']
    });

    const recentDealers = await Dealer.findAll({
      where: {
        isDeleted: false,
        created_at: { [Op.gte]: last30Days }
      },
      include: [
        { model: User, as: 'creator', attributes: ['name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 10,
      attributes: ['dealerCode', 'name', 'shopName', 'email', 'isActive', 'created_at']
    });

    const assetsCreatedPerMonthRaw = await Asset.findAll({
      where: { isDeleted: false },
      attributes: [
        [fn('EXTRACT', literal('YEAR FROM "created_at"')), 'year'],
        [fn('EXTRACT', literal('MONTH FROM "created_at"')), 'month'],
        [fn('COUNT', col('id')), 'count']
      ],
      group: [literal('year'), literal('month')],
      order: [[literal('"year"'), 'DESC'], [literal('"month"'), 'DESC']],
      limit: 12,
      raw: true
    });

    const assetsCreatedPerMonth = assetsCreatedPerMonthRaw.map(item => ({
      _id: {
        year: parseInt(item.year),
        month: parseInt(item.month)
      },
      count: parseInt(item.count)
    }));

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

    const dealerId = req.user.dealerRef || req.user.dealer_ref;

    const dealer = await Dealer.findByPk(dealerId);
    if (!dealer) {
      return next(new AppError('Dealer not found', 404));
    }

    const totalAssets = await Asset.count({ where: { dealerId, isDeleted: false } });
    const activeAssets = await Asset.count({ where: { dealerId, isDeleted: false, status: 'ACTIVE' } });
    const inactiveAssets = await Asset.count({ where: { dealerId, isDeleted: false, status: 'INACTIVE' } });
    const maintenanceAssets = await Asset.count({ where: { dealerId, isDeleted: false, status: 'MAINTENANCE' } });
    const damagedAssets = await Asset.count({ where: { dealerId, isDeleted: false, status: 'DAMAGED' } });

    const assetsByBrandRaw = await Asset.findAll({
      where: { dealerId, isDeleted: false },
      attributes: [
        'brand',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['brand'],
      order: [[literal('"count"'), 'DESC']],
      raw: true
    });

    const assetsByBrand = assetsByBrandRaw.map(item => ({
      _id: item.brand,
      count: parseInt(item.count)
    }));

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentAssets = await Asset.findAll({
      where: {
        dealerId,
        isDeleted: false,
        created_at: { [Op.gte]: last30Days }
      },
      order: [['created_at', 'DESC']],
      limit: 10,
      attributes: ['fixtureNo', 'assetNo', 'brand', 'status', 'barcodeValue', 'created_at']
    });

    const assetsCreatedPerMonthRaw = await Asset.findAll({
      where: { dealerId, isDeleted: false },
      attributes: [
        [fn('EXTRACT', literal('YEAR FROM "created_at"')), 'year'],
        [fn('EXTRACT', literal('MONTH FROM "created_at"')), 'month'],
        [fn('COUNT', col('id')), 'count']
      ],
      group: [literal('year'), literal('month')],
      order: [[literal('"year"'), 'DESC'], [literal('"month"'), 'DESC']],
      limit: 12,
      raw: true
    });

    const assetsCreatedPerMonth = assetsCreatedPerMonthRaw.map(item => ({
      _id: {
        year: parseInt(item.year),
        month: parseInt(item.month)
      },
      count: parseInt(item.count)
    }));

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

    const totalUsers = await User.count({ where: { isDeleted: false } });
    const activeUsers = await User.count({ where: { isDeleted: false, isActive: true } });
    const adminUsers = await User.count({ where: { isDeleted: false, role: 'ADMIN' } });
    const dealerUsers = await User.count({ where: { isDeleted: false, role: 'DEALER' } });

    const totalDealers = await Dealer.count({ where: { isDeleted: false } });
    const totalAssets = await Asset.count({ where: { isDeleted: false } });

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
