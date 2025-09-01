const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const config = require('../config/config.js');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

console.log('🚀 Configurando base de datos para LoveRose (versión corregida)...');
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

    // 2. Leer el script de esquema
    console.log('\n📋 Leyendo script de creación de esquema...');
    const schemaPath = path.join(__dirname, 'create-database-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // 3. Separar comandos por tipo - Mejorado para manejar multi-línea
    const cleanSql = schemaSql
      .replace(/--.*$/gm, '') // Remover comentarios
      .replace(/\n\s*\n/g, '\n') // Remover líneas vacías múltiples
      .trim();

    const allCommands = cleanSql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);

    console.log(`📝 Total de comandos encontrados: ${allCommands.length}`);

    const extensions = allCommands.filter(cmd => cmd.toUpperCase().includes('CREATE EXTENSION'));
    const tables = allCommands.filter(cmd => cmd.toUpperCase().includes('CREATE TABLE'));
    const indexes = allCommands.filter(cmd => cmd.toUpperCase().includes('CREATE INDEX'));
    const inserts = allCommands.filter(cmd => 
      cmd.toUpperCase().includes('INSERT INTO') || 
      cmd.toUpperCase().startsWith('WITH')
    );

    console.log(`🔧 Extensiones: ${extensions.length}`);
    console.log(`📋 Tablas: ${tables.length}`);
    console.log(`📊 Índices: ${indexes.length}`);
    console.log(`📝 Inserts: ${inserts.length}`);

    // 4. Ejecutar extensiones
    console.log('\n🔧 Creando extensiones...');
    for (const cmd of extensions) {
      try {
        await sequelize.query(cmd + ';');
        console.log('✅ Extensión creada');
      } catch (error) {
        console.log('ℹ️ Extensión ya existe');
      }
    }

    // 5. Ejecutar creación de tablas
    console.log(`\n📋 Creando ${tables.length} tablas...`);
    for (let i = 0; i < tables.length; i++) {
      try {
        await sequelize.query(tables[i] + ';');
        console.log(`✅ Tabla ${i + 1}/${tables.length} creada`);
      } catch (error) {
        console.log(`ℹ️ Tabla ${i + 1}/${tables.length} ya existe: ${error.message.split('\n')[0]}`);
      }
    }

    // 6. Ejecutar inserts (roles y usuarios)
    console.log(`\n👥 Insertando datos iniciales (${inserts.length} comandos)...`);
    for (let i = 0; i < inserts.length; i++) {
      try {
        await sequelize.query(inserts[i] + ';');
        console.log(`✅ Datos ${i + 1}/${inserts.length} insertados`);
      } catch (error) {
        console.log(`ℹ️ Datos ${i + 1}/${inserts.length} ya existen: ${error.message.split('\n')[0]}`);
      }
    }

    // 7. Ejecutar índices
    console.log(`\n🔍 Creando ${indexes.length} índices...`);
    for (let i = 0; i < indexes.length; i++) {
      try {
        await sequelize.query(indexes[i] + ';');
        console.log(`✅ Índice ${i + 1}/${indexes.length} creado`);
      } catch (error) {
        console.log(`ℹ️ Índice ${i + 1}/${indexes.length} ya existe`);
      }
    }

    // 8. Verificar tablas LoveRose
    console.log('\n🔍 Verificando tablas de LoveRose...');
    const [loveRoseTables] = await sequelize.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns 
              WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name IN ('users', 'roles', 'user_roles', 'content', 'followers', 'messages', 'notifications')
      ORDER BY table_name;
    `);

    console.log(`\n✅ ${loveRoseTables.length} tablas principales de LoveRose:`);
    loveRoseTables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name} (${table.column_count} columnas)`);
    });

    // 9. Verificar usuarios de prueba solo si existe la tabla users
    if (loveRoseTables.some(t => t.table_name === 'users')) {
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

      console.log('\n🎉 ¡Base de datos configurada exitosamente!');
      console.log('\n📝 Credenciales de prueba para login:');
      console.log('   SuperAdmin: super@loverose.com / password123');
      console.log('   Admin: admin@loverose.com / password123');
      console.log('   Model: model@loverose.com / password123');
      console.log('   Study: study@loverose.com / password123');
      console.log('   User: user@loverose.com / password123');
    } else {
      console.log('\n⚠️ La tabla users no se creó correctamente. Revisa los errores anteriores.');
    }

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
