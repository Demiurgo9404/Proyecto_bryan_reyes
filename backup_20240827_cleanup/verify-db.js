const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Love_rose_db',
  password: 'Roximar2025',
  port: 5432,
});

async function verifyDatabase() {
  const client = await pool.connect();
  try {
    console.log('✅ Conexión exitosa a la base de datos');
    
    // Listar todas las tablas
    const tables = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    console.log('\n📋 Tablas en la base de datos:');
    console.table(tables.rows);
    
    // Verificar tablas específicas
    const requiredTables = ['Users', 'Notifications', 'Stories'];
    const missingTables = [];
    
    for (const table of requiredTables) {
      const result = await client.query(
        "SELECT to_regclass($1) as exists",
        [`public.\"${table}\"`]
      );
      
      if (!result.rows[0].exists) {
        missingTables.push(table);
      }
    }
    
    if (missingTables.length > 0) {
      console.log('\n❌ Faltan las siguientes tablas:', missingTables.join(', '));
      console.log('\nPara crear las tablas faltantes, ejecuta:');
      console.log('node fix-tables.js');
    } else {
      console.log('\n✅ Todas las tablas necesarias están presentes');
      console.log('\nReinicia el servidor para aplicar los cambios');
    }
    
  } catch (error) {
    console.error('❌ Error al verificar la base de datos:', error.message);
    
    if (error.message.includes('database "Love_rose_db" does not exist')) {
      console.log('\nLa base de datos no existe. Crea la base de datos con:');
      console.log('createdb -U postgres -h localhost -p 5432 Love_rose_db');
    } else if (error.message.includes('password authentication failed')) {
      console.log('\nError de autenticación. Verifica el usuario y contraseña en el script.');
    }
    
  } finally {
    client.release();
    await pool.end();
  }
}

verifyDatabase();
