const { Sequelize } = require('sequelize');

async function testConnection() {
  const sequelize = new Sequelize({
    database: 'Love_rose_db',
    username: 'postgres',
    password: 'Roximar2025',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: {
      ssl: false
    }
  });

  try {
    // Autenticación
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    // Verificar tablas existentes
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    
    console.log('\n📋 Tablas en la base de datos:');
    if (tables.length > 0) {
      tables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.table_name}`);
      });
    } else {
      console.log('   No hay tablas en la base de datos.');
    }
    
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:');
    console.error('   Mensaje:', error.message);
    
    if (error.original) {
      console.error('   Detalles:', error.original);
    }
    
  } finally {
    if (sequelize) {
      await sequelize.close();
      console.log('\n🔌 Conexión cerrada.');
    }
  }
}

testConnection();
