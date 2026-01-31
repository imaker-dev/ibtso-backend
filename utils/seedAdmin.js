const User = require('../models/User');

const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ 
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@ibtso.com',
      role: 'ADMIN'
    });

    if (!adminExists) {
      await User.create({
        name: process.env.DEFAULT_ADMIN_NAME || 'IBTSO Admin',
        email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@ibtso.com',
        password: process.env.DEFAULT_ADMIN_PASSWORD || 'ibtso@$2026',
        role: 'ADMIN',
        isActive: true,
      });
      console.log('✅ Default admin user created successfully');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  }
};

module.exports = { createDefaultAdmin };
