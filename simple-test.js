const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Love_rose_db',
  password: 'Roximar2025',
  port: 5432,
});

async function testConnection() {
  console.log('🔍 Intentando conectar a la base de datos...');
  
  try {
    const client = await pool.connect();
    console.log('✅ Conexión exitosa a PostgreSQL');
    
    // Verificar tablas existentes
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    
    console.log('\n📋 Tablas en la base de datos:');
    if (result.rows.length > 0) {
      result.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name}`);
      });
    } else {
      console.log('   No hay tablas en la base de datos.');
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:');
    console.error('   Mensaje:', error.message);
    
    if (error.code) {
      console.error('   Código de error:', error.code);
    }
    
  } finally {
    await pool.end();
    console.log('\n🔌 Conexión cerrada.');
  }
}

testConnection();
