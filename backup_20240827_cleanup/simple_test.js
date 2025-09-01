const { sequelize } = require('./server/config/database');

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    console.log('\n🔄 Testing model synchronization...');
    // Only sync the User model for testing
    const User = require('./server/models/User.model')(sequelize);
    await User.sync({ alter: true });
    console.log('✅ User model synchronized successfully!');
    
    // Test a simple query
    console.log('\n🔍 Testing basic query...');
    const users = await User.findAll({ limit: 3 });
    console.log(`✅ Found ${users.length} users in the database`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

testConnection();
