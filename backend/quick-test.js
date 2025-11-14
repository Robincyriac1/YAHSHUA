const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function quickTest() {
  console.log('🚀 Quick API Test');
  console.log('=================');
  
  try {
    // Test a few key endpoints
    const tests = [
      { name: 'Health Check', url: '/health' },
      { name: 'Projects API', url: '/api/projects' },
      { name: 'Solar API', url: '/api/solar' },
      { name: 'Validation API', url: '/api/validate/org-slug/test-org' }
    ];
    
    let passed = 0;
    let total = tests.length;
    
    for (const test of tests) {
      try {
        const response = await axios.get(`${BASE_URL}${test.url}`, { timeout: 5000 });
        console.log(`✅ ${test.name} - Status: ${response.status}`);
        passed++;
      } catch (error) {
        console.log(`❌ ${test.name} - Error: ${error.code || error.message || 'Unknown error'}`);
      }
    }
    
    console.log('\n📊 Results:');
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`📈 Success Rate: ${((passed/total) * 100).toFixed(1)}%`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! APIs are working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Check server status.');
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

quickTest();
