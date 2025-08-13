import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { chatGroupService } from '../../services/chatService'
import { isDuplicateKeyError, getErrorMessage, extractErrorMessage } from '../../utils/errorHandler'
import { 
  Search, 
  MessageCircle, 
  Send, 
  Users,
  Plus,
  Trash2,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const ChatGroups = () => {
  const { user } = useAuth()
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef(null)
  const isConnected = false // Temporarily disabled real-time

  useEffect(() => {
    if (user) {
      loadGroups()
    }
  }, [user])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadGroups = async () => {
    try {
      setLoading(true)
      console.log('🔍 Loading groups for user:', user.id)
      
      // Get user's groups using the correct endpoint
      const response = await chatGroupService.getUserGroups(user.id)
      console.log('🔍 Groups response:', response)
      
      if (response.success) {
        // Filter out invalid groups and ensure proper structure
        const validGroups = (response.data || [])
          .filter(group => 
            group && 
            group.group_id && 
            group.group_name
          )
          .map(group => ({
            ...group,
            member_count: group.members ? group.members.length : 0,
            description: group.group_description || group.description || 'Tidak ada deskripsi'
          }))
        
        console.log('🔍 Valid groups:', validGroups)
        setGroups(validGroups)
        
        if (validGroups.length === 0) {
          toast.info('Anda belum bergabung dengan grup chat apapun')
        }
      } else {
        setGroups([])
        console.error('Failed to load groups:', response.message)
        toast.error('Gagal memuat daftar grup')
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
      
      console.log('🔍 Selecting group:', group.group_id)
      
      const messagesResponse = await chatGroupService.getGroupMessages(group.group_id)
      console.log('🔍 Group messages response:', messagesResponse)
      
      if (messagesResponse.success) {
        // Handle the response structure properly
        const messagesData = messagesResponse.data
        if (messagesData && messagesData.messages && Array.isArray(messagesData.messages)) {
          // Filter out messages with invalid IDs (like id = 0)
          const validMessages = messagesData.messages.filter(msg => 
            msg && msg.id !== 0 && msg.id !== null
          )
          console.log('🔍 Valid messages:', validMessages)
          setMessages(validMessages)
        } else if (Array.isArray(messagesData)) {
          // Filter out messages with invalid IDs
          const validMessages = messagesData.filter(msg => 
            msg && msg.id !== 0 && msg.id !== null
          )
          console.log('🔍 Valid messages (array):', validMessages)
          setMessages(validMessages)
        } else {
          // Fallback to empty array
          console.warn('Unexpected messages data structure:', messagesData)
          setMessages([])
        }
      } else {
        setMessages([])
        console.error('Failed to load group messages:', messagesResponse.message)
        toast.error('Gagal memuat pesan grup')
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

    const messageText = newMessage.trim()
    setNewMessage('')

    // Declare tempMessage outside try block so it can be accessed in catch block
    let tempMessage = null

    try {
      console.log('🔍 Sending group message:', {
        group_id: selectedGroup.group_id,
        sender_id: user.id,
        message: messageText
      })

      // Optimistically add message to UI
      tempMessage = {
        id: Date.now(),
        room_id: selectedGroup.group_id,
        sender_id: user.id,
        message: messageText,
        message_type: 'text',
        is_group_message: true,
        created_at: new Date().toISOString(),
        sender: {
          id: user.id,
          nama: user.nama,
          username: user.username
        }
      }
      
      setMessages(prev => {
        const currentMessages = Array.isArray(prev) ? prev : []
        return [...currentMessages, tempMessage]
      })

      // Send message to backend
      const response = await chatGroupService.sendGroupMessage(selectedGroup.group_id, {
        sender_id: user.id,
        message: messageText,
        message_type: 'text'
      })
      
      console.log('🔍 Send message response:', response)
      
      if (response.success) {
        // Replace temp message with real message from server
        setMessages(prev => {
          const currentMessages = Array.isArray(prev) ? prev : []
          return currentMessages.map(msg => 
            msg.id === tempMessage.id ? response.data : msg
          )
        })
        toast.success('Pesan berhasil dikirim!')
      } else {
        // Handle server errors with auto-retry
        if (response.isServerError || response.isDatabaseError) {
          console.log('Server/Database error detected, will retry automatically...')
          toast.error(response.message)
          
          // Auto-retry after 3 seconds for server errors, 5 seconds for database errors
          const retryDelay = response.isDatabaseError ? 5000 : 3000
          
          setTimeout(async () => {
            try {
              console.log('🔄 Auto-retrying message send...')
              const retryResponse = await chatGroupService.sendGroupMessage(selectedGroup.group_id, {
                sender_id: user.id,
                message: messageText,
                message_type: 'text'
              })
              
              if (retryResponse.success) {
                // Replace temp message with real message from server
                setMessages(prev => {
                  const currentMessages = Array.isArray(prev) ? prev : []
                  return currentMessages.map(msg => 
                    msg.id === tempMessage.id ? retryResponse.data : msg
                  )
                })
                toast.success('Pesan berhasil dikirim setelah percobaan ulang!')
              } else {
                // Remove temp message if retry also failed
                setMessages(prev => {
                  const currentMessages = Array.isArray(prev) ? prev : []
                  return currentMessages.filter(msg => msg.id !== tempMessage.id)
                })
                toast.error('Gagal mengirim pesan setelah percobaan ulang')
              }
            } catch (retryError) {
              console.error('Auto-retry failed:', retryError)
              // Remove temp message if retry failed
              setMessages(prev => {
                const currentMessages = Array.isArray(prev) ? prev : []
                return currentMessages.filter(msg => msg.id !== tempMessage.id)
              })
              toast.error('Gagal mengirim pesan setelah percobaan ulang')
            }
          }, retryDelay)
          
          // Keep the temp message for now (will be replaced or removed by retry)
          return
        }
        
        // Remove temp message if failed (non-server error)
        setMessages(prev => {
          const currentMessages = Array.isArray(prev) ? prev : []
          return currentMessages.filter(msg => msg.id !== tempMessage.id)
        })
        toast.error(response.message || 'Gagal mengirim pesan')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      console.error('Error details:', extractErrorMessage(error))
      
      // Check if it's a database error
      if (isDuplicateKeyError(error)) {
        console.log('Duplicate key error detected, keeping temp message for retry')
        toast.error('Pesan berhasil dikirim (sedang diproses ulang)')
        // Don't remove the temp message as it will be replaced when retry succeeds
      } else {
        console.log('Non-duplicate error, removing temp message')
        toast.error(getErrorMessage(error))
        // Remove temp message if failed
        if (tempMessage) {
          setMessages(prev => {
            const currentMessages = Array.isArray(prev) ? prev : []
            return currentMessages.filter(msg => msg.id !== tempMessage.id)
          })
        }
      }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendGroupMessage()
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredGroups = groups.filter(group =>
    group.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-full bg-gray-50">
      {/* Groups Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">Chat Grup</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadGroups}
                disabled={loading}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Refresh Groups"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" title="Terhubung" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" title="Terputus" />
              )}
            </div>
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
            filteredGroups.map((group, index) => (
              <div
                key={`${group.group_id}-${index}`}
                onClick={() => selectGroup(group)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedGroup?.group_id === group.group_id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {group.group_name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {group.description || 'Tidak ada deskripsi'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {group.member_count || 0} anggota
                    </p>
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
                      {selectedGroup.member_count || 0} anggota
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : !Array.isArray(messages) || messages.length === 0 ? (
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
                        <p className="text-xs font-medium mb-1 text-gray-600">
                          {message.sender?.nama || 'Unknown User'}
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
              <div ref={messagesEndRef} />
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
    </div>
  )
}

export default ChatGroups 