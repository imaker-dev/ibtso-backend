const { User } = require('../models');

const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ 
      where: {
        email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@ibtso.com',
        role: 'ADMIN'
      }
    });

    if (!adminExists) {
      await User.create({
        name: process.env.DEFAULT_ADMIN_NAME || 'IBTSO Admin',
        email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@ibtso.com',
        password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123',
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
