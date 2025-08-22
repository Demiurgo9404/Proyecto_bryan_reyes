const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Love_rose_db',
  password: '1234',
  port: 5432,
});

async function testConnection() {
  const client = await pool.connect();
  try {
    console.log('✅ Conexión a la base de datos exitosa');
    
    // Verificar si la tabla users existe
    const res = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'"
    );
    
    if (res.rows.length === 0) {
      console.error('❌ La tabla users no existe en la base de datos');
      return;
    }
    
    console.log('\n🔍 Verificando usuario de prueba...');
    
    // Buscar el usuario
    const userRes = await client.query(
      'SELECT * FROM users WHERE email = $1',
      ['user@loverose.com']
    );
    
    if (userRes.rows.length === 0) {
      console.error('❌ Usuario no encontrado');
      return;
    }
    
    const user = userRes.rows[0];
    console.log('\n📋 Datos del usuario:');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('is_verified:', user.is_verified);
    console.log('is_active:', user.is_active);
    
    // Verificar si las columnas is_verified e is_active existen
    const columnsRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' 
      AND column_name IN ('is_verified', 'is_active')
    `);
    
    console.log('\n🔍 Columnas de verificación:');
    console.log(columnsRes.rows);
    
    // Si las columnas no existen, crearlas
    if (columnsRes.rows.length < 2) {
      console.log('\n🔄 Creando columnas faltantes...');
      
      if (!columnsRes.rows.some(col => col.column_name === 'is_verified')) {
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT true');
        console.log('✅ Columna is_verified creada');
      }
      
      if (!columnsRes.rows.some(col => col.column_name === 'is_active')) {
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true');
        console.log('✅ Columna is_active creada');
      }
      
      // Actualizar el usuario
      await client.query(
        'UPDATE users SET is_verified = true, is_active = true WHERE email = $1',
        ['user@loverose.com']
      );
      
      console.log('✅ Usuario actualizado con los nuevos campos');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

testConnection();
