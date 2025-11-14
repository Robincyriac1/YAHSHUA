// Minimal working Express server for testing
const express = require('express');
const app = express();
const port = 3005;

// Simple middleware
app.use(express.json());

// Test routes matching our API structure
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Minimal test server is working'
  });
});

app.get('/api/hydro', (req, res) => {
  res.json({
    message: 'Hydroelectric Systems API - Test Version',
    description: 'Simple test endpoint',
    status: 'Working'
  });
});

app.get('/api/resource-assessment', (req, res) => {
  res.json({
    message: 'Resource Assessment API - Test Version',
    description: 'Simple test endpoint',
    status: 'Working'
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Minimal YAHSHUA Test Server',
    endpoints: ['/health', '/api/hydro', '/api/resource-assessment'],
    status: 'operational'
  });
});

// Bind to all interfaces explicitly
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`🧪 Minimal test server running on http://localhost:${port}`);
  console.log(`✅ Test endpoints:`);
  console.log(`   GET http://localhost:${port}/health`);
  console.log(`   GET http://localhost:${port}/api/hydro`);
  console.log(`   GET http://localhost:${port}/api/resource-assessment`);
});

// Better error handling
server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

// Keep server alive
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
