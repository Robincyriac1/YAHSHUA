'use client';

import { useEffect, useState } from 'react';

export default function DebugTest() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testDirectly = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      console.log('🔄 Starting fetch request...');
      
      const response = await fetch('/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      console.log('✅ Response received:', response);
      console.log('Status:', response.status);
      console.log('OK:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 Data:', data);
      
      setResult(`SUCCESS: ${JSON.stringify(data, null, 2)}`);
      
    } catch (error) {
      console.error('❌ Error details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';
      setResult(`ERROR: ${errorMessage}\nStack: ${errorStack}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testDirectly();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">🔧 Debug Test</h1>
      
      <button 
        onClick={testDirectly}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? '⏳ Testing...' : '🔄 Test API Again'}
      </button>
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Result:</h2>
        <pre className="whitespace-pre-wrap text-sm">{result}</pre>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>• Open browser DevTools (F12) and check the Console tab</p>
        <p>• Check the Network tab for failed requests</p>
        <p>• This will show the exact error details</p>
      </div>
    </div>
  );
}
