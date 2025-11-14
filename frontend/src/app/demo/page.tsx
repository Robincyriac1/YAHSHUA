'use client';

import { useEffect, useState } from 'react';

interface ApiResponse {
  endpoint: string;
  status: 'loading' | 'success' | 'error';
  data?: any;
  error?: string;
  timestamp?: string;
}

export default function LiveDemo() {
  const [responses, setResponses] = useState<ApiResponse[]>([
    { endpoint: '/health', status: 'loading' },
    { endpoint: '/api/projects', status: 'loading' },
    { endpoint: '/api/solar', status: 'loading' },
    { endpoint: '/api/validate/org-slug/demo-org', status: 'loading' },
  ]);

  const [refreshCount, setRefreshCount] = useState(0);

  const testEndpoint = async (endpoint: string, index: number) => {
    // Using proxied endpoints (no baseUrl needed)
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setResponses(prev => prev.map((item, i) => 
          i === index ? {
            ...item,
            status: 'success' as const,
            data,
            timestamp: new Date().toLocaleTimeString()
          } : item
        ));
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setResponses(prev => prev.map((item, i) => 
        i === index ? {
          ...item,
          status: 'error' as const,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toLocaleTimeString()
        } : item
      ));
    }
  };

  const runAllTests = async () => {
    // Reset all to loading
    setResponses(prev => prev.map(item => ({ ...item, status: 'loading' as const })));
    setRefreshCount(prev => prev + 1);
    
    // Test each endpoint with a small delay
    for (let i = 0; i < responses.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      await testEndpoint(responses[i].endpoint, i);
    }
  };

  useEffect(() => {
    runAllTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'loading': return 'border-yellow-300 bg-yellow-50';
      case 'success': return 'border-green-300 bg-green-50';
      case 'error': return 'border-red-300 bg-red-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const successCount = responses.filter(r => r.status === 'success').length;
  const totalCount = responses.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔌 Live Frontend ↔ Backend Demo
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Real-time API communication between React frontend (port 3000) and Node.js backend (port 3001)
          </p>
          
          {/* Success Rate */}
          <div className="flex items-center justify-center space-x-6 mb-6">
            <div className={`px-6 py-3 rounded-lg font-bold text-2xl ${
              successCount === totalCount ? 'bg-green-100 text-green-800' :
              successCount > 0 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {successCount}/{totalCount} APIs Working ({Math.round((successCount/totalCount)*100)}%)
            </div>
            <div className="text-gray-500">
              Test #{refreshCount} • Last run: {responses.find(r => r.timestamp)?.timestamp || 'Never'}
            </div>
          </div>

          <button
            onClick={runAllTests}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Refresh All Tests
          </button>
        </div>

        {/* API Test Results */}
        <div className="grid gap-6 md:grid-cols-2">
          {responses.map((response, index) => (
            <div key={index} className={`p-6 rounded-xl border-2 ${getStatusColor(response.status)}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center">
                  {getStatusIcon(response.status)}
                  <span className="ml-2 font-mono text-sm">
                    GET {response.endpoint}
                  </span>
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  response.status === 'loading' ? 'bg-yellow-200 text-yellow-800' :
                  response.status === 'success' ? 'bg-green-200 text-green-800' :
                  'bg-red-200 text-red-800'
                }`}>
                  {response.status.toUpperCase()}
                </span>
              </div>

              {response.error && (
                <div className="mb-3 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
                  <strong>Error:</strong> {response.error}
                </div>
              )}

              {response.data && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    <strong>Response received at:</strong> {response.timestamp}
                  </div>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
                      📊 View Full Response Data
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto border">
                      {JSON.stringify(response.data, null, 2)}
                    </pre>
                  </details>
                </div>
              )}

              {response.status === 'loading' && (
                <div className="flex items-center text-gray-600">
                  <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full mr-2"></div>
                  Testing connection...
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Technical Details */}
        <div className="mt-8 p-6 bg-white rounded-xl border-2 border-blue-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🔧 Technical Setup</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <strong>Frontend:</strong> Next.js 15.4.6 + React 19.1.0<br/>
              <strong>Port:</strong> http://localhost:3000<br/>
              <strong>HTTP Client:</strong> fetch() with CORS
            </div>
            <div>
              <strong>Backend:</strong> Node.js + TypeScript + Express<br/>
              <strong>Port:</strong> http://localhost:3001<br/>
              <strong>CORS:</strong> Enabled for localhost:3000
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
