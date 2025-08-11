import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { chatGroupService } from '../../services/chatService'
import { userService } from '../../services/userService'
import { 
  ArrowLeft, 
  Users, 
  Search, 
  Check,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

const ChatGroupCreate = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await userService.getUsers()
      if (response.success) {
        // Filter out current user
        const filteredUsers = response.data.filter(u => u.id !== user.id)
        setUsers(filteredUsers)
      }
    } catch (error) {
      toast.error('Gagal memuat daftar pengguna')
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserSelection = (user) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id)
      if (isSelected) {
        return prev.filter(u => u.id !== user.id)
      } else {
        return [...prev, user]
      }
    })
  }

  const removeSelectedUser = (userId) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!groupName.trim()) {
      toast.error('Nama grup harus diisi')
      return
    }

    if (selectedUsers.length === 0) {
      toast.error('Pilih minimal satu anggota grup')
      return
    }

    try {
      setSubmitting(true)
      const groupData = {
        group_name: groupName.trim(),
        group_description: groupDescription.trim(),
        member_ids: selectedUsers.map(u => u.id),
        created_by: user.id
      }

      const response = await chatGroupService.createGroup(groupData)
      if (response.success) {
        toast.success('Grup berhasil dibuat')
        navigate('/chat/groups')
      }
    } catch (error) {
      toast.error('Gagal membuat grup')
      console.error('Error creating group:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isUserSelected = (userId) => {
    return selectedUsers.some(u => u.id === userId)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/chat/groups')}
          className="p-2 text-gray-400 hover:text-gray-600 mr-3"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buat Grup Chat</h1>
          <p className="text-gray-600">Buat grup baru untuk berkomunikasi dengan tim</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Group Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Grup</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-2">
                Nama Grup *
              </label>
              <input
                type="text"
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Masukkan nama grup"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Grup
              </label>
              <textarea
                id="groupDescription"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="Masukkan deskripsi grup (opsional)"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Selected Members */}
        {selectedUsers.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Anggota Terpilih ({selectedUsers.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                >
                  <span className="text-sm">{user.nama}</span>
                  <button
                    type="button"
                    onClick={() => removeSelectedUser(user.id)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pilih Anggota</h2>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Cari pengguna..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Users List */}
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Memuat pengguna...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Tidak ada pengguna ditemukan</div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => toggleUserSelection(user)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isUserSelected(user.id) ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">{user.nama}</h3>
                        <p className="text-xs text-gray-500">{user.username}</p>
                      </div>
                    </div>
                    {isUserSelected(user.id) && (
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/chat/groups')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting || !groupName.trim() || selectedUsers.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Membuat Grup...' : 'Buat Grup'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatGroupCreate 