// Step-by-step server diagnostics
import express from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 YAHSHUA Server Diagnostics');
console.log('=' .repeat(40));

const app = express();
const port = 3004;

// Test 1: Basic Express
console.log('✅ Step 1: Express imported successfully');

// Test 2: Basic middleware
app.use(express.json());
console.log('✅ Step 2: Basic middleware setup');

// Test 3: Simple route
app.get('/diagnostic', (req, res) => {
  res.json({ 
    message: 'Diagnostic endpoint working',
    timestamp: new Date().toISOString(),
    port: port
  });
});
console.log('✅ Step 3: Basic route setup');

// Test 4: Try importing our services
console.log('🔍 Step 4: Testing service imports...');

try {
  // Import database connection first
  const { connectDatabase } = await import('./database/prisma.js');
  console.log('✅ Step 4a: Prisma import successful');
  
  try {
    // Test database connection
    const dbConnected = await connectDatabase();
    console.log(`✅ Step 4b: Database connection: ${dbConnected ? 'SUCCESS' : 'FAILED'}`);
  } catch (dbError) {
    console.log('❌ Step 4b: Database connection failed:', dbError.message);
  }
  
} catch (importError) {
  console.log('❌ Step 4a: Prisma import failed:', importError.message);
}

try {
  // Import services
  const services = await import('./database/services.js');
  console.log('✅ Step 5: Services import successful');
  console.log('Available services:', Object.keys(services));
} catch (serviceError) {
  console.log('❌ Step 5: Services import failed:', serviceError.message);
}

// Test 6: Start server
console.log('🔍 Step 6: Starting diagnostic server...');

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Diagnostic server running on http://localhost:${port}/diagnostic`);
  console.log('🎯 Test this URL to confirm basic server functionality');
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.log('❌ Uncaught Exception:', error);
});
