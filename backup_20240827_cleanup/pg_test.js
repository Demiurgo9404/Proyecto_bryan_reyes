const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Configuración de la conexión a PostgreSQL
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
    console.log('✅ Conexión exitosa a PostgreSQL');
    
    // Verificar la tabla users
    const tableExists = await client.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')"
    );
    
    if (!tableExists.rows[0].exists) {
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
    
    // Actualizar el usuario
    console.log('\n🔄 Actualizando usuario...');
    const password = 'User123!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    await client.query(
      `UPDATE users 
       SET 
         is_verified = true,
         is_active = true,
         password = $1,
         updated_at = NOW()
       WHERE email = $2`,
      [hashedPassword, 'user@loverose.com']
    );
    
    console.log('✅ Usuario actualizado correctamente');
    
    // Verificar la actualización
    const updatedRes = await client.query(
      'SELECT * FROM users WHERE email = $1',
      ['user@loverose.com']
    );
    
    const updatedUser = updatedRes.rows[0];
    console.log('\n🔍 Verificación después de actualizar:');
    console.log('is_verified:', updatedUser.is_verified);
    console.log('is_active:', updatedUser.is_active);
    
    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, updatedUser.password);
    console.log('\n🔑 Verificación de contraseña:', isMatch ? '✅ Correcta' : '❌ Incorrecta');
    
    if (isMatch) {
      console.log('\n✨ ¡Usuario listo para iniciar sesión!');
      console.log('Por favor, intenta iniciar sesión con:');
      console.log('Email: user@loverose.com');
      console.log('Contraseña: User123!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

testConnection();
