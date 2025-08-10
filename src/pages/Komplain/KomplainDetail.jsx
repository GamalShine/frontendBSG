import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, Calendar, User, AlertTriangle, Download, Share2 } from 'lucide-react'
import { formatDate } from '../../utils/helpers'
import Card, { CardHeader, CardBody } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Badge from '../../components/UI/Badge'
import { komplainService } from '../../services/komplainService'
import toast from 'react-hot-toast'

const KomplainDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [komplain, setKomplain] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadKomplain = async () => {
      try {
        setLoading(true)
        const response = await komplainService.getKomplainById(id)
        console.log('📥 Komplain Detail API Response:', response)
        
        // Handle different response formats
        let komplainData = null
        if (response.success && response.data) {
          komplainData = response.data
        } else if (response.data) {
          komplainData = response.data
        } else if (response.id) {
          komplainData = response
        }
        
        setKomplain(komplainData)
      } catch (error) {
        console.error('Error loading komplain detail:', error)
        toast.error('Gagal memuat detail komplain')
        navigate('/komplain')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadKomplain()
    }
  }, [id, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat detail komplain...</p>
        </div>
      </div>
    )
  }

  if (!komplain) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Komplain tidak ditemukan</h3>
        <p className="mt-1 text-sm text-gray-500">Komplain yang Anda cari tidak ada atau telah dihapus.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/komplain')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Komplain</h1>
            <p className="mt-1 text-sm text-gray-600">
              Informasi lengkap komplain #{komplain.id}
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate(`/komplain/${id}/edit`)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{komplain.judul_komplain}</h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Status and Priority */}
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1">
                <Badge variant="primary">
                  {komplain.status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Prioritas</label>
              <div className="mt-1">
                <Badge variant="warning">
                  {komplain.prioritas}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Kategori</label>
              <div className="mt-1">
                <Badge variant="default">
                  {komplain.kategori}
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700">Deskripsi</label>
            <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
              {komplain.deskripsi_komplain}
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Tanggal Pelaporan</label>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(komplain.tanggal_pelaporan)}
              </p>
            </div>
            {komplain.target_selesai && (
              <div>
                <label className="text-sm font-medium text-gray-700">Target Selesai</label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(komplain.target_selesai)}
                </p>
              </div>
            )}
          </div>

          {/* Attachments */}
          {komplain.lampiran && (
            <div>
              <label className="text-sm font-medium text-gray-700">Lampiran</label>
              <div className="mt-2 space-y-2">
                {JSON.parse(komplain.lampiran).map((file, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary-100 rounded flex items-center justify-center">
                        <span className="text-primary-600 text-sm font-medium">
                          {file.name.split('.').pop().toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default KomplainDetail 