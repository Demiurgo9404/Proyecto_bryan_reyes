const { Client } = require('pg');
const fs = require('fs');

console.log('🔍 Iniciando prueba de conexión a PostgreSQL...\n');

// Configuración de conexión
const config = {
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'Roximar2025',
  port: 5432,
  connectionTimeoutMillis: 5000,
};

console.log('📌 Configuración de conexión:');
console.log(`- Host: ${config.host}`);
console.log(`- Puerto: ${config.port}`);
console.log(`- Usuario: ${config.user}`);
console.log(`- Base de datos: ${config.database}\n`);

// Crear cliente
const client = new Client(config);

// Función para probar la conexión
async function testConnection() {
  try {
    console.log('🔄 Intentando conectar a PostgreSQL...');
    await client.connect();
    console.log('✅ ¡Conexión exitosa a PostgreSQL!\n');

    // Obtener versión de PostgreSQL
    const version = await client.query('SELECT version()');
    console.log('📌 Información del servidor:');
    console.log(version.rows[0].version + '\n');

    // Listar bases de datos
    const dbs = await client.query(
      "SELECT datname FROM pg_database WHERE datistemplate = false;"
    );
    console.log('📚 Bases de datos disponibles:');
    dbs.rows.forEach((db, i) => {
      console.log(`  ${i + 1}. ${db.datname}`);
    });

    // Verificar si existe la base de datos Love_rose_db
    const dbExists = dbs.rows.some(db => db.datname === 'love_rose_db');
    console.log(`\n🔍 La base de datos 'love_rose_db' ${dbExists ? 'existe' : 'no existe'}`);

    if (dbExists) {
      // Conectar a la base de datos Love_rose_db
      await client.end();
      config.database = 'love_rose_db';
      const dbClient = new Client(config);
      
      try {
        await dbClient.connect();
        console.log('\n✅ Conexión exitosa a la base de datos love_rose_db');
        
        // Listar tablas
        const tables = await dbClient.query(
          "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
        );
        
        console.log('\n📋 Tablas en la base de datos:');
        if (tables.rows.length > 0) {
          tables.rows.forEach((table, i) => {
            console.log(`  ${i + 1}. ${table.table_name}`);
          });
        } else {
          console.log('  No se encontraron tablas en la base de datos.');
        }
        
        await dbClient.end();
      } catch (dbError) {
        console.error('❌ Error al conectar a la base de datos love_rose_db:', dbError.message);
      }
    }

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    
    // Verificar si el error es de autenticación
    if (error.message.includes('password authentication failed')) {
      console.log('\n🔑 Error de autenticación. Verifica el usuario y contraseña.');
    }
    
    // Verificar si el servicio está en ejecución
    if (error.message.includes('connection refused') || 
        error.message.includes('could not connect') ||
        error.message.includes('Connection terminated unexpectedly')) {
      console.log('\n⚠️  El servicio de PostgreSQL podría no estar en ejecución o no está escuchando en el puerto 5432.');
      console.log('   Verifica que el servicio esté en ejecución y que el puerto 5432 esté abierto.');
    }
    
    // Verificar si el host es incorrecto
    if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('\n🌐 No se pudo resolver el nombre del host. Verifica la configuración de red.');
    }
  } finally {
    if (client) {
      await client.end();
    }
  }
}

// Ejecutar la prueba de conexión
testConnection();
