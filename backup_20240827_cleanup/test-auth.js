const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Database configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Love_rose_db',
  password: 'Roximar2025',
  port: 5432,
});

// Create a test user
async function createTestUser() {
  const client = await pool.connect();
  try {
    // Start transaction
    await client.query('BEGIN');
    
    // Check if test user already exists
    const userCheck = await client.query(
      'SELECT id FROM "Users" WHERE email = $1',
      ['test@example.com']
    );
    
    if (userCheck.rows.length > 0) {
      console.log('✅ Test user already exists');
      return userCheck.rows[0];
    }
    
    // Create test user
    const hashedPassword = await bcrypt.hash('test1234', 10);
    const result = await client.query(
      'INSERT INTO "Users" (email, password, is_active, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id, email',
      ['test@example.com', hashedPassword, true]
    );
    
    await client.query('COMMIT');
    console.log('✅ Test user created successfully');
    return result.rows[0];
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating test user:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    'your_jwt_secret', // Use your actual JWT secret from .env
    { expiresIn: '30d' }
  );
}

// Test authentication
async function testAuth() {
  try {
    // Create test user
    const user = await createTestUser();
    
    // Generate token
    const token = generateToken(user);
    console.log('\n🔑 Test JWT Token:');
    console.log(token);
    
    // Test API endpoint
    console.log('\n🔍 Test the API with this curl command:');
    console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:5000/api/notifications`);
    
  } catch (error) {
    console.error('❌ Error in test:', error);
  } finally {
    await pool.end();
  }
}

testAuth();
