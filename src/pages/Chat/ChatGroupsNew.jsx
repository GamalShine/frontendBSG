import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { chatGroupService } from '../../services/chatService'
import { 
  Search, 
  MessageCircle, 
  Send, 
  Users,
  Plus,
  Settings,
  Trash2,
  UserPlus
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const ChatGroupsNew = () => {
  const { user } = useAuth()
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [newGroupData, setNewGroupData] = useState({
    group_name: '',
    group_description: ''
  })

  useEffect(() => {
    if (user) {
      loadGroups()
    }
  }, [user])

  const loadGroups = async () => {
    try {
      setLoading(true)
      const response = await chatGroupService.getChatGroups()
      
      if (response.success) {
        setGroups(response.data || [])
      } else {
        console.warn('Groups response not successful:', response)
        setGroups([])
      }
    } catch (error) {
      console.error('Error loading groups:', error)
      toast.error('Gagal memuat daftar grup')
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  const selectGroup = async (group) => {
    try {
      setLoading(true)
      setSelectedGroup(group)
      
      // Load group messages
      const messagesResponse = await chatGroupService.getGroupMessages(group.group_id)
      
      if (messagesResponse.success) {
        setMessages(messagesResponse.data || [])
      } else {
        console.warn('Messages response not successful:', messagesResponse)
        setMessages([])
      }
    } catch (error) {
      console.error('Error selecting group:', error)
      toast.error('Gagal membuka grup chat')
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const sendGroupMessage = async () => {
    if (!newMessage.trim() || !selectedGroup) return

    try {
      const response = await chatGroupService.sendGroupMessage(selectedGroup.group_id, {
        sender_id: user.id,
        message: newMessage.trim(),
        message_type: 'text'
      })
      
      if (response.success) {
        const newMessageData = response.data
        setMessages(prev => [...prev, newMessageData])
        setNewMessage('')
      } else {
        toast.error('Gagal mengirim pesan')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Gagal mengirim pesan')
    }
  }

  const createGroup = async () => {
    if (!newGroupData.group_name.trim()) {
      toast.error('Nama grup harus diisi')
      return
    }

    try {
      const response = await chatGroupService.createChatGroup({
        group_name: newGroupData.group_name.trim(),
        group_description: newGroupData.group_description.trim(),
        created_by: user.id
      })
      
      if (response.success) {
        toast.success('Grup berhasil dibuat')
        setShowCreateGroup(false)
        setNewGroupData({ group_name: '', group_description: '' })
        loadGroups() // Reload groups
      } else {
        toast.error('Gagal membuat grup')
      }
    } catch (error) {
      console.error('Error creating group:', error)
      toast.error('Gagal membuat grup')
    }
  }

  const deleteGroup = async (group) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus grup ini?')) {
      return
    }

    try {
      const response = await chatGroupService.deleteChatGroup(group.group_id)
      if (response.success) {
        toast.success('Grup berhasil dihapus')
        if (selectedGroup?.group_id === group.group_id) {
          setSelectedGroup(null)
          setMessages([])
        }
        loadGroups() // Reload groups
      } else {
        toast.error('Gagal menghapus grup')
      }
    } catch (error) {
      console.error('Error deleting group:', error)
      toast.error('Gagal menghapus grup')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendGroupMessage()
    }
  }

  const isGroupAdmin = (group) => {
    return group.created_by === user.id
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredGroups = groups.filter(group =>
    group.group_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-full bg-gray-50">
      {/* Groups Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">Chat Grup</h2>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Cari grup..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Groups List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? 'Tidak ada grup yang ditemukan' : 'Tidak ada grup'}
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div
                key={group.group_id}
                onClick={() => selectGroup(group)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedGroup?.group_id === group.group_id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {group.group_name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {group.group_description || 'Tidak ada deskripsi'}
                      </p>
                    </div>
                  </div>
                  {isGroupAdmin(group) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteGroup(group)
                      }}
                      className="p-1 text-red-400 hover:text-red-600"
                      title="Hapus grup"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedGroup ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedGroup.group_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedGroup.group_description || 'Tidak ada deskripsi'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <UserPlus className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Settings className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Belum ada pesan</p>
                  <p className="text-sm">Mulai percakapan dengan mengirim pesan</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === user.id
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      {message.sender_id !== user.id && (
                        <p className="text-xs font-medium mb-1 opacity-70">
                          {message.sender?.nama || 'Unknown'}
                        </p>
                      )}
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_id === user.id ? 'text-green-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ketik pesan..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendGroupMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Pilih grup untuk memulai chat
              </h3>
              <p className="text-gray-500">
                Pilih grup dari daftar di sebelah kiri untuk memulai percakapan
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Buat Grup Baru</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Grup *
                </label>
                <input
                  type="text"
                  value={newGroupData.group_name}
                  onChange={(e) => setNewGroupData(prev => ({ ...prev, group_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan nama grup"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={newGroupData.group_description}
                  onChange={(e) => setNewGroupData(prev => ({ ...prev, group_description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan deskripsi grup (opsional)"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex space-x-2 mt-6">
              <button
                onClick={() => setShowCreateGroup(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={createGroup}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Buat Grup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatGroupsNew 