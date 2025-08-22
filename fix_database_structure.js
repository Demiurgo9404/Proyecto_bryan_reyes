const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Love_rose_db',
  password: '1234',
  port: 5432,
});

async function fixDatabase() {
  const client = await pool.connect();
  try {
    console.log('🔍 Verificando estructura de la base de datos...');

    // 1. Verificar si la tabla users existe
    const tableExists = await client.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')"
    );
    
    if (!tableExists.rows[0].exists) {
      console.error('❌ La tabla users no existe en la base de datos');
      return;
    }

    // 2. Verificar columnas necesarias
    const requiredColumns = [
      'is_verified',
      'is_active',
      'email',
      'password',
      'role'
    ];

    console.log('\n🔍 Verificando columnas necesarias...');
    const { rows: existingColumns } = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'users'"
    );

    const existingColumnNames = existingColumns.map(col => col.column_name);
    const missingColumns = requiredColumns.filter(col => !existingColumnNames.includes(col));

    if (missingColumns.length > 0) {
      console.log('\n🔄 Creando columnas faltantes...');
      
      for (const column of missingColumns) {
        try {
          if (column === 'is_verified' || column === 'is_active') {
            await client.query(`
              ALTER TABLE users 
              ADD COLUMN IF NOT EXISTS ${column} BOOLEAN DEFAULT true
            `);
            console.log(`✅ Columna ${column} creada con éxito`);
          }
        } catch (error) {
          console.error(`❌ Error al crear la columna ${column}:`, error.message);
        }
      }
    } else {
      console.log('✅ Todas las columnas necesarias existen');
    }

    // 3. Verificar y actualizar usuario de prueba
    console.log('\n🔍 Verificando usuario de prueba...');
    const { rows: users } = await client.query(
      "SELECT * FROM users WHERE email = 'user@loverose.com'"
    );

    if (users.length === 0) {
      console.log('\n🔄 Creando usuario de prueba...');
      const hashedPassword = await bcrypt.hash('User123!', 10);
      
      await client.query(
        `INSERT INTO users (email, password, username, is_verified, is_active, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING *`,
        ['user@loverose.com', hashedPassword, 'usuario_prueba', true, true, 'user']
      );
      
      console.log('✅ Usuario de prueba creado exitosamente');
    } else {
      console.log('\n🔄 Actualizando usuario de prueba...');
      const user = users[0];
      
      // Actualizar campos necesarios
      await client.query(
        `UPDATE users 
         SET is_verified = true,
             is_active = true,
             updated_at = NOW()
         WHERE email = $1`,
        ['user@loverose.com']
      );
      
      console.log('✅ Usuario de prueba actualizado exitosamente');
    }

    // 4. Verificar índices
    console.log('\n🔍 Verificando índices...');
    const { rows: indexes } = await client.query(
      "SELECT indexname FROM pg_indexes WHERE tablename = 'users'"
    );
    
    if (!indexes.some(idx => idx.indexname === 'users_email_idx')) {
      await client.query('CREATE INDEX users_email_idx ON users (email)');
      console.log('✅ Índice para email creado');
    }

    console.log('\n✨ La base de datos ha sido verificada y actualizada correctamente');
    console.log('🔑 Usuario para pruebas:');
    console.log('   Email: user@loverose.com');
    console.log('   Contraseña: User123!');
    
  } catch (error) {
    console.error('❌ Error al verificar/actualizar la base de datos:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar la función principal
fixDatabase();
