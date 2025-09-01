const { sequelize } = require('./server/config/database');
const User = require('./server/models/User.model')(sequelize);
const UserImage = require('./server/models/UserImage.model')(sequelize);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    
    // Test User model
    console.log('\n🔍 Testing User model...');
    console.log('User table name:', User.tableName);
    console.log('User model attributes:', Object.keys(User.rawAttributes));
    
    // Test UserImage model
    console.log('\n🔍 Testing UserImage model...');
    console.log('UserImage table name:', UserImage.tableName);
    console.log('UserImage model attributes:', Object.keys(UserImage.rawAttributes));
    
    // Test model synchronization
    console.log('\n🔄 Syncing models...');
    await sequelize.sync({ alter: true, force: false });
    console.log('✅ Models synchronized successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection();
