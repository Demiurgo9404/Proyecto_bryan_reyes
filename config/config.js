require('dotenv').config();

module.exports = {
  development: {
    username: 'postgres',
    password: 'Roximar2025', // Database password
    database: 'Love_rose_db', // Database name
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: console.log,
    // Disable SSL for local development
    dialectOptions: {
      ssl: false
    }
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.TEST_DB_NAME || 'Love_rose_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
  }
};
