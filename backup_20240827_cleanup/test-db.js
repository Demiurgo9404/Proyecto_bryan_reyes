const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',  // Conectar a la base de datos por defecto
  password: 'Roximar2025',
  port: 5432,
});

async function testConnection() {
  const client = await pool.connect();
  try {
    // Verificar si la base de datos existe
    const dbCheck = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'Love_rose_db'"
    );

    if (dbCheck.rows.length === 0) {
      console.log('La base de datos no existe. Creando...');
      await client.query('CREATE DATABASE "Love_rose_db"');
      console.log('✅ Base de datos creada exitosamente');
    } else {
      console.log('✅ La base de datos ya existe');
    }

    // Conectar a la base de datos Love_rose_db
    await client.release();
    pool.end();

    const appPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'Love_rose_db',
      password: 'Roximar2025',
      port: 5432,
    });

    const appClient = await appPool.connect();
    
    // Crear tablas si no existen
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS "Users" (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await appClient.query(`
      CREATE TABLE IF NOT EXISTS "Notifications" (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES "Users" (id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES "Users" (id) ON DELETE SET NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('like', 'message', 'match', 'system')),
        message TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT false,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await appClient.query(`
      CREATE TABLE IF NOT EXISTS "Stories" (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES "Users" (id) ON DELETE CASCADE,
        content TEXT,
        media_url VARCHAR(255),
        media_type VARCHAR(50) CHECK (media_type IN ('image', 'video')),
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log('✅ Tablas creadas exitosamente');
    
    // Listar tablas
    const tables = await appClient.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    console.log('\n📋 Tablas en la base de datos:');
    console.table(tables.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) await client.release();
    if (pool) await pool.end();
    if (appClient) await appClient.release();
    if (appPool) await appPool.end();
    process.exit(0);
  }
}

testConnection();
