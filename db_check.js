const { Pool } = require('pg');

// Configuración de la conexión a la base de datos
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Love_rose_db',
  password: '1234',
  port: 5432,
});

async function checkDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verificando conexión a la base de datos...');
    
    // Verificar si la tabla users existe
    const tableExists = await client.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')"
    );
    
    if (!tableExists.rows[0].exists) {
      console.error('❌ La tabla users no existe en la base de datos');
      return;
    }
    
    console.log('✅ La tabla users existe');
    
    // Verificar estructura de la tabla
    console.log('\n📋 Estructura de la tabla users:');
    const columns = await client.query(
      "SELECT column_name, data_type, is_nullable, column_default " +
      "FROM information_schema.columns " +
      "WHERE table_name = 'users'"
    );
    
    console.table(columns.rows);
    
    // Verificar si las columnas necesarias existen
    const requiredColumns = ['email', 'password', 'is_verified', 'is_active'];
    const existingColumns = columns.rows.map(col => col.column_name);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('\n⚠️  Faltan columnas necesarias:', missingColumns.join(', '));
      
      // Agregar columnas faltantes
      for (const column of missingColumns) {
        try {
          if (column === 'is_verified' || column === 'is_active') {
            await client.query(`
              ALTER TABLE users 
              ADD COLUMN IF NOT EXISTS ${column} BOOLEAN NOT NULL DEFAULT true
            `);
            console.log(`✅ Columna ${column} agregada`);
          }
        } catch (error) {
          console.error(`❌ Error al agregar la columna ${column}:`, error.message);
        }
      }
    }
    
    // Verificar usuario de prueba
    console.log('\n🔍 Verificando usuario de prueba...');
    const userResult = await client.query(
      "SELECT * FROM users WHERE email = 'user@loverose.com'"
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ Usuario de prueba no encontrado');
      
      // Crear usuario de prueba
      const hashedPassword = '$2a$10$XFDq3L7v4LdJ3H5p5n8G1OQJ1hJ3Zv5W8nUzXKjKvxY7dJ2mN3p4C'; // User123!
      
      try {
        const newUser = await client.query(
          `INSERT INTO users (
            id, email, password, username, role, 
            is_verified, is_active, created_at, updated_at
          ) VALUES (
            '550e8400-e29b-41d4-a716-446655440000',
            'user@loverose.com',
            $1,
            'usuario_prueba',
            'user',
            true,
            true,
            NOW(),
            NOW()
          ) RETURNING *`,
          [hashedPassword]
        );
        
        console.log('✅ Usuario de prueba creado exitosamente');
        console.log('   Email: user@loverose.com');
        console.log('   Contraseña: User123!');
      } catch (error) {
        console.error('❌ Error al crear el usuario de prueba:', error.message);
      }
    } else {
      const user = userResult.rows[0];
      console.log('✅ Usuario de prueba encontrado:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Verificado: ${user.is_verified ? '✅' : '❌'}`);
      console.log(`   Activo: ${user.is_active ? '✅' : '❌'}`);
      
      // Actualizar si es necesario
      if (!user.is_verified || !user.is_active) {
        console.log('\n🔄 Actualizando estado del usuario...');
        await client.query(
          `UPDATE users 
           SET is_verified = true, 
               is_active = true,
               updated_at = NOW() 
           WHERE email = 'user@loverose.com'`
        );
        console.log('✅ Estado del usuario actualizado correctamente');
      }
    }
    
  } catch (error) {
    console.error('❌ Error al verificar la base de datos:', error.message);
    
    // Verificar si la base de datos existe
    if (error.message.includes('database "Love_rose_db" does not exist')) {
      console.log('\n⚠️  La base de datos no existe. Por favor crea la base de datos primero:');
      console.log('   createdb -U postgres Love_rose_db');
    }
    
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar la verificación
checkDatabase();
