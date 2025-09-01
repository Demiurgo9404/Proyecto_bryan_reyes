const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'love_rose_db',
  password: process.env.DB_PASSWORD || 'Roximar2025',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

async function testConnection() {
  console.log('🔌 Testing PostgreSQL connection...');
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    console.log('Current time from database:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

testConnection();
