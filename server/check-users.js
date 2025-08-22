const { sequelize } = require('./config/database');

async function checkUsers() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa');
    
    // Verificar estructura de la tabla users
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `);
    
    console.log('\n📋 Estructura de la tabla users:');
    console.table(results);
    
    // Verificar usuarios existentes
    const [users] = await sequelize.query(`
      SELECT id, email, role, "is_verified", "is_active", created_at, updated_at 
      FROM users;
    `);
    
    console.log('\n👥 Usuarios en la base de datos:');
    console.table(users);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.original) {
      console.error('Detalles del error:', error.original);
    }
  } finally {
    await sequelize.close();
  }
}

checkUsers();
