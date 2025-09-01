const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const config = require('../config/config.js');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

console.log('🚀 Configurando base de datos para LoveRose...');
console.log(`Entorno: ${env}`);
console.log(`Base de datos: ${dbConfig.database}`);

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

async function setupDatabase() {
  try {
    // 1. Verificar conexión
    console.log('\n📡 Verificando conexión a PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.');

    // 2. Leer y ejecutar el script de esquema
    console.log('\n📋 Ejecutando script de creación de esquema...');
    const schemaPath = path.join(__dirname, 'create-database-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Dividir el script en comandos individuales
    const commands = schemaSql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📝 Ejecutando ${commands.length} comandos SQL...`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        try {
          await sequelize.query(command + ';');
          if (i % 10 === 0) {
            console.log(`⏳ Progreso: ${i + 1}/${commands.length} comandos ejecutados`);
          }
        } catch (error) {
          console.warn(`⚠️ Advertencia en comando ${i + 1}: ${error.message}`);
        }
      }
    }

    // 3. Verificar tablas creadas
    console.log('\n🔍 Verificando tablas creadas...');
    const [tables] = await sequelize.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns 
              WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log(`\n✅ ${tables.length} tablas creadas exitosamente:`);
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name} (${table.column_count} columnas)`);
    });

    // 4. Verificar usuarios de prueba
    console.log('\n👥 Verificando usuarios de prueba...');
    const [users] = await sequelize.query(`
      SELECT u.username, u.email, u.is_verified, u.is_active, 
             ARRAY_AGG(r.name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.email LIKE '%@loverose.com'
      GROUP BY u.id, u.username, u.email, u.is_verified, u.is_active
      ORDER BY u.username;
    `);

    console.log(`\n👤 ${users.length} usuarios de prueba configurados:`);
    users.forEach((user, index) => {
      const status = user.is_active ? '🟢' : '🔴';
      const verified = user.is_verified ? '✅' : '❌';
      console.log(`${index + 1}. ${user.username} (${user.email}) ${status} ${verified}`);
      console.log(`   Roles: ${user.roles ? user.roles.join(', ') : 'Sin roles'}`);
    });

    // 5. Verificar índices
    console.log('\n📊 Verificando índices de optimización...');
    const [indexes] = await sequelize.query(`
      SELECT schemaname, tablename, indexname, indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname;
    `);

    console.log(`\n🔍 ${indexes.length} índices de optimización creados:`);
    const indexesByTable = indexes.reduce((acc, idx) => {
      if (!acc[idx.tablename]) acc[idx.tablename] = [];
      acc[idx.tablename].push(idx.indexname);
      return acc;
    }, {});

    Object.entries(indexesByTable).forEach(([table, tableIndexes]) => {
      console.log(`📋 ${table}: ${tableIndexes.length} índices`);
    });

    console.log('\n🎉 ¡Base de datos configurada exitosamente!');
    console.log('\n📝 Credenciales de prueba:');
    console.log('   SuperAdmin: super@loverose.com / password123');
    console.log('   Admin: admin@loverose.com / password123');
    console.log('   Model: model@loverose.com / password123');
    console.log('   Study: study@loverose.com / password123');
    console.log('   User: user@loverose.com / password123');

    return true;
  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar configuración
setupDatabase().then(success => {
  console.log(success ? '\n✅ Configuración completada.' : '\n❌ Configuración falló.');
  process.exit(success ? 0 : 1);
});
