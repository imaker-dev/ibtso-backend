const mongoose = require('mongoose');
const User = require('./models/User');
const Dealer = require('./models/Dealer');
const Asset = require('./models/Asset');
require('dotenv').config();

async function resetDatabase() {
  console.log('🔄 Starting MongoDB Database Reset...\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/asset_tracking', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Drop all collections
    console.log('💣 Dropping all collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      await mongoose.connection.db.dropCollection(collection.name);
      console.log(`   ✅ Dropped: ${collection.name}`);
    }
    console.log('\n');

    // Create admin user
    console.log('📝 Creating admin user from .env...');
    const adminUser = await User.create({
      name: process.env.DEFAULT_ADMIN_NAME || 'IBTSO Admin',
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@ibtso.com',
      password: process.env.DEFAULT_ADMIN_PASSWORD || 'ibtso@$2026',
      role: 'ADMIN',
      isActive: true,
    });
    console.log(`   ✅ Admin created: ${adminUser.email}\n`);

    // Verify database state
    console.log('📊 Final database state:');
    const userCount = await User.countDocuments();
    const dealerCount = await Dealer.countDocuments();
    const assetCount = await Asset.countDocuments();
    
    console.log(`   Users: ${userCount}`);
    console.log(`   Dealers: ${dealerCount}`);
    console.log(`   Assets: ${assetCount}\n`);

    console.log('✨ Database reset completed successfully!\n');
    console.log('🔐 Admin Credentials:');
    console.log(`   Email: ${process.env.DEFAULT_ADMIN_EMAIL || 'admin@ibtso.com'}`);
    console.log(`   Password: ${process.env.DEFAULT_ADMIN_PASSWORD || 'ibtso@$2026'}\n`);

    console.log('⚠️  IMPORTANT: All previous tokens are now invalid.');
    console.log('   You must login again to get a new token.\n');

  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

resetDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
