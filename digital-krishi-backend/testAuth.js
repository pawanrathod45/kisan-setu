// Test script to verify authentication
// Run: node testAuth.js

const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';

async function testAuth() {
  console.log('🧪 Testing Authentication Flow...\n');

  // Test 1: Register a new user
  console.log('1️⃣ Testing Registration...');
  try {
    const registerResponse = await axios.post(`${API_URL}/register`, {
      name: 'Test Farmer',
      phone: '9876543210',
      password: 'test123456',
      location: 'Pune',
      crop: 'Wheat',
      role: 'farmer'
    });
    console.log('✅ Registration successful:', registerResponse.data);
  } catch (err) {
    if (err.response?.status === 400) {
      console.log('⚠️  User already exists (this is okay)');
    } else {
      console.error('❌ Registration failed:', err.response?.data || err.message);
    }
  }

  console.log('\n2️⃣ Testing Login...');
  try {
    const loginResponse = await axios.post(`${API_URL}/login`, {
      phone: '9876543210',
      password: 'test123456'
    });
    console.log('✅ Login successful!');
    console.log('📱 User:', loginResponse.data.user);
    console.log('🎫 Token:', loginResponse.data.accessToken.substring(0, 50) + '...');
  } catch (err) {
    console.error('❌ Login failed:', err.response?.data || err.message);
  }

  console.log('\n✅ Test completed!');
}

testAuth();
