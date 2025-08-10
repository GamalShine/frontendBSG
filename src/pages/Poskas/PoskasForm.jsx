import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, DollarSign, Calendar } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Card, { CardHeader, CardBody, CardFooter } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import RichTextEditor from '../../components/UI/RichTextEditor'
import ContentPreview from '../../components/UI/ContentPreview'
import { poskasService } from '../../services/poskasService'
import toast from 'react-hot-toast'

const PosKasForm = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    tanggal_poskas: new Date().toISOString().split('T')[0],
    isi_poskas: ''
  })
  const [errors, setErrors] = useState({})
  const [uploadedFiles, setUploadedFiles] = useState([])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleFilesChange = (files) => {
    console.log('📁 Form received files:', files.length);
    files.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    });
    setUploadedFiles(files)
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.tanggal_poskas) {
      newErrors.tanggal_poskas = 'Tanggal pos kas harus diisi'
    }
    
    if (!formData.isi_poskas.trim()) {
      newErrors.isi_poskas = 'Isi laporan pos kas harus diisi'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Anda harus login terlebih dahulu')
        navigate('/login')
        return
      }

      console.log('🔑 Token available:', !!token)
      console.log('👤 Current user:', user)
      console.log('📁 Files to upload:', uploadedFiles.length)
      uploadedFiles.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
      });

      console.log('📝 Form content:');
      console.log('   tanggal_poskas:', formData.tanggal_poskas);
      console.log('   isi_poskas length:', formData.isi_poskas.length);
      console.log('   isi_poskas content:', formData.isi_poskas.substring(0, 100) + '...');

      // Prepare data for API
      const poskasData = {
        tanggal_poskas: formData.tanggal_poskas,
        isi_poskas: formData.isi_poskas,
        images: uploadedFiles
      }

      console.log('📤 Sending poskas data:', {
        tanggal_poskas: poskasData.tanggal_poskas,
        isi_poskas_length: poskasData.isi_poskas.length,
        images_count: poskasData.images.length
      })

      const response = await poskasService.createPoskas(poskasData)
      
      console.log('📥 Response from API:', response)
      
      if (response.success) {
        toast.success('Laporan pos kas berhasil ditambahkan!')
        navigate('/poskas')
      } else {
        toast.error(response.message || 'Gagal menambahkan laporan pos kas')
      }
    } catch (error) {
      console.error('❌ Error adding poskas:', error)
      console.error('❌ Error details:', error.response?.data)
      toast.error('Gagal menambahkan laporan pos kas. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/poskas')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tambah Pos Kas Baru</h1>
            <p className="text-gray-600 mt-1">Buat pos kas baru untuk keuangan</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Form Pos Kas</h3>
              <p className="text-sm text-gray-600">Lengkapi informasi pos kas di bawah ini</p>
            </div>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tanggal Pos Kas */}
              <div className="md:col-span-2">
                <Input
                  label="Tanggal Pos Kas"
                  name="tanggal_poskas"
                  type="date"
                  value={formData.tanggal_poskas}
                  onChange={handleChange}
                  placeholder="Pilih tanggal"
                  error={errors.tanggal_poskas}
                  required
                />
              </div>

              {/* Isi Pos Kas dengan Rich Text Editor */}
              <div className="md:col-span-2">
                <RichTextEditor
                  label="Isi Laporan Pos Kas"
                  name="isi_poskas"
                  value={formData.isi_poskas}
                  onChange={handleChange}
                  onFilesChange={handleFilesChange}
                  placeholder="Jelaskan isi laporan pos kas... Anda bisa paste gambar langsung dari clipboard atau gunakan toolbar untuk upload file"
                  error={errors.isi_poskas}
                  rows={8}
                  required
                />
              </div>
            </div>
          </CardBody>

          <CardFooter>
            <div className="flex items-center justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Simpan Laporan Pos Kas
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* Info Card */}
      <Card>
        <CardBody>
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Tips Membuat Laporan Pos Kas</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Pastikan tanggal laporan sesuai dengan tanggal transaksi</li>
                <li>• Isi laporan dengan detail dan jelas tentang kegiatan dan transaksi</li>
                <li>• Gunakan toolbar untuk formatting teks (bold, italic, dll)</li>
                <li>• Paste gambar langsung dari clipboard atau gunakan tombol gambar untuk upload</li>
                <li>• File gambar akan tersimpan di server dan dapat diakses kembali</li>
                <li>• Pastikan semua informasi yang relevan sudah terisi</li>
                <li>• Laporan harus dapat dibaca dan dipahami oleh pihak lain</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Preview Laporan</h3>
        </CardHeader>
        <CardBody>
          <ContentPreview 
            content={formData.isi_poskas}
            tanggal={formData.tanggal_poskas}
            showStats={true}
            maxLength={null}
          />
        </CardBody>
      </Card>
    </div>
  )
}

export default PosKasForm 