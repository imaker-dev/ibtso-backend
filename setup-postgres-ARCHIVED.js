const { sequelize } = require('./config/database-postgres');
require('dotenv').config();

async function setupDatabase() {
  console.log('🚀 PostgreSQL Database Setup\n');
  console.log('Database Configuration:');
  console.log(`   Host: ${process.env.POSTGRES_HOST || 'localhost'}`);
  console.log(`   Port: ${process.env.POSTGRES_PORT || 5432}`);
  console.log(`   Database: ${process.env.POSTGRES_DB || 'asset_tracking'}`);
  console.log(`   User: ${process.env.POSTGRES_USER || 'postgres'}\n`);
  
  try {
    console.log('📡 Testing connection...');
    await sequelize.authenticate();
    console.log('✅ Connection successful!\n');
    
    console.log('🏗️  Creating/Updating tables...');
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Tables created/updated!\n');
    
    console.log('📊 Database structure:');
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log(`   Found ${tables.length} tables:`);
    tables.forEach(table => console.log(`   - ${table}`));
    
    console.log('\n✅ Database setup complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run migration script: node migrate-to-postgres.js');
    console.log('   2. Or start with fresh data and update server.js\n');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.error('\n💡 Tip: Check your PostgreSQL password in .env file');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.error('\n💡 Tip: Create the database first:');
      console.error('   psql -U postgres');
      console.error('   CREATE DATABASE asset_tracking;');
      console.error('   \\q');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Tip: Make sure PostgreSQL is running');
      console.error('   Windows: Check Services');
      console.error('   macOS: brew services start postgresql');
      console.error('   Linux: sudo systemctl start postgresql');
    }
    
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

setupDatabase();
