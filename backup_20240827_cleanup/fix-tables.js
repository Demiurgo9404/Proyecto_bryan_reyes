const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'Love_rose_db',
  password: process.env.DB_PASSWORD || 'Roximar2025',
  port: process.env.DB_PORT || 5432,
});

const queries = [
  // Create Notifications table
  `CREATE TABLE IF NOT EXISTS "Notifications" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "Users" (id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES "Users" (id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('like', 'message', 'match', 'system')),
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
  )`,
  
  // Create Stories table
  `CREATE TABLE IF NOT EXISTS "Stories" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "Users" (id) ON DELETE CASCADE,
    content TEXT,
    media_url VARCHAR(255),
    media_type VARCHAR(50) CHECK (media_type IN ('image', 'video')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
  )`,
  
  // Create indexes
  'CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON "Notifications" (user_id)',
  'CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON "Notifications" (is_read)',
  'CREATE INDEX IF NOT EXISTS stories_user_id_idx ON "Stories" (user_id)',
  'CREATE INDEX IF NOT EXISTS stories_expires_at_idx ON "Stories" (expires_at)',
  'CREATE INDEX IF NOT EXISTS stories_is_active_idx ON "Stories" (is_active)'
];

async function runQueries() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    for (const query of queries) {
      try {
        console.log(`Ejecutando: ${query.split('\n')[0]}...`);
        await client.query(query);
        console.log('✓ Éxito');
      } catch (error) {
        console.error('Error en la consulta:', error.message);
      }
    }
    
    await client.query('COMMIT');
    console.log('\n✅ Todas las tablas e índices han sido creados exitosamente');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error al ejecutar las consultas:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

runQueries();
