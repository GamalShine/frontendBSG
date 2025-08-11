import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { chatGroupService } from '../../services/chatService'
import { 
  Search, 
  MessageCircle, 
  Send, 
  MoreVertical,
  Users,
  Plus,
  Settings
} from 'lucide-react'
import toast from 'react-hot-toast'

const ChatGroups = () => {
  const { user } = useAuth()
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user) {
      loadGroups()
    }
  }, [user])

  const loadGroups = async () => {
    try {
      setLoading(true)
      console.log('🔄 Loading groups for user:', user.id)
      const response = await chatGroupService.getUserGroups(user.id)
      console.log('📦 Groups response:', response)
      
      if (response.success) {
        // Handle different response structures
        const groupsData = response.data || response.groups || []
        console.log('📋 Groups data:', groupsData)
        setGroups(groupsData)
      } else {
        console.warn('⚠️ Groups response not successful:', response)
        setGroups([])
      }
    } catch (error) {
      console.error('❌ Error loading groups:', error)
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
      console.log('📨 Messages response:', messagesResponse)
      
      if (messagesResponse.success) {
        // Handle different response structures
        const messagesData = messagesResponse.data || messagesResponse.messages || []
        console.log('💬 Messages data:', messagesData)
        setMessages(Array.isArray(messagesData) ? messagesData : [])
      } else {
        console.warn('⚠️ Messages response not successful:', messagesResponse)
        setMessages([])
      }
    } catch (error) {
      console.error('❌ Error selecting group:', error)
      toast.error('Gagal membuka grup chat')
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const sendGroupMessage = async () => {
    if (!newMessage.trim() || !selectedGroup) return

    try {
      const response = await chatGroupService.sendGroupMessage(selectedGroup.group_id, newMessage.trim())
      console.log('📤 Send message response:', response)
      
      if (response.success) {
        const newMessageData = response.data || response.message
        console.log('💬 New message data:', newMessageData)
        
        setMessages(prev => {
          const currentMessages = Array.isArray(prev) ? prev : []
          return [...currentMessages, newMessageData]
        })
        setNewMessage('')
      } else {
        console.warn('⚠️ Send message response not successful:', response)
        toast.error('Gagal mengirim pesan')
      }
    } catch (error) {
      console.error('❌ Error sending group message:', error)
      toast.error('Gagal mengirim pesan')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendGroupMessage()
    }
  }

  const filteredGroups = groups.filter(group =>
    (group.group_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (group.group_description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const isGroupAdmin = (group) => {
    if (!group.members || !Array.isArray(group.members)) {
      return false
    }
    return group.members.some(member => 
      member.user_id === user.id && member.role === 'admin'
    )
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Groups Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Grup Chat</h2>
            <button
              onClick={() => window.location.href = '/chat/groups/create'}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Cari grup..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Groups List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Memuat grup...</div>
          ) : filteredGroups.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Tidak ada grup</div>
          ) : (
            filteredGroups.map((group) => (
              <div
                key={group.group_id}
                onClick={() => selectGroup(group)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedGroup?.group_id === group.group_id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <h3 className="text-sm font-medium text-gray-900">{group.group_name || 'Unnamed Group'}</h3>
                      {isGroupAdmin(group) && (
                        <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{group.group_description || 'No description'}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {group.members?.length || 0} anggota
                    </p>
                    {group.last_message && group.last_message.trim() && (
                      <p className="text-xs text-gray-600 truncate mt-1">
                        {group.last_message}
                      </p>
                    )}
                  </div>
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
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">{selectedGroup.group_name || 'Unnamed Group'}</h3>
                    <p className="text-xs text-gray-500">{selectedGroup.group_description || 'No description'}</p>
                    <p className="text-xs text-gray-600">{selectedGroup.members?.length || 0} anggota</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isGroupAdmin(selectedGroup) && (
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Settings className="h-4 w-4" />
                    </button>
                  )}
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="text-center text-gray-500">Memuat pesan...</div>
              ) : !messages || messages.length === 0 ? (
                <div className="text-center text-gray-500">Belum ada pesan</div>
              ) : (
                (Array.isArray(messages) ? messages : []).map((message) => (
                  <div
                    key={message?.id || Math.random()}
                    className={`flex ${message?.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message?.sender_id === user?.id
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      {message?.sender_id !== user?.id && (
                        <p className="text-xs font-medium mb-1">
                          {message?.sender?.nama || 'Unknown'}
                        </p>
                      )}
                      <p className="text-sm">{message?.message || 'No message content'}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message?.created_at ? new Date(message.created_at).toLocaleTimeString() : 'Unknown time'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ketik pesan..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={sendGroupMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Pilih grup untuk memulai chat</h3>
              <p className="text-gray-500">Pilih grup dari daftar di sebelah kiri untuk memulai percakapan</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatGroups 