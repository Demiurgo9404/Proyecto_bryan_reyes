const { Sequelize } = require('sequelize');
const config = require('./server/config/config.json');

async function checkDatabase() {
  const dbConfig = config.development;
  
  console.log('=== Verificando configuración de la base de datos ===');
  console.log('Base de datos:', dbConfig.database);
  console.log('Usuario:', dbConfig.username);
  console.log('Host:', dbConfig.host);
  console.log('Puerto:', dbConfig.port);
  
  // 1. Verificar conexión al servidor PostgreSQL
  console.log('\n=== Probando conexión al servidor PostgreSQL ===');
  try {
    const testSequelize = new Sequelize('postgres', dbConfig.username, dbConfig.password, {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: 'postgres',
      logging: console.log,
      dialectOptions: {
        statement_timeout: 10000,
        idle_in_transaction_session_timeout: 10000
      }
    });
    
    await testSequelize.authenticate();
    console.log('✅ Conexión al servidor PostgreSQL exitosa');
    
    // 2. Verificar si la base de datos existe
    console.log('\n=== Verificando existencia de la base de datos ===');
    const [results] = await testSequelize.query(
      `SELECT datname FROM pg_database WHERE datname = '${dbConfig.database}';`
    );
    
    if (results.length === 0) {
      console.log(`❌ La base de datos "${dbConfig.database}" no existe`);
      console.log('\nPara crear la base de datos, ejecuta en psql:');
      console.log(`CREATE DATABASE "${dbConfig.database}";`);
      return;
    }
    
    console.log(`✅ La base de datos "${dbConfig.database}" existe`);
    
    // 3. Conectar a la base de datos específica
    console.log('\n=== Conectando a la base de datos específica ===');
    const dbSequelize = new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: 'postgres',
        logging: console.log,
        dialectOptions: {
          statement_timeout: 10000,
          idle_in_transaction_session_timeout: 10000
        }
      }
    );
    
    await dbSequelize.authenticate();
    console.log(`✅ Conexión a la base de datos "${dbConfig.database}" exitosa`);
    
    // 4. Verificar tablas
    console.log('\n=== Verificando tablas ===');
    const [tables] = await dbSequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    if (tables.length === 0) {
      console.log('❌ No se encontraron tablas en la base de datos');
      console.log('\nPara crear las tablas, ejecuta las migraciones:');
      console.log('npx sequelize-cli db:migrate');
      return;
    }
    
    console.log('\nTablas encontradas:');
    console.table(tables.map(t => ({ 'Tabla': t.table_name })));
    
    // 5. Verificar usuarios
    if (tables.some(t => t.table_name === 'users')) {
      const [users] = await dbSequelize.query('SELECT COUNT(*) as count FROM users');
      console.log(`\nNúmero de usuarios: ${users[0].count}`);
      
      if (users[0].count > 0) {
        const [userList] = await dbSequelize.query(
          'SELECT id, username, email, role, is_active FROM users LIMIT 5'
        );
        console.log('\nPrimeros usuarios:');
        console.table(userList);
      } else {
        console.log('\nNo hay usuarios en la base de datos.');
        console.log('Para crear un usuario administrador, ejecuta:');
        console.log('npx sequelize-cli db:seed:all');
      }
    }
    
    console.log('\n✅ Verificación completada exitosamente');
    
  } catch (error) {
    console.error('\n❌ Error al verificar la base de datos:', error.message);
    
    if (error.original) {
      console.error('Detalles del error:', error.original);
    }
    
    if (error.message.includes('does not exist')) {
      console.log('\nLa base de datos no existe. Para crearla, ejecuta en psql:');
      console.log(`CREATE DATABASE "${dbConfig.database}";`);
    } else if (error.message.includes('password authentication failed')) {
      console.log('\nError de autenticación. Verifica el usuario y contraseña en:');
      console.log('server/config/config.json');
    } else if (error.message.includes('could not connect to server')) {
      console.log('\nNo se pudo conectar al servidor PostgreSQL. Verifica que:');
      console.log('1. PostgreSQL esté instalado y en ejecución');
      console.log('2. El puerto sea correcto (por defecto 5432)');
      console.log('3. El servidor acepte conexiones (ver pg_hba.conf)');
    }
  }
}

checkDatabase();
