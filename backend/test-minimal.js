// Test the minimal server
const axios = require('axios');

const BASE_URL = 'http://localhost:3005';

async function testMinimalServer() {
  console.log('🧪 Testing Minimal Server');
  console.log('========================');
  
  const endpoints = [
    '/',
    '/health', 
    '/api/hydro',
    '/api/resource-assessment'
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`, { timeout: 5000 });
      console.log(`✅ GET ${endpoint} - ${response.status} - ${response.data.message}`);
      passed++;
    } catch (error) {
      if (error.code) {
        console.log(`❌ GET ${endpoint} - ${error.code}: ${error.message}`);
      } else if (error.response) {
        console.log(`❌ GET ${endpoint} - HTTP ${error.response.status}: ${error.response.statusText}`);
      } else {
        console.log(`❌ GET ${endpoint} - ${error.message}`);
      }
      failed++;
    }
  }
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  
  if (passed > 0) {
    console.log('🎉 HTTP connectivity is working! The issue is with our main server.');
  } else {
    console.log('❌ HTTP connectivity is broken at the system level.');
  }
}

testMinimalServer();
