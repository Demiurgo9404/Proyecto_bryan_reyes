const { Pool } = require('pg');
const config = require('./config/config.json').development;

const pool = new Pool({
  user: config.username,
  host: config.host,
  database: config.database,
  password: config.password,
  port: config.port,
});

async function testConnection() {
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Successfully connected to the database');
    
    // Test query to check if Users table exists
    const result = await client.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\'');
    console.log('\n📋 Tables in the database:');
    console.table(result.rows);
    
  } catch (err) {
    console.error('❌ Error connecting to the database:', err);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

testConnection();
