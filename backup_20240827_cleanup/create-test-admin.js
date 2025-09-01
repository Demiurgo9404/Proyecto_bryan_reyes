const { User } = require('./server/models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

async function createTestAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: {
        email: 'admin@example.com',
        role: 'admin'
      }
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Email:', existingAdmin.email);
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      emailVerified: true
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    process.exit();
  }
}

// Run the function
createTestAdmin();
