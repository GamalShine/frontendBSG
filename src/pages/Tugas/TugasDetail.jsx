import React from 'react'
import { CheckSquare } from 'lucide-react'

const TugasDetail = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Detail Tugas</h1>
        <p className="mt-1 text-sm text-gray-600">
          Informasi lengkap tugas
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-12 text-center">
          <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Detail Tugas</h3>
          <p className="mt-1 text-sm text-gray-500">
            Implementasi halaman detail tugas akan ditambahkan di sini.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TugasDetail 