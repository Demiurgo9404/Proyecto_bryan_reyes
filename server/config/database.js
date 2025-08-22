const { Sequelize } = require('sequelize');
require('dotenv').config();
require('colors');

// Configuración de la base de datos
const dbConfig = {
  database: process.env.DB_NAME ? process.env.DB_NAME.trim() : 'love_rose_db',
  username: process.env.DB_USER ? process.env.DB_USER.trim() : 'postgres',
  password: process.env.DB_PASSWORD ? process.env.DB_PASSWORD.trim() : 'Roximar2025',
  host: process.env.DB_HOST ? process.env.DB_HOST.trim() : 'localhost',
  port: parseInt(process.env.DB_PORT ? process.env.DB_PORT.trim() : '5432', 10),
  dialect: 'postgres',
  dialectModule: require('pg'),
  logging: process.env.NODE_ENV === 'development' ? (msg) => console.log(`[SEQUELIZE] ${msg}`.blue) : false,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    schema: 'public'
  },
  dialectOptions: process.env.NODE_ENV === 'production' ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    statement_timeout: 10000,
    idle_in_transaction_session_timeout: 10000
  } : {
    statement_timeout: 10000,
    idle_in_transaction_session_timeout: 10000
  },
  pool: {
    max: 10, // Aumentado para manejar múltiples conexiones
    min: 2,
    acquire: 30000,
    idle: 10000,
    evict: 10000
  },
  retry: {
    max: 3,
    timeout: 30000
  }
};

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
    define: dbConfig.define,
    dialectOptions: dbConfig.dialectOptions,
    pool: dbConfig.pool,
    retry: dbConfig.retry,
    benchmark: process.env.NODE_ENV === 'development',
    timezone: '-05:00' // Ajusta según tu zona horaria
  }
);

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL establecida correctamente.'.green.underline);
    return true;
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:'.red, error.message);
    if (error.original) {
      console.error('Detalles del error:', error.original);
    }
    return false;
  }
};

// Probar conexión al cargar el módulo
if (process.env.NODE_ENV !== 'test') {
  testConnection();
}

module.exports = {
  sequelize,
  testConnection,
  Sequelize
};
