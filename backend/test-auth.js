// TEST SCRIPT - Run this to verify auth is working
// Save as test-auth.js and run: node test-auth.js

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testAuth() {
  console.log('🧪 Starting authentication tests...\n');
  
  let token = null;
  
  try {
    // Test 1: Register a new user
    console.log('📝 Test 1: Registering new user...');
    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    });
    
    console.log('✅ Registration successful!');
    console.log('User:', registerResponse.data.user);
    console.log('Token received:', registerResponse.data.token.substring(0, 50) + '...');
    
    token = registerResponse.data.token;
    
    // Test 2: Verify token format
    console.log('\n🔍 Test 2: Verifying token format...');
    const parts = token.split('.');
    console.log('Token parts:', parts.length, '(should be 3)');
    
    if (parts.length !== 3) {
      console.log('❌ Invalid JWT format!');
      return;
    }
    console.log('✅ Token format is correct');
    
    // Test 3: Get user profile with token
    console.log('\n👤 Test 3: Getting user profile with token...');
    const meResponse = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Profile fetched successfully!');
    console.log('User:', meResponse.data);
    
    // Test 4: Create a goal
    console.log('\n📋 Test 4: Creating a goal...');
    const goalResponse = await axios.post(`${API_URL}/goals`, 
      {
        title: 'Test Goal',
        description: 'This is a test goal',
        status: 'in-progress'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('✅ Goal created successfully!');
    console.log('Goal:', goalResponse.data);
    
    // Test 5: Get all goals
    console.log('\n📋 Test 5: Getting all goals...');
    const goalsResponse = await axios.get(`${API_URL}/goals`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Goals fetched successfully!');
    console.log('Goals count:', goalsResponse.data.length);
    
    console.log('\n🎉 All tests passed! Authentication is working correctly.');
    
  } catch (error) {
    console.log('\n❌ Test failed!');
    console.log('Error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
    
    if (error.response?.status === 401) {
      console.log('\n🔍 Debugging 401 error:');
      console.log('Request headers:', error.config?.headers);
      console.log('Token used:', token ? token.substring(0, 50) + '...' : 'NO TOKEN');
    }
  }
}

testAuth();
