import React, { useState } from 'react';
import { poskasService } from '../../services/poskasService';
import { API_CONFIG, API_ENDPOINTS } from '../../config/constants';

const ApiTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { message, type, timestamp: new Date().toISOString() }]);
  };

  const testApiConnection = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      addResult('🔍 Testing API connection...', 'info');
      
      // Test 1: Check API config
      addResult(`🔗 Base URL: ${API_CONFIG.BASE_URL}`, 'info');
      addResult(`🎯 Owner endpoint: ${API_ENDPOINTS.POSKAS.OWNER.LIST}`, 'info');
      addResult(`📊 Stats endpoint: ${API_ENDPOINTS.POSKAS.OWNER.STATS}`, 'info');
      
      // Test 2: Test owner poskas endpoint
      addResult('📋 Testing getOwnerPoskas...', 'info');
      try {
        const poskasResponse = await poskasService.getOwnerPoskas({ page: 1, limit: 5 });
        addResult(`✅ getOwnerPoskas success: ${JSON.stringify(poskasResponse).substring(0, 200)}...`, 'success');
      } catch (error) {
        addResult(`❌ getOwnerPoskas failed: ${error.message}`, 'error');
        if (error.response) {
          addResult(`📊 Status: ${error.response.status}`, 'error');
          addResult(`📋 Data: ${JSON.stringify(error.response.data).substring(0, 200)}...`, 'error');
        }
      }
      
      // Test 3: Test stats endpoint
      addResult('📊 Testing getOwnerPoskasStats...', 'info');
      try {
        const statsResponse = await poskasService.getOwnerPoskasStats({ year: 2024 });
        addResult(`✅ getOwnerPoskasStats success: ${JSON.stringify(statsResponse).substring(0, 200)}...`, 'success');
      } catch (error) {
        addResult(`❌ getOwnerPoskasStats failed: ${error.message}`, 'error');
        if (error.response) {
          addResult(`📊 Status: ${error.response.status}`, 'error');
          addResult(`📋 Data: ${JSON.stringify(error.response.data).substring(0, 200)}...`, 'error');
        }
      }
      
      addResult('🏁 API test completed', 'info');
      
    } catch (error) {
      addResult(`💥 Unexpected error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">🔧 API Connection Test</h3>
      
      <div className="mb-4 space-x-2">
        <button
          onClick={testApiConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test API Connection'}
        </button>
        
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Clear Results
        </button>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {testResults.map((result, index) => (
          <div
            key={index}
            className={`p-3 rounded text-sm font-mono ${
              result.type === 'error' ? 'bg-red-100 text-red-800' :
              result.type === 'success' ? 'bg-green-100 text-green-800' :
              'bg-blue-100 text-blue-800'
            }`}
          >
            <span className="text-xs text-gray-500">{result.timestamp}</span>
            <br />
            {result.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiTest;






























