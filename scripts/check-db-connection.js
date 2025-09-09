const { Pool } = require('pg');
const config = require('../src/LoveRose.API/appsettings.json');

const pool = new Pool({
  connectionString: config.ConnectionStrings.DefaultConnection,
  ssl: false
});

async function checkConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión exitosa a PostgreSQL');
    
    // Verificar si la base de datos existe
    const dbRes = await client.query(
      "SELECT datname FROM pg_database WHERE datname = 'LoveRoseDB'"
    );
    
    if (dbRes.rows.length === 0) {
      console.log('⚠️  La base de datos LoveRoseDB no existe');
      console.log('Ejecuta el siguiente comando para crearla:');
      console.log('createdb -U postgres LoveRoseDB');
    } else {
      console.log('✅ Base de datos LoveRoseDB encontrada');
      
      // Verificar tablas principales
      const tablesRes = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public';
      `);
      
      if (tablesRes.rows.length === 0) {
        console.log('ℹ️  No se encontraron tablas en la base de datos');
        console.log('Ejecuta las migraciones con:');
        console.log('cd src/LoveRose.API');
        console.log('dotnet ef database update');
      } else {
        console.log('\nTablas encontradas:');
        tablesRes.rows.forEach(row => {
          console.log(`- ${row.table_name}`);
        });
      }
    }
    
    client.release();
  } catch (err) {
    console.error('❌ Error al conectar a la base de datos:', err.message);
    console.log('\nSolución de problemas:');
    console.log('1. Verifica que PostgreSQL esté en ejecución');
    console.log('2. Verifica las credenciales en appsettings.json');
    console.log('3. Asegúrate de que el usuario tenga permisos');
  } finally {
    await pool.end();
    process.exit();
  }
}

checkConnection();
