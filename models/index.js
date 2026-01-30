const { sequelize } = require('../config/database');
const User = require('./User');
const Dealer = require('./Dealer');
const Asset = require('./Asset');

// Define relationships
User.hasOne(Dealer, {
  foreignKey: 'userId',
  as: 'dealer'
});

Dealer.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Dealer.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

User.hasMany(Dealer, {
  foreignKey: 'createdBy',
  as: 'createdDealers'
});

Dealer.hasMany(Asset, {
  foreignKey: 'dealerId',
  as: 'assets'
});

Asset.belongsTo(Dealer, {
  foreignKey: 'dealerId',
  as: 'dealer'
});

Asset.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

Asset.belongsTo(User, {
  foreignKey: 'updatedBy',
  as: 'updater'
});

User.hasMany(Asset, {
  foreignKey: 'createdBy',
  as: 'createdAssets'
});

User.hasMany(Asset, {
  foreignKey: 'updatedBy',
  as: 'updatedAssets'
});

module.exports = {
  sequelize,
  User,
  Dealer,
  Asset
};
