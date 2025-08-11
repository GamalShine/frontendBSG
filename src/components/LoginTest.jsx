import React, { useState } from 'react'
import { LogIn, TestTube, CheckCircle, XCircle } from 'lucide-react'
import api from '../services/api'

const LoginTest = () => {
  const [testResults, setTestResults] = useState([])
  const [isTesting, setIsTesting] = useState(false)
  const [credentials, setCredentials] = useState({
    email: 'admin@bosgil.com',
    password: 'admin123'
  })

  const runLoginTest = async () => {
    setIsTesting(true)
    setTestResults([])

    try {
      // Test 1: Login
      console.log('🧪 Test 1: Login...')
      const loginResponse = await api.post('/auth/login', credentials)
      
      if (loginResponse.data.success) {
        const token = loginResponse.data.data.token
        localStorage.setItem('token', token)
        
        setTestResults(prev => [...prev, {
          name: 'Login',
          success: true,
          message: 'Login successful'
        }])

        // Test 2: Create poskas with valid token
        console.log('🧪 Test 2: Create poskas...')
        const formData = new FormData()
        formData.append('tanggal_poskas', '2024-01-15')
        formData.append('isi_poskas', 'Test laporan pos kas dari login test')

        const poskasResponse = await api.post('/keuangan-poskas', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        if (poskasResponse.data.success) {
          setTestResults(prev => [...prev, {
            name: 'Create Poskas',
            success: true,
            message: 'Poskas created successfully'
          }])
        } else {
          setTestResults(prev => [...prev, {
            name: 'Create Poskas',
            success: false,
            message: poskasResponse.data.message
          }])
        }

      } else {
        setTestResults(prev => [...prev, {
          name: 'Login',
          success: false,
          message: loginResponse.data.message
        }])
      }

    } catch (error) {
      console.error('❌ Test failed:', error)
      setTestResults(prev => [...prev, {
        name: error.config?.url?.includes('login') ? 'Login' : 'Create Poskas',
        success: false,
        message: error.response?.data?.message || error.message
      }])
    }

    setIsTesting(false)
  }

  return (
    <div className="fixed top-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 max-w-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 flex items-center">
          <LogIn className="h-4 w-4 mr-2" />
          Login & Poskas Test
        </h3>
        <button
          onClick={runLoginTest}
          disabled={isTesting}
          className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 disabled:opacity-50 flex items-center"
        >
          {isTesting ? (
            <TestTube className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <TestTube className="h-3 w-3 mr-1" />
          )}
          Test
        </button>
      </div>

      <div className="text-xs text-gray-500 mb-2">
        Email: {credentials.email}
      </div>

      {testResults.length > 0 && (
        <div className="space-y-2">
          {testResults.map((result, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span className="text-gray-700">{result.name}</span>
              <div className="flex items-center">
                {result.success ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {testResults.some(r => !r.success && r.message) && (
        <div className="mt-3 p-2 bg-red-50 rounded text-xs text-red-700">
          <div className="font-medium mb-1">Errors:</div>
          {testResults
            .filter(r => !r.success && r.message)
            .map((result, index) => (
              <div key={index} className="mb-1">
                <strong>{result.name}:</strong> {result.message}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export default LoginTest 