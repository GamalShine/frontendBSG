import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, MessageSquare, User, Users } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Card, { CardHeader, CardBody, CardFooter } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import { chatService } from '../../services/chatService'
import { userService } from '../../services/userService'
import toast from 'react-hot-toast'

const ChatRoomForm = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState({
    user2_id: '',
    initial_message: ''
  })
  const [errors, setErrors] = useState({})

  // Load users for chat partner dropdown
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await userService.getUsers()
        if (response.success) {
          // Filter out current user and only show active users
          const filteredUsers = response.data.filter(u => 
            u.id !== user.id && 
            u.status === 'active' && 
            u.status_deleted === 0
          )
          setUsers(filteredUsers)
        }
      } catch (error) {
        console.error('Error loading users:', error)
        toast.error('Gagal memuat daftar user')
      }
    }
    loadUsers()
  }, [user.id])

  const userOptions = users.map(user => ({
    value: user.id.toString(),
    label: `${user.nama} (${user.username}) - ${user.role}`
  }))

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

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.user2_id) {
      newErrors.user2_id = 'Pilih user untuk chat'
    }
    
    if (formData.user2_id === user.id.toString()) {
      newErrors.user2_id = 'Tidak bisa chat dengan diri sendiri'
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

      // Prepare data for API
      const chatRoomData = {
        user2_id: parseInt(formData.user2_id),
        initial_message: formData.initial_message || null
      }

      console.log('📤 Sending chat room data:', chatRoomData)

      const response = await chatService.createChatRoom(chatRoomData.user2_id)
      
      console.log('📥 Response from API:', response)
      
      if (response.success) {
        toast.success('Chat room berhasil dibuat!')
        // Navigate to the new chat room
        if (response.data && response.data.room_id) {
          navigate(`/chat/${response.data.room_id}`)
        } else {
          navigate('/chat')
        }
      } else {
        toast.error(response.message || 'Gagal membuat chat room')
      }
    } catch (error) {
      console.error('❌ Error creating chat room:', error)
      console.error('❌ Error details:', error.response?.data)
      
      if (error.response?.status === 409) {
        toast.error('Chat room dengan user ini sudah ada')
      } else {
        toast.error('Gagal membuat chat room. Silakan coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/chat')
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
            <h1 className="text-2xl font-bold text-gray-900">Buat Chat Room Baru</h1>
            <p className="text-gray-600 mt-1">Mulai percakapan dengan user lain</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Form Chat Room</h3>
              <p className="text-sm text-gray-600">Pilih user untuk memulai percakapan</p>
            </div>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pilih User */}
              <div className="md:col-span-2">
                <Select
                  label="Pilih User untuk Chat"
                  name="user2_id"
                  value={formData.user2_id}
                  onChange={handleChange}
                  options={userOptions}
                  placeholder="Pilih user untuk memulai chat"
                  error={errors.user2_id}
                  required
                />
              </div>

              {/* Pesan Awal (Opsional) */}
              <div className="md:col-span-2">
                <Input
                  label="Pesan Awal (Opsional)"
                  name="initial_message"
                  value={formData.initial_message}
                  onChange={handleChange}
                  placeholder="Tulis pesan awal untuk memulai percakapan..."
                  error={errors.initial_message}
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
                    Membuat Chat Room...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Buat Chat Room
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
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Tips Membuat Chat Room</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Pilih user yang aktif dan online</li>
                <li>• Pastikan user yang dipilih berbeda dengan Anda</li>
                <li>• Pesan awal bersifat opsional</li>
                <li>• Chat room akan dibuat secara otomatis</li>
                <li>• Anda akan langsung diarahkan ke chat room setelah dibuat</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* User List Preview */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Daftar User Tersedia</h3>
        </CardHeader>
        <CardBody>
          {users.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((userItem) => (
                <div 
                  key={userItem.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.user2_id === userItem.id.toString()
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, user2_id: userItem.id.toString() }))}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{userItem.nama}</h4>
                      <p className="text-sm text-gray-500">@{userItem.username}</p>
                      <p className="text-xs text-gray-400 capitalize">{userItem.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada user tersedia untuk chat</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default ChatRoomForm 