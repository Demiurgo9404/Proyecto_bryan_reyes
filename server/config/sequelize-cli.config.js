require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectModule: require('pg'),
    seederStorage: 'sequelize',
    seederStorageTableName: 'sequelize_data',
    migrationStorageTableName: 'sequelize_meta',
    logging: console.log
  },
  test: {
    username: process.env.DB_USER_TEST,
    password: process.env.DB_PASSWORD_TEST,
    database: process.env.DB_NAME_TEST,
    host: process.env.DB_HOST_TEST,
    port: process.env.DB_PORT_TEST,
    dialect: 'postgres',
    dialectModule: require('pg'),
    logging: false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectModule: require('pg'),
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
