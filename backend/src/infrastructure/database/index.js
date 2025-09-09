const { Sequelize } = require('sequelize');
const config = require('../../config');
const logger = require('../logging/logger');
const path = require('path');
const fs = require('fs');

const sequelize = new Sequelize(
  config.database.database,
  config.database.username,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'postgres',
    logging: config.database.logging ? (msg) => logger.debug(msg) : false,
    define: {
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      paranoid: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Test the database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
    return true;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    return false;
  }
};

// Load all models dynamically
const loadModels = () => {
  const modelsPath = path.join(__dirname, '../../domain/models');
  const models = {};

  // Read all model files
  fs.readdirSync(modelsPath)
    .filter((file) => {
      return (
        file.indexOf('.') !== 0 &&
        file !== path.basename(__filename) &&
        file.slice(-9) === '.model.js'
      );
    })
    .forEach((file) => {
      const model = require(path.join(modelsPath, file));
      const modelName = file.split('.')[0];
      models[modelName] = model.init(sequelize);
    });

  // Set up model associations
  Object.values(models)
    .filter((model) => typeof model.associate === 'function')
    .forEach((model) => model.associate(models));

  return models;
};

// Initialize database and models
const initializeDatabase = async () => {
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to the database');
    }

    const models = loadModels();
    
    // Sync models with database
    if (config.env === 'development') {
      await sequelize.sync({ alter: true });
    } else if (config.env === 'test') {
      await sequelize.sync({ force: true });
    } else {
      await sequelize.sync();
    }

    logger.info('Database synchronized');
    return { sequelize, models };
  } catch (error) {
    logger.error('Error initializing database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  initializeDatabase,
  testConnection,
};

// Export Sequelize for migrations
module.exports.Sequelize = Sequelize;
