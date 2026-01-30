const mongoose = require('mongoose');
const { sequelize, User, Dealer, Asset } = require('./models-postgres');
require('dotenv').config();

const MongoUser = require('./models/User');
const MongoDealer = require('./models/Dealer');
const MongoAsset = require('./models/Asset');

const idMap = new Map();

async function connectMongoDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    throw error;
  }
}

async function connectPostgreSQL() {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected');
    
    await sequelize.sync({ force: true });
    console.log('✅ PostgreSQL Tables Created (force sync)');
  } catch (error) {
    console.error('❌ PostgreSQL Connection Error:', error.message);
    throw error;
  }
}

async function migrateUsers() {
  console.log('\n📦 Migrating Users...');
  
  const mongoUsers = await MongoUser.find({}).select('+password');
  console.log(`   Found ${mongoUsers.length} users in MongoDB`);
  
  let migratedCount = 0;
  
  for (const mongoUser of mongoUsers) {
    try {
      const postgresUser = await User.create({
        name: mongoUser.name,
        email: mongoUser.email,
        password: mongoUser.password,
        role: mongoUser.role,
        isActive: mongoUser.isActive,
        isDeleted: mongoUser.isDeleted,
        lastLogin: mongoUser.lastLogin,
        passwordChangedAt: mongoUser.passwordChangedAt,
        isTemporaryPassword: mongoUser.isTemporaryPassword,
        createdAt: mongoUser.createdAt,
        updatedAt: mongoUser.updatedAt
      }, {
        hooks: false
      });
      
      idMap.set(mongoUser._id.toString(), postgresUser.id);
      migratedCount++;
      
      process.stdout.write(`\r   Migrated: ${migratedCount}/${mongoUsers.length}`);
    } catch (error) {
      console.error(`\n   ❌ Error migrating user ${mongoUser.email}:`, error.message);
    }
  }
  
  console.log(`\n✅ Users migrated: ${migratedCount}/${mongoUsers.length}`);
}

async function migrateDealers() {
  console.log('\n📦 Migrating Dealers...');
  
  const mongoDealers = await MongoDealer.find({});
  console.log(`   Found ${mongoDealers.length} dealers in MongoDB`);
  
  let migratedCount = 0;
  
  for (const mongoDealer of mongoDealers) {
    try {
      const postgresDealer = await Dealer.create({
        dealerCode: mongoDealer.dealerCode,
        name: mongoDealer.name,
        phone: mongoDealer.phone,
        email: mongoDealer.email,
        shopName: mongoDealer.shopName,
        vatRegistration: mongoDealer.vatRegistration,
        location: {
          address: mongoDealer.location.address,
          latitude: mongoDealer.location.latitude,
          longitude: mongoDealer.location.longitude,
          googleMapLink: mongoDealer.location.googleMapLink || ''
        },
        userId: idMap.get(mongoDealer.userId.toString()),
        isActive: mongoDealer.isActive,
        isDeleted: mongoDealer.isDeleted,
        createdBy: idMap.get(mongoDealer.createdBy.toString()),
        createdAt: mongoDealer.createdAt,
        updatedAt: mongoDealer.updatedAt
      });
      
      idMap.set(mongoDealer._id.toString(), postgresDealer.id);
      migratedCount++;
      
      process.stdout.write(`\r   Migrated: ${migratedCount}/${mongoDealers.length}`);
    } catch (error) {
      console.error(`\n   ❌ Error migrating dealer ${mongoDealer.dealerCode}:`, error.message);
    }
  }
  
  console.log(`\n✅ Dealers migrated: ${migratedCount}/${mongoDealers.length}`);
}

async function updateUserDealerRefs() {
  console.log('\n🔗 Updating User dealer references...');
  
  const mongoUsers = await MongoUser.find({ dealerRef: { $ne: null } });
  
  let updatedCount = 0;
  
  for (const mongoUser of mongoUsers) {
    try {
      const postgresUserId = idMap.get(mongoUser._id.toString());
      const postgresDealerId = idMap.get(mongoUser.dealerRef.toString());
      
      if (postgresUserId && postgresDealerId) {
        await User.update(
          { dealerRef: postgresDealerId },
          { where: { id: postgresUserId } }
        );
        updatedCount++;
      }
    } catch (error) {
      console.error(`   ❌ Error updating user dealer ref:`, error.message);
    }
  }
  
  console.log(`✅ User dealer references updated: ${updatedCount}`);
}

