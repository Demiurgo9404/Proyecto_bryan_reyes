const { Sequelize } = require('sequelize');
require('dotenv').config();

async function checkDatabase() {
  const sequelize = new Sequelize(
    process.env.DB_NAME || 'love_rose_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'Roximar2025',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: console.log,
      define: {
        timestamps: true,
        underscored: true
      }
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ Connection to the database has been established successfully.');

    // List all tables in the database
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);

    console.log('\n📋 Database Tables:');
    console.table(tables);

  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

checkDatabase();
