const { Sequelize } = require('sequelize');
const config = require('../../config/config');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Crear instancia de Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    dialectOptions: dbConfig.dialectOptions || {},
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL establecida correctamente.'.green.underline);
    return true;
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:'.red, error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  Sequelize
};
