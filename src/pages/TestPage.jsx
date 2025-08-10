import React from 'react'

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          Test Page - Sistem Bosgil Group
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Jika Anda melihat halaman ini, berarti aplikasi React berjalan dengan baik!
        </p>
        
        <div className="space-y-4">
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">✅ Status</h3>
            <p className="text-green-600">Frontend berjalan normal</p>
          </div>
          
          <div className="bg-blue-100 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">🔧 Debug Info</h3>
            <p className="text-blue-600">React: {React.version}</p>
            <p className="text-blue-600">Environment: {import.meta.env.MODE}</p>
          </div>
          
          <div className="bg-yellow-100 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800">⚠️ Next Steps</h3>
            <p className="text-yellow-600">Periksa console browser untuk error messages</p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ke Halaman Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default TestPage 