'use client';

import { useEffect, useState } from 'react';

interface ApiTest {
  endpoint: string;
  status: 'pending' | 'success' | 'failed';
  response?: any;
  error?: string;
}

function TestCard({ test }: { test: ApiTest }) {
  return (
    <div 
      className={`p-3 rounded-lg border-2 ${
        test.status === 'pending' ? 'border-yellow-300 bg-yellow-50' :
        test.status === 'success' ? 'border-green-300 bg-green-50' :
        'border-red-300 bg-red-50'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">
          {test.status === 'pending' && '⏳'} 
          {test.status === 'success' && '✅'} 
          {test.status === 'failed' && '❌'} 
          {test.endpoint}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          test.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
          test.status === 'success' ? 'bg-green-200 text-green-800' :
          'bg-red-200 text-red-800'
        }`}>
          {test.status.toUpperCase()}
        </span>
      </div>
      
      {test.error && (
        <p className="text-red-600 text-xs mb-2">Error: {test.error}</p>
      )}
      
      {test.response && (
        <details className="mt-2">
          <summary className="cursor-pointer text-blue-600 hover:text-blue-800 text-xs">
            View Response
          </summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto max-h-32 overflow-y-auto">
            {JSON.stringify(test.response, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

export default function ApiTestPage() {
  const [tests, setTests] = useState<ApiTest[]>([
    // Core System
    { endpoint: '/health', status: 'pending' },
    
    // Authentication Routes (GET only for testing)
    { endpoint: '/api/auth/me', status: 'pending' },
    
    // Authentication & Validation
    { endpoint: '/api/validate/org-slug/test-org', status: 'pending' },
    { endpoint: '/api/validate/username/testuser', status: 'pending' },
    { endpoint: '/api/validate/email/test@example.com', status: 'pending' },
    
    // Universal Technology APIs
    { endpoint: '/api/projects', status: 'pending' },
    { endpoint: '/api/solar', status: 'pending' },
    { endpoint: '/api/wind', status: 'pending' },
    { endpoint: '/api/hydro', status: 'pending' },
    { endpoint: '/api/geothermal', status: 'pending' },
    { endpoint: '/api/biomass', status: 'pending' },
    { endpoint: '/api/ocean', status: 'pending' },
    { endpoint: '/api/hybrid', status: 'pending' },
    
    // Universal Framework APIs
    { endpoint: '/api/resource-assessment', status: 'pending' },
    { endpoint: '/api/compliance', status: 'pending' },
    { endpoint: '/api/financial', status: 'pending' },
    { endpoint: '/api/data-sources', status: 'pending' },
    { endpoint: '/api/users/me', status: 'pending' },
  ]);

  const [isRunning, setIsRunning] = useState(true); // Start as running
  const [hasStarted, setHasStarted] = useState(false);

  const runTests = async () => {
    console.log('🚀 Starting comprehensive API tests...');
    setIsRunning(true);
    setHasStarted(true);
    
    // Reset all tests to pending
    setTests(prev => prev.map(test => ({ ...test, status: 'pending' as const, response: undefined, error: undefined })));
    
    const updatedTests: ApiTest[] = [
      // Core System
      { endpoint: '/health', status: 'pending' },
      
      // Authentication & Validation
      { endpoint: '/api/validate/org-slug/test-org', status: 'pending' },
      { endpoint: '/api/validate/username/testuser', status: 'pending' },
      { endpoint: '/api/validate/email/test@example.com', status: 'pending' },
      
      // Universal Technology APIs
      { endpoint: '/api/projects', status: 'pending' },
      { endpoint: '/api/solar', status: 'pending' },
      { endpoint: '/api/wind', status: 'pending' },
      { endpoint: '/api/hydro', status: 'pending' },
      { endpoint: '/api/geothermal', status: 'pending' },
      { endpoint: '/api/biomass', status: 'pending' },
      { endpoint: '/api/ocean', status: 'pending' },
      { endpoint: '/api/hybrid', status: 'pending' },
      
      // Universal Framework APIs
      { endpoint: '/api/resource-assessment', status: 'pending' },
      { endpoint: '/api/compliance', status: 'pending' },
      { endpoint: '/api/financial', status: 'pending' },
      { endpoint: '/api/data-sources', status: 'pending' },
      { endpoint: '/api/users/me', status: 'pending' },
    ];

    for (let i = 0; i < updatedTests.length; i++) {
      const test = updatedTests[i];
      console.log(`🔄 Testing ${test.endpoint}... (${i + 1}/${updatedTests.length})`);
      try {
        const response = await fetch(test.endpoint);
        console.log(`📡 Response for ${test.endpoint}:`, response.status, response.ok);
        if (response.ok) {
          const data = await response.json();
          test.status = 'success';
          test.response = data;
          console.log(`✅ Success for ${test.endpoint}:`, data);
        } else {
          test.status = 'failed';
          test.error = `HTTP ${response.status}`;
          console.log(`❌ Failed for ${test.endpoint}:`, response.status);
        }
      } catch (error) {
        test.status = 'failed';
        test.error = error instanceof Error ? error.message : 'Unknown error';
        console.log(`💥 Error for ${test.endpoint}:`, error);
      }
      
      setTests([...updatedTests]);
      await new Promise(resolve => setTimeout(resolve, 300)); // Smaller delay for more tests
    }
    
    console.log('🏁 All API tests completed!');
    setIsRunning(false);
  };

  useEffect(() => {
    runTests();
  }, []); // Empty dependency array to run only once

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-600">
          🔌 Frontend to Backend API Integration Test
        </h1>
        <button
          onClick={runTests}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? '⏳ Testing...' : '🔄 Retry Tests'}
        </button>
      </div>
      
      <div className="grid gap-6">
        {/* Core System */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-xl font-bold text-blue-600 mb-4">🏥 Core System</h2>
          <div className="grid gap-2">
            {tests.slice(0, 1).map((test, index) => (
              <TestCard key={index} test={test} />
            ))}
          </div>
        </div>

        {/* Authentication Routes */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-xl font-bold text-red-600 mb-4">🔐 Authentication Routes</h2>
          <div className="grid gap-2">
            {tests.slice(1, 2).map((test, index) => (
              <TestCard key={index + 1} test={test} />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Note: /api/auth/me will fail without authentication token</p>
        </div>

        {/* Validation & Public Auth */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-xl font-bold text-green-600 mb-4">✅ Validation & Public Auth</h2>
          <div className="grid gap-2">
            {tests.slice(2, 5).map((test, index) => (
              <TestCard key={index + 2} test={test} />
            ))}
          </div>
        </div>

        {/* Universal Technology APIs */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-xl font-bold text-purple-600 mb-4">🚀 Universal Technology APIs</h2>
          <div className="grid gap-2">
            {tests.slice(5, 13).map((test, index) => (
              <TestCard key={index + 5} test={test} />
            ))}
          </div>
        </div>

        {/* Universal Framework APIs */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-xl font-bold text-orange-600 mb-4">🌐 Universal Framework APIs</h2>
          <div className="grid gap-2">
            {tests.slice(13).map((test, index) => (
              <TestCard key={index + 13} test={test} />
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
          <h2 className="font-semibold text-blue-800 mb-2">📊 Test Results Summary</h2>
          <div className="space-y-1 text-sm">
            <p className="text-green-700">✅ Success: {tests.filter(t => t.status === 'success').length}</p>
            <p className="text-red-700">❌ Failed: {tests.filter(t => t.status === 'failed').length}</p>
            <p className="text-yellow-700">⏳ Pending: {tests.filter(t => t.status === 'pending').length}</p>
            <p className="text-blue-700 font-semibold">Total: {tests.length} endpoints</p>
          </div>
        </div>
        
        <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
          <h2 className="font-semibold text-green-800 mb-2">🎯 Coverage Report</h2>
          <div className="space-y-1 text-sm">
            <p>🏥 Core System: 1 endpoint</p>
            <p>🔐 Auth/Validation: 3 endpoints</p>
            <p>🚀 Technology APIs: 8 endpoints</p>
            <p>🌐 Framework APIs: 5 endpoints</p>
          </div>
          {tests.filter(t => t.status === 'success').length === tests.length && (
            <div className="mt-2 p-2 bg-green-200 rounded text-green-800 text-xs font-semibold">
              🎉 ALL SYSTEMS OPERATIONAL!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
