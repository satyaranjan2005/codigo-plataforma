// Test script for error handling
// Run this with: node Backend/test-errors.js

const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testErrorHandling() {
  console.log('🧪 Testing Error Handling Implementation\n');
  
  // Test 1: 404 Not Found
  console.log('Test 1: Testing 404 handler...');
  try {
    await axios.get(`${API_BASE}/nonexistent-route`);
  } catch (error) {
    console.log('✅ 404 Response:', error.response?.data);
  }
  
  // Test 2: Missing required fields (validation)
  console.log('\nTest 2: Testing validation (missing fields)...');
  try {
    await axios.post(`${API_BASE}/auth/register`, {
      name: 'Test User'
      // Missing sic_no, email, password
    });
  } catch (error) {
    console.log('✅ Validation Error:', error.response?.data);
  }
  
  // Test 3: Invalid email format
  console.log('\nTest 3: Testing validation (invalid email)...');
  try {
    await axios.post(`${API_BASE}/auth/register`, {
      name: 'Test User',
      sic_no: '25bcs001',
      email: 'invalid-email',
      password: 'password123'
    });
  } catch (error) {
    console.log('✅ Validation Error:', error.response?.data);
  }
  
  // Test 4: Invalid credentials (login)
  console.log('\nTest 4: Testing authentication error...');
  try {
    await axios.post(`${API_BASE}/auth/login`, {
      email: 'nonexistent@example.com',
      password: 'wrongpassword'
    });
  } catch (error) {
    console.log('✅ Auth Error:', error.response?.data);
  }
  
  // Test 5: Missing auth token
  console.log('\nTest 5: Testing unauthorized access...');
  try {
    await axios.get(`${API_BASE}/users`);
  } catch (error) {
    console.log('✅ Unauthorized Error:', error.response?.data);
  }
  
  // Test 6: Invalid JWT token
  console.log('\nTest 6: Testing invalid token...');
  try {
    await axios.get(`${API_BASE}/users`, {
      headers: { Authorization: 'Bearer invalid-token-here' }
    });
  } catch (error) {
    console.log('✅ Invalid Token Error:', error.response?.data);
  }
  
  // Test 7: Health check (success case)
  console.log('\nTest 7: Testing health check (success)...');
  try {
    const response = await axios.get(`${API_BASE}/`);
    console.log('✅ Success Response:', response.data);
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
  
  console.log('\n🎉 Error handling tests completed!');
}

// Run tests
testErrorHandling().catch(console.error);
