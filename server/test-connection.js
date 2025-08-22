const { Sequelize } = require('sequelize');
const config = require('./config/config.json').development;

async function testConnection() {
  const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      host: config.host,
      port: config.port,
      dialect: config.dialect,
      logging: console.log
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');
    
    // Verificar tablas
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    console.log('\n📋 Tablas en la base de datos:');
    tables.forEach(table => console.log(`- ${table.table_name}`));
    
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
  } finally {
    await sequelize.close();
  }
}

testConnection();
