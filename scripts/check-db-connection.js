const { Sequelize } = require('sequelize');
const config = require('../config/config.js');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

console.log('🔍 Verificando conexión a la base de datos...');
console.log(`Entorno: ${env}`);
console.log(`Base de datos: ${dbConfig.database}`);
console.log(`Host: ${dbConfig.host}:${dbConfig.port}`);

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: false,
    dialectOptions: dbConfig.dialectOptions || {}
  }
);

async function checkConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    // Verificar si la base de datos existe y tiene tablas
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Tablas existentes en la base de datos:');
    if (results.length === 0) {
      console.log('❌ No se encontraron tablas en la base de datos.');
    } else {
      results.forEach((table, index) => {
        console.log(`${index + 1}. ${table.table_name}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    return false;
  } finally {
    await sequelize.close();
  }
}

checkConnection().then(success => {
  process.exit(success ? 0 : 1);
});
