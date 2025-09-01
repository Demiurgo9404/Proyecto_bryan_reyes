const { User } = require('./server/models');

async function checkUsers() {
  try {
    console.log('Checking users in the database...');
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'isActive', 'createdAt']
    });
    
    console.log(`Found ${users.length} users in the database:`);
    console.table(users.map(u => u.toJSON()));
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    process.exit();
  }
}

checkUsers();
