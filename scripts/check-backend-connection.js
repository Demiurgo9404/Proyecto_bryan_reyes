const { Sequelize } = require('sequelize');
const config = require('../config/config.js');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

console.log('🔍 Verificando conexión del backend a la base de datos...');
console.log(`📊 Configuración: ${JSON.stringify(dbConfig, null, 2)}`);

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: console.log,
    dialectOptions: dbConfig.dialectOptions || {}
  }
);

async function checkBackendConnection() {
  try {
    // 1. Verificar conexión
    console.log('\n📡 Verificando conexión...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.');

    // 2. Verificar tablas principales
    console.log('\n📋 Verificando tablas principales...');
    const [tables] = await sequelize.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns 
              WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name IN ('users', 'roles', 'user_roles')
      ORDER BY table_name;
    `);

    console.log(`\n📊 Tablas encontradas: ${tables.length}`);
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name} (${table.column_count} columnas)`);
    });

    // 3. Verificar usuarios específicos
    if (tables.some(t => t.table_name === 'users')) {
      console.log('\n👥 Verificando usuarios de prueba...');
      const [users] = await sequelize.query(`
        SELECT u.username, u.email, u.is_verified, u.is_active
        FROM users u
        WHERE u.email LIKE '%@loverose.com'
        ORDER BY u.username;
      `);

      console.log(`\n👤 Usuarios encontrados: ${users.length}`);
      users.forEach((user, index) => {
        const status = user.is_active ? '🟢' : '🔴';
        const verified = user.is_verified ? '✅' : '❌';
        console.log(`${index + 1}. ${user.username} (${user.email}) ${status} ${verified}`);
      });

      // 4. Probar query de login
      console.log('\n🔐 Probando query de login...');
      const testEmail = 'admin@loverose.com';
      const [loginTest] = await sequelize.query(`
        SELECT u.*, ARRAY_AGG(r.name) as roles
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        WHERE u.email = :email AND u.is_active = true
        GROUP BY u.id
      `, {
        replacements: { email: testEmail },
        type: Sequelize.QueryTypes.SELECT
      });

      if (loginTest.length > 0) {
        console.log(`✅ Query de login funciona correctamente para: ${testEmail}`);
        console.log(`   Usuario: ${loginTest[0].username}`);
        console.log(`   Roles: ${loginTest[0].roles || 'Sin roles'}`);
      } else {
        console.log(`❌ No se encontró usuario con email: ${testEmail}`);
      }
    } else {
      console.log('❌ La tabla users no existe');
    }

    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('no existe la relación')) {
      console.error('🔍 Las tablas no existen en esta base de datos');
    }
    return false;
  } finally {
    await sequelize.close();
  }
}

checkBackendConnection().then(success => {
  console.log(success ? '\n✅ Verificación completada.' : '\n❌ Verificación falló.');
  process.exit(success ? 0 : 1);
});
