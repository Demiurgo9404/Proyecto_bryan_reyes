const { Sequelize } = require('sequelize');
const config = require('./config/config.json').development;

async function checkDatabase() {
  const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      host: config.host,
      port: config.port,
      dialect: 'postgres',
      logging: console.log,
      define: {
        timestamps: true,
        underscored: true
      }
    }
  );

  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Connection to the database has been established successfully.');

    // Check if Users table exists
    const [usersTable] = await sequelize.query(
      "SELECT to_regclass('public.\"Users\"') as exists"
    );
    
    if (!usersTable[0].exists) {
      console.error('❌ Users table does not exist!');
    } else {
      console.log('✅ Users table exists');
    }

    // Check if Notifications table exists
    const [notificationsTable] = await sequelize.query(
      "SELECT to_regclass('public.\"Notifications\"') as exists"
    );
    
    if (!notificationsTable[0].exists) {
      console.error('❌ Notifications table does not exist!');
    } else {
      console.log('✅ Notifications table exists');
    }

    // Check if Stories table exists
    const [storiesTable] = await sequelize.query(
      "SELECT to_regclass('public.\"Stories\"') as exists"
    );
    
    if (!storiesTable[0].exists) {
      console.error('❌ Stories table does not exist!');
    } else {
      console.log('✅ Stories table exists');
    }

    // List all tables in the database
    const [tables] = await sequelize.query(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = 'public' 
       ORDER BY table_name`
    );

    console.log('\n📋 All Database Tables:');
    console.table(tables);

  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

checkDatabase();
