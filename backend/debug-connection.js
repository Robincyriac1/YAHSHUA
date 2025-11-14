// Simple Node.js test to debug connection issues
const http = require('http');

console.log('🔍 Simple Connection Test');
console.log('========================');

// Test 1: Try IPv4 localhost
console.log('Testing IPv4 (127.0.0.1:3002)...');
const req1 = http.get('http://127.0.0.1:3002/health', (res) => {
  console.log(`✅ IPv4 Response: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('IPv4 Data:', data));
}).on('error', (err) => {
  console.log(`❌ IPv4 Error: ${err.message}`);
  
  // Test 2: Try IPv6 localhost if IPv4 fails
  console.log('Testing IPv6 (::1:3002)...');
  const req2 = http.get('http://[::1]:3002/health', (res) => {
    console.log(`✅ IPv6 Response: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => console.log('IPv6 Data:', data));
  }).on('error', (err) => {
    console.log(`❌ IPv6 Error: ${err.message}`);
    
    // Test 3: Try hostname localhost
    console.log('Testing hostname (localhost:3002)...');
    const req3 = http.get('http://localhost:3002/health', (res) => {
      console.log(`✅ Hostname Response: ${res.statusCode}`);
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => console.log('Hostname Data:', data));
    }).on('error', (err) => {
      console.log(`❌ Hostname Error: ${err.message}`);
    });
  });
});
