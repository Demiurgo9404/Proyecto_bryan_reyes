const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const API_URL = 'http://localhost:5000/api';

async function testAuth() {
  try {
    // 1. Test login with test user
    console.log('🔐 Testing login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'test1234'
    });
    
    const { token } = loginResponse.data;
    console.log('✅ Login successful');
    
    // 2. Test protected notifications endpoint
    console.log('\n📨 Testing notifications endpoint...');
    const notificationsResponse = await axios.get(`${API_URL}/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Notifications retrieved successfully');
    console.log('📋 Notifications:', notificationsResponse.data);
    
    // 3. Test stories endpoint
    console.log('\n📱 Testing stories endpoint...');
    const storiesResponse = await axios.get(`${API_URL}/stories`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Stories retrieved successfully');
    console.log('📋 Stories:', storiesResponse.data);
    
  } catch (error) {
    console.error('❌ Test failed:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error:', error.message);
    }
  }
}

testAuth();
