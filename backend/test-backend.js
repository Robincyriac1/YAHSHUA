const axios = require('axios');

async function testBackend() {
  try {
    console.log('🔄 Testing backend connection...');
    const response = await axios.get('http://localhost:3001/health', {
      timeout: 5000,
      headers: {
        'Accept': 'application/json',
        'Origin': 'http://localhost:3000'
      }
    });
    
    console.log('✅ Backend responded successfully!');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Backend test failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else if (error.request) {
      console.log('No response received:', error.code);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testBackend();
