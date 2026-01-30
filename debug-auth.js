const { sequelize, User } = require('./models');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function debugAuth() {
  console.log('🔍 Debugging Authentication Issue...\n');
  
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL\n');

    // Check admin user
    console.log('1️⃣ Checking admin user in database...');
    const admin = await User.findOne({
      where: { role: 'ADMIN' }
    });

    if (!admin) {
      console.log('❌ No admin user found!\n');
      return;
    }

    console.log('✅ Admin user found:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}\n`);

    // Simulate token generation
    console.log('2️⃣ Simulating token generation...');
    const token = jwt.sign(
      { id: admin.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
    console.log(`✅ Token generated: ${token.substring(0, 50)}...\n`);

    // Decode token
    console.log('3️⃣ Decoding token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Decoded token:');
    console.log(`   User ID: ${decoded.id}`);
    console.log(`   Issued at: ${new Date(decoded.iat * 1000).toISOString()}`);
    console.log(`   Expires at: ${new Date(decoded.exp * 1000).toISOString()}\n`);

    // Lookup user with decoded ID
    console.log('4️⃣ Looking up user with decoded ID...');
    const foundUser = await User.findByPk(decoded.id);

    if (!foundUser) {
      console.log('❌ User NOT found with decoded ID!');
      console.log(`   Searched for ID: ${decoded.id}`);
      console.log(`   Type: ${typeof decoded.id}\n`);
      
      // Try finding with string conversion
      console.log('5️⃣ Trying with string conversion...');
      const foundUserString = await User.findByPk(String(decoded.id));
      if (foundUserString) {
        console.log('✅ Found with String conversion!');
      } else {
        console.log('❌ Still not found\n');
      }

      // List all users
      console.log('6️⃣ Listing all users in database:');
      const allUsers = await User.findAll({
        attributes: ['id', 'email', 'role']
      });
      console.log(`   Total users: ${allUsers.length}`);
      allUsers.forEach(u => {
        console.log(`   - ID: ${u.id} (type: ${typeof u.id}) | Email: ${u.email} | Role: ${u.role}`);
      });
    } else {
      console.log('✅ User found successfully!');
      console.log(`   ID: ${foundUser.id}`);
      console.log(`   Email: ${foundUser.email}`);
      console.log(`   Role: ${foundUser.role}\n`);
      console.log('✅ Authentication flow should work correctly!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed');
  }
}

debugAuth()
  .then(() => {
    console.log('\n✅ Debug completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Debug failed:', error);
    process.exit(1);
  });
