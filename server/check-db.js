const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

async function checkDatabase() {
  try {
    console.log('🔍 Verificando conexión a la base de datos...');
    
    // Probar la conexión
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');
    
    // Verificar tablas existentes
    const tables = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
      { type: QueryTypes.SELECT }
    );
    
    console.log('\n📋 Tablas en la base de datos:');
    tables.forEach(table => console.log(`- ${table.table_name}`));
    
    // Verificar migraciones ejecutadas
    try {
      const migrations = await sequelize.query(
        'SELECT * FROM "SequelizeMeta" ORDER BY name',
        { type: QueryTypes.SELECT }
      );
      
      console.log('\n🔄 Migraciones aplicadas:');
      migrations.length > 0 
        ? migrations.forEach(m => console.log(`- ${m.name}`))
        : console.log('No hay migraciones registradas');
    } catch (e) {
      console.log('\nℹ️ No se pudo verificar las migraciones (¿la tabla SequelizeMeta existe?)');
    }
    
  } catch (error) {
    console.error('❌ Error al verificar la base de datos:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkDatabase();
