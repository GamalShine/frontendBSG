import React, { useState } from 'react'
import { Calendar, DollarSign, Plus, Trash2 } from 'lucide-react'
import Button from './Button'

const PoskasTemplate = ({ onTemplateSelect }) => {
  const [selectedDay, setSelectedDay] = useState('Jumat')
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }))

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
  
  const petOutlets = [
    'PET Sogil Karang',
    'PET Jongil Permata',
    'PET Bosgil Karawaci',
    'PET Bosgil BSD',
    'PET Bosgil Condet',
    'PET Bosgil Pagesangan',
    'PET Bosgil Ampel',
    'PET Bosgil Sidoarjo',
    'PET Bosgil Buah Batu',
    'PET Bosgil Bandung Kota',
    'PET Toko Tepung'
  ]

  const generateTemplate = () => {
    const template = `POSISI KAS OUTLET  
Hari : ${selectedDay}  
Tgl : ${selectedDate}

#PET
Saldo Awal
${petOutlets.join('\n')}

Jumlah Kas PET Semua `

    onTemplateSelect(template)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hari
          </label>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {days.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal
          </label>
          <input
            type="date"
            value={selectedDate.split('/').reverse().join('-')}
            onChange={(e) => {
              const date = new Date(e.target.value)
              setSelectedDate(date.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }))
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Preview Template:</h4>
        <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-white p-3 rounded border">
{`POSISI KAS OUTLET  
Hari : ${selectedDay}  
Tgl : ${selectedDate}

#PET
Saldo Awal
${petOutlets.join('\n')}

Jumlah Kas PET Semua `}
        </pre>
      </div>

      <Button
        onClick={generateTemplate}
        className="flex items-center"
      >
        <Plus className="h-4 w-4 mr-2" />
        Gunakan Template
      </Button>
    </div>
  )
}

export default PoskasTemplate 