async function migrateAssets() {
  console.log('\n📦 Migrating Assets...');
  
  const mongoAssets = await MongoAsset.find({});
  console.log(`   Found ${mongoAssets.length} assets in MongoDB`);
  
  let migratedCount = 0;
  
  for (const mongoAsset of mongoAssets) {
    try {
      await Asset.create({
        fixtureNo: mongoAsset.fixtureNo,
        assetNo: mongoAsset.assetNo,
        dimension: {
          length: mongoAsset.dimension.length,
          height: mongoAsset.dimension.height,
          depth: mongoAsset.dimension.depth,
          unit: mongoAsset.dimension.unit || 'cm'
        },
        standType: mongoAsset.standType,
        brand: mongoAsset.brand,
        dealerId: idMap.get(mongoAsset.dealerId.toString()),
        installationDate: mongoAsset.installationDate,
        location: {
          address: mongoAsset.location.address,
          latitude: mongoAsset.location.latitude,
          longitude: mongoAsset.location.longitude,
          googleMapLink: mongoAsset.location.googleMapLink || ''
        },
        barcodeValue: mongoAsset.barcodeValue,
        barcodeImagePath: mongoAsset.barcodeImagePath,
        status: mongoAsset.status,
        isDeleted: mongoAsset.isDeleted,
        createdBy: idMap.get(mongoAsset.createdBy.toString()),
        updatedBy: mongoAsset.updatedBy ? idMap.get(mongoAsset.updatedBy.toString()) : null,
        createdAt: mongoAsset.createdAt,
        updatedAt: mongoAsset.updatedAt
      });
      
      migratedCount++;
      process.stdout.write(`\r   Migrated: ${migratedCount}/${mongoAssets.length}`);
    } catch (error) {
      console.error(`\n   ❌ Error migrating asset ${mongoAsset.assetNo}:`, error.message);
    }
  }
  
  console.log(`\n✅ Assets migrated: ${migratedCount}/${mongoAssets.length}`);
}

async function verifyMigration() {
  console.log('\n🔍 Verifying Migration...');
  
  const mongoUserCount = await MongoUser.countDocuments();
  const postgresUserCount = await User.count();
  console.log(`   Users: MongoDB=${mongoUserCount}, PostgreSQL=${postgresUserCount}`);
  
  const mongoDealerCount = await MongoDealer.countDocuments();
  const postgresDealerCount = await Dealer.count();
  console.log(`   Dealers: MongoDB=${mongoDealerCount}, PostgreSQL=${postgresDealerCount}`);
  
  const mongoAssetCount = await MongoAsset.countDocuments();
  const postgresAssetCount = await Asset.count();
  console.log(`   Assets: MongoDB=${mongoAssetCount}, PostgreSQL=${postgresAssetCount}`);
  
  const success = 
    mongoUserCount === postgresUserCount &&
    mongoDealerCount === postgresDealerCount &&
    mongoAssetCount === postgresAssetCount;
  
  if (success) {
    console.log('\n✅ Migration Verification: SUCCESS');
  } else {
    console.log('\n⚠️  Migration Verification: MISMATCH - Please review');
  }
  
  return success;
}

async function migrate() {
  console.log('🚀 Starting MongoDB to PostgreSQL Migration...\n');
  console.log('⚠️  WARNING: This will DROP and recreate all PostgreSQL tables!');
  console.log('   Press Ctrl+C within 5 seconds to cancel...\n');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  try {
    await connectMongoDB();
    await connectPostgreSQL();
    
    await migrateUsers();
    await migrateDealers();
    await updateUserDealerRefs();
    await migrateAssets();
    
    const verified = await verifyMigration();
    
    if (verified) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('\n📝 Next Steps:');
      console.log('   1. Test API endpoints');
      console.log('   2. Update server.js to use PostgreSQL connection');
      console.log('   3. Update controllers to use Sequelize models');
      console.log('   4. Keep MongoDB backup for safety\n');
    } else {
      console.log('\n⚠️  Migration completed with warnings. Please review the data.');
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    await sequelize.close();
    console.log('\n🔌 Database connections closed');
  }
}

migrate()
  .then(() => {
    console.log('✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
