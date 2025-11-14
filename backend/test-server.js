// Simple test server to verify basic Express functionality
import express from 'express';

const app = express();
const port = 3003; // Different port to avoid conflicts

app.get('/', (req, res) => {
  res.json({ message: 'Simple test server working!' });
});

app.get('/test', (req, res) => {
  res.json({ 
    message: 'Test endpoint working!',
    timestamp: new Date().toISOString() 
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🧪 Test server running on http://localhost:${port}`);
  console.log(`✅ If you can access this, the basic setup works`);
});
