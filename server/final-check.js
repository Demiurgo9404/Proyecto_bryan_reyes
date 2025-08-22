const { sequelize } = require('./config/database');

async function finalCheck() {
  console.log('🔍 Verificación final de la base de datos...\n');
  
  try {
    // 1. Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa'.green);
    
    // 2. Verificar tablas principales
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    console.log(`✅ ${tables.length} tablas encontradas`.green);
    
    // 3. Verificar usuario administrador
    const [admin] = await sequelize.query("SELECT * FROM users WHERE username = 'admin'");
    if (admin && admin.length > 0) {
      console.log('✅ Usuario administrador verificado'.green);
    } else {
      console.log('⚠️  Usuario administrador no encontrado'.yellow);
    }
    
    // 4. Verificar productos
    const [products] = await sequelize.query("SELECT COUNT(*) as count FROM products");
    console.log(`✅ ${products[0].count} productos encontrados`.green);
    
    // 5. Verificar vistas
    const [views] = await sequelize.query(
      "SELECT table_name FROM information_schema.views WHERE table_schema = 'public'"
    );
    console.log(`✅ ${views.length} vistas de dashboards encontradas`.green);
    
    console.log('\n✨ ¡Todas las verificaciones se completaron con éxito!'.green.bold);
    console.log('La base de datos está lista para ser utilizada con las dashboards.'.green);
    
  } catch (error) {
    console.error('❌ Error durante la verificación:'.red, error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Ejecutar verificación
finalCheck();
