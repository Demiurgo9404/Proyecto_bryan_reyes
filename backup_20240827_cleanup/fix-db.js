const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres', // Connect to default database first
  password: 'Roximar2025',
  port: 5432,
});

async function runMigrations() {
  const client = await pool.connect();
  try {
    // Check if database exists
    const dbCheck = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'Love_rose_db'"
    );

    if (dbCheck.rows.length === 0) {
      console.log('Creating database Love_rose_db...');
      await client.query('CREATE DATABASE "Love_rose_db"');
      console.log('✅ Database created');
    }

    // Connect to the application database
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

    // Create Users table if not exists
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

    // Create Notifications table
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

    // Create Stories table
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

    // Create indexes
    await appClient.query('CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON "Notifications" (user_id)');
    await appClient.query('CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON "Notifications" (is_read)');
    await appClient.query('CREATE INDEX IF NOT EXISTS stories_user_id_idx ON "Stories" (user_id)');
    await appClient.query('CREATE INDEX IF NOT EXISTS stories_expires_at_idx ON "Stories" (expires_at)');
    await appClient.query('CREATE INDEX IF NOT EXISTS stories_is_active_idx ON "Stories" (is_active)');

    console.log('✅ Database tables created successfully');

    // Create test user if not exists
    const testUser = await appClient.query(
      'SELECT id FROM "Users" WHERE email = $1',
      ['test@example.com']
    );

    if (testUser.rows.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('test1234', 10);
      
      await appClient.query(
        'INSERT INTO "Users" (email, password, is_active) VALUES ($1, $2, $3)',
        ['test@example.com', hashedPassword, true]
      );
      
      console.log('✅ Test user created (test@example.com / test1234)');
    } else {
      console.log('ℹ️ Test user already exists');
    }

  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    if (client) await client.release();
    if (appClient) await appClient.release();
    if (pool) await pool.end();
    if (appPool) await appPool.end();
    process.exit(0);
  }
}

runMigrations();
