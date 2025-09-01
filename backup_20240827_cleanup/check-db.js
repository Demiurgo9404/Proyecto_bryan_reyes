const { Sequelize } = require('sequelize');
require('dotenv').config();

async function checkDatabase() {
  // Configuración de conexión directa a postgres para verificar la base de datos
  const adminSequelize = new Sequelize('postgres', 'postgres', 'Roximar2025', {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: console.log
  });

  try {
    // Verificar conexión al servidor PostgreSQL
    console.log('Intentando conectar al servidor PostgreSQL...');
    await adminSequelize.authenticate();
    console.log('✅ Conexión al servidor PostgreSQL exitosa');

    // Verificar si la base de datos existe
    const [results] = await adminSequelize.query(
      `SELECT datname FROM pg_database WHERE datname = 'love_rose_db';`
    );

    if (results.length === 0) {
      console.log('❌ La base de datos "love_rose_db" no existe');
      console.log('\nPara crear la base de datos, ejecuta el siguiente comando en psql:');
      console.log('CREATE DATABASE love_rose_db;');
      return;
    }

    console.log('✅ La base de datos "love_rose_db" existe');

    // Conectar a la base de datos específica
    const dbSequelize = new Sequelize('love_rose_db', 'postgres', 'Roximar2025', {
      host: 'localhost',
      port: 5432,
      dialect: 'postgres',
      logging: console.log
    });

    await dbSequelize.authenticate();
    console.log('✅ Conexión a la base de datos "love_rose_db" exitosa');

    // Listar tablas
    const [tables] = await dbSequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );

    console.log('\nTablas en la base de datos:');
    console.table(tables.map(t => ({ 'Nombre de tabla': t.table_name })));

    // Verificar si la tabla de usuarios existe
    if (tables.some(t => t.table_name === 'users')) {
      const [users] = await dbSequelize.query('SELECT COUNT(*) as count FROM users');
      console.log(`\nNúmero de usuarios en la base de datos: ${users[0].count}`);
      
      if (users[0].count > 0) {
        const [userList] = await dbSequelize.query('SELECT id, username, email, role, is_active FROM users LIMIT 5');
        console.log('\nPrimeros usuarios:');
        console.table(userList);
      }
    }

  } catch (error) {
    console.error('❌ Error al verificar la base de datos:', error.message);
    
    if (error.original) {
      console.error('Detalles del error:', error.original);
    }
    
    if (error.message.includes('does not exist')) {
      console.log('\nParece que la base de datos no existe. Para crearla, ejecuta:');
      console.log('CREATE DATABASE love_rose_db;');
    }
  } finally {
    await adminSequelize.close();
    process.exit();
  }
}

checkDatabase();
