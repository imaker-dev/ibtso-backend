// OLD SEQUELIZE SCRIPT - Use reset-database-mongodb.js instead
const User = require('./models/User');
const Dealer = require('./models/Dealer');
const Asset = require('./models/Asset');
require('dotenv').config();

async function resetDatabase() {
  console.log('🔄 Starting Database Reset...\n');
  
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL\n');

    // IMPORTANT:
    // Truncating individual tables can fail due to FK constraints.
    // The safest clean reset is: drop all tables (cascade) -> recreate schema via sync(force).
    console.log('� Dropping all tables (CASCADE)...');
    await sequelize.drop({ cascade: true });
    console.log('   ✅ All tables dropped\n');

    console.log('🏗️  Recreating tables...');
    await sequelize.sync({ force: true });
    console.log('   ✅ Tables recreated\n');

    // Always recreate admin from .env (old tokens will be invalid after reset)
    console.log('📝 Creating admin user from .env...');
    await User.create({
      name: process.env.DEFAULT_ADMIN_NAME || 'IBTSO Admin',
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@ibtso.com',
      password: process.env.DEFAULT_ADMIN_PASSWORD || 'ibtso@$2026',
      role: 'ADMIN',
      isActive: true,
    });
    console.log('   ✅ Admin user created\n');

    // Verify final state
    console.log('📊 Final Database State:');
    const totalUsers = await User.count();
    const totalDealers = await Dealer.count();
    const totalAssets = await Asset.count();
    
    console.log(`   Users: ${totalUsers}`);
    console.log(`   Dealers: ${totalDealers}`);
    console.log(`   Assets: ${totalAssets}\n`);

    // Show admin details
    const admin = await User.findOne({
      where: { role: 'ADMIN' },
      attributes: ['id', 'name', 'email', 'role', 'isActive']
    });
    
    if (admin) {
      console.log('👤 Admin Account:');
      console.log(`   ID: ${admin.id}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Active: ${admin.isActive}\n`);
    }

    console.log('✅ Database reset completed successfully!\n');
    console.log('📝 Next Steps:');
    console.log('   1. Restart your server: npm run dev');
    console.log('   2. Login as admin to get NEW token (old tokens will not work):');
    console.log('      POST /api/v1/auth/login');
    console.log('      { "email": "admin@ibtso.com", "password": "ibtso@$2026" }\n');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the reset
resetDatabase()
  .then(() => {
    console.log('\n✅ Reset script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Reset script failed:', error);
    process.exit(1);
  });
