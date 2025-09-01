const express = require('express');
const { Sequelize } = require('sequelize');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Express app
const app = express();
const PORT = 5001; // Different port to avoid conflicts

// Database connection
const sequelize = new Sequelize('Love_rose_db', 'postgres', 'Roximar2025', {
  host: 'localhost',
  dialect: 'postgres',
  logging: console.log
});

// Test database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to the database');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
}

// Middleware
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Login endpoint for testing
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // In a real app, you would query the database
    if (email === 'test@example.com') {
      const isMatch = await bcrypt.compare(password, '$2a$10$XFDq3wL8X5y6X5X5X5X5Xe');
      
      if (isMatch) {
        const token = jwt.sign(
          { id: 1, email: 'test@example.com' },
          'your_jwt_secret',
          { expiresIn: '30d' }
        );
        
        return res.json({ token });
      }
    }
    
    res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected route
app.get('/api/protected', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    res.json({ message: 'Protected data', user: decoded });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Start the server
async function startServer() {
  await testConnection();
  
  app.listen(PORT, () => {
    console.log(`\n🚀 Test server running on http://localhost:${PORT}`);
    console.log('\nEndpoints:');
    console.log(`- GET  http://localhost:${PORT}/api/test`);
    console.log(`- POST http://localhost:${PORT}/api/auth/login`);
    console.log(`- GET  http://localhost:${PORT}/api/protected (requires token)`);
    console.log('\nTest user: test@example.com / test1234');
  });
}

startServer();
