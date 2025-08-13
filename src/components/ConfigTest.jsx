import React, { useState } from 'react'
import { Settings, CheckCircle, XCircle, RefreshCw, ExternalLink } from 'lucide-react'
import { testConfiguration } from '../utils/configTest'
import { testApiConnection } from '../utils/testApiConnection'

const ConfigTest = () => {
  const [testResults, setTestResults] = useState(null)
  const [isTesting, setIsTesting] = useState(false)
  const [apiTestResult, setApiTestResult] = useState(null)

  const runConfigTest = async () => {
    setIsTesting(true)
    try {
      const result = testConfiguration()
      setTestResults(result)
      console.log('✅ Configuration test completed:', result)
    } catch (error) {
      console.error('❌ Configuration test failed:', error)
      setTestResults({ success: false, error: error.message })
    } finally {
      setIsTesting(false)
    }
  }

  const runApiTest = async () => {
    setIsTesting(true)
    try {
      const result = await testApiConnection()
      setApiTestResult(result)
      console.log('✅ API test completed:', result)
    } catch (error) {
      console.error('❌ API test failed:', error)
      setApiTestResult({ success: false, error: error.message })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">Configuration Test</h2>
      </div>

      <div className="space-y-4">
        {/* Configuration Test */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Base URL Configuration</h3>
          <button
            onClick={runConfigTest}
            disabled={isTesting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isTesting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {isTesting ? 'Testing...' : 'Test Configuration'}
          </button>

          {testResults && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                {testResults.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium">
                  {testResults.success ? 'Configuration Valid' : 'Configuration Error'}
                </span>
              </div>

              {testResults.config && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <h4 className="font-medium text-gray-700 mb-2">Current Configuration:</h4>
                  <div className="space-y-1 text-sm">
                    <div><span className="font-medium">API Base URL:</span> {testResults.config.BASE_URL}</div>
                    <div><span className="font-medium">WebSocket URL:</span> {testResults.config.WS_URL}</div>
                    <div><span className="font-medium">Frontend URL:</span> {testResults.config.FRONTEND_URL}</div>
                  </div>
                </div>
              )}

              {testResults.testUrls && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <h4 className="font-medium text-gray-700 mb-2">Generated URLs:</h4>
                  <div className="space-y-1 text-sm">
                    {Object.entries(testResults.testUrls).map(([key, url]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="font-medium">{key}:</span>
                        <span className="text-blue-600">{url}</span>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {testResults.validation && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <h4 className="font-medium text-gray-700 mb-2">Validation Results:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(testResults.validation).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        {value ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="font-medium">{key}:</span>
                        <span>{value ? 'OK' : 'Failed'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* API Connection Test */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-700 mb-3">API Connection Test</h3>
          <button
            onClick={runApiTest}
            disabled={isTesting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isTesting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4" />
            )}
            {isTesting ? 'Testing...' : 'Test API Connection'}
          </button>

          {apiTestResult && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                {apiTestResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium">
                  {apiTestResult.success ? 'API Connection Successful' : 'API Connection Failed'}
                </span>
              </div>

              {apiTestResult.error && (
                <div className="bg-red-50 p-3 rounded-md text-red-700 text-sm">
                  Error: {apiTestResult.error}
                </div>
              )}

              {apiTestResult.data && (
                <div className="bg-green-50 p-3 rounded-md text-green-700 text-sm">
                  Response: {JSON.stringify(apiTestResult.data, null, 2)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="font-medium text-blue-800 mb-2">How to Use:</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>1. Click "Test Configuration" to verify base URL settings</p>
            <p>2. Click "Test API Connection" to verify backend connectivity</p>
            <p>3. Check console for detailed logs</p>
            <p>4. Update .env file if needed and restart server</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfigTest 