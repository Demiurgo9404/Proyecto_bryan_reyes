const { Sequelize } = require('sequelize');
const config = require('./config/config.js');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

console.log('🔍 VERIFICANDO TABLAS EN LA BASE DE DATOS');
console.log('==========================================');

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

async function verifyTables() {
  try {
    console.log('📡 Conectando a PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');

    // Verificar todas las tablas
    const [tables] = await sequelize.query(`
      SELECT table_name, table_schema
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log(`\n📋 Tablas encontradas (${tables.length}):`);
    tables.forEach((table, i) => {
      console.log(`${i + 1}. ${table.table_name}`);
    });

    // Verificar específicamente la tabla users
    const hasUsers = tables.some(t => t.table_name === 'users');
    console.log(`\n👤 Tabla 'users' existe: ${hasUsers ? '✅ SÍ' : '❌ NO'}`);

    if (hasUsers) {
      // Contar usuarios
      const [userCount] = await sequelize.query('SELECT COUNT(*) as count FROM users');
      console.log(`📊 Usuarios en la tabla: ${userCount[0].count}`);

      // Mostrar algunos usuarios
      const [users] = await sequelize.query(`
        SELECT username, email, is_active 
        FROM users 
        LIMIT 5
      `);
      
      console.log('\n👥 Usuarios encontrados:');
      users.forEach((user, i) => {
        console.log(`${i + 1}. ${user.username} (${user.email}) - ${user.is_active ? 'Activo' : 'Inactivo'}`);
      });
    }

    // Verificar tabla roles
    const hasRoles = tables.some(t => t.table_name === 'roles');
    console.log(`\n🔐 Tabla 'roles' existe: ${hasRoles ? '✅ SÍ' : '❌ NO'}`);

    // Verificar tabla user_roles
    const hasUserRoles = tables.some(t => t.table_name === 'user_roles');
    console.log(`🔗 Tabla 'user_roles' existe: ${hasUserRoles ? '✅ SÍ' : '❌ NO'}`);

    if (!hasUsers || !hasRoles || !hasUserRoles) {
      console.log('\n❌ PROBLEMA: Faltan tablas críticas');
      console.log('💡 Solución: Ejecutar nuevamente el script de configuración');
    } else {
      console.log('\n✅ TODAS LAS TABLAS CRÍTICAS EXISTEN');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verifyTables();
