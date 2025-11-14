'use client';

import { useEffect, useState } from 'react';
import { Sun, Wind, Zap, TrendingUp, Users, Globe } from 'lucide-react';

interface ApiStatus {
  status: string;
  message: string;
  timestamp: string;
}

export default function Home() {
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Test backend connection
    const testBackendConnection = async () => {
      try {
        const response = await fetch('http://localhost:3001/health');
        const data = await response.json();
        setApiStatus(data);
      } catch (error) {
        setApiStatus({
          status: 'error',
          message: 'Backend connection failed',
          timestamp: new Date().toISOString()
        });
      } finally {
        setIsLoading(false);
      }
    };

    testBackendConnection();
  }, []);

  const energyTypes = [
    {
      name: 'Solar/BIPV',
      icon: Sun,
      color: 'bg-yellow-500',
      description: 'Building-Integrated Photovoltaics',
      market: '$52.3B',
      growth: '+23%'
    },
    {
      name: 'Wind Energy',
      icon: Wind,
      color: 'bg-blue-500',
      description: 'Onshore & Offshore Wind',
      market: '$96.8B',
      growth: '+18%'
    },
    {
      name: 'Energy Storage',
      icon: Zap,
      color: 'bg-purple-500',
      description: 'Battery & Grid Storage',
      market: '$31.4B',
      growth: '+35%'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">YAHSHUA</h1>
                <p className="text-sm text-gray-600">Universal Renewable Energy Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                isLoading 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : apiStatus?.status === 'healthy' || apiStatus?.status === 'partial'
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
              }`}>
                {isLoading ? 'Connecting...' : 
                 apiStatus?.status === 'healthy' ? '🟢 API Connected' :
                 apiStatus?.status === 'partial' ? '🟡 API Partial' :
                 '🔴 API Offline'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            The Future of Renewable Energy is <span className="text-gradient bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Universal</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Automate, optimize, and scale renewable energy projects across all technologies. 
            From solar BIPV to wind farms - one platform, endless possibilities.
          </p>
          <div className="mt-6 flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              $2.8T Market
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              500+ Partners
            </div>
            <div className="flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              96% Automation
            </div>
          </div>
          
          {/* Call to Action Button */}
          <div className="mt-8">
            <button
              onClick={() => window.location.href = '/demo-dashboard'}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white text-lg font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Zap className="w-5 h-5 mr-2" />
              Launch Demo Dashboard
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Experience the full renewable energy management platform (No login required)
            </p>
          </div>
        </div>

        {/* Energy Types Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {energyTypes.map((energy, index) => {
            const IconComponent = energy.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border">
                <div className="flex items-center mb-4">
                  <div className={`w-10 h-10 ${energy.color} rounded-lg flex items-center justify-center mr-3`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{energy.name}</h3>
                    <p className="text-sm text-gray-600">{energy.description}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-900">{energy.market}</span>
                  <span className="text-green-600 font-medium">{energy.growth}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Platform Features */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Platform Capabilities</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Project Automation', desc: '75-96% process automation', status: 'Coming Soon' },
              { title: 'Partner Integration', desc: '500+ API connections', status: 'In Development' },
              { title: 'Real-time Monitoring', desc: 'Live energy production', status: 'Planning' },
              { title: 'AI Optimization', desc: 'ML-powered efficiency', status: 'Research' }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{feature.desc}</p>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {feature.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* API Status */}
        {apiStatus && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">System Status</h3>
            <div className="flex items-center justify-between mb-2">
              <span>Backend API:</span>
              <span className={`font-medium ${
                apiStatus.status === 'healthy' ? 'text-green-600' : 
                apiStatus.status === 'partial' ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {apiStatus.message}
              </span>
            </div>
            {apiStatus.status === 'partial' && (
              <div className="text-sm text-yellow-600 mb-2">
                💡 Database setup pending - PostgreSQL required for full functionality
              </div>
            )}
            <div className="text-xs text-gray-500">
              Last checked: {new Date(apiStatus.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
