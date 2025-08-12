import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { 
  Database, 
  MessageCircle, 
  Users, 
  Calendar,
  RefreshCw,
  Eye,
  Trash2,
  User,
  Search,
  Send,
  Reply
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const ChatDataViewer = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [chatRooms, setChatRooms] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [activeTab, setActiveTab] = useState('rooms')
  const [searchTerm, setSearchTerm] = useState('')
  const [replyMessage, setReplyMessage] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)

  useEffect(() => {
    if (user?.id) {
      loadChatData()
    }
  }, [user])

  const loadChatData = async () => {
    try {
      setLoading(true)
      
      // Load chat rooms
      const roomsResponse = await api.get(`/chat/rooms/${user.id}`)
      if (roomsResponse.data.success) {
        setChatRooms(roomsResponse.data.data || [])
      }
      
      // Load all messages (if admin)
      if (user.role === 'admin') {
        try {
          const messagesResponse = await api.get('/admin-chat/messages')
          if (messagesResponse.data.success) {
            setMessages(messagesResponse.data.data || [])
          }
        } catch (error) {
          console.log('Not admin or messages endpoint not available')
        }
      }
      
    } catch (error) {
      console.error('Error loading chat data:', error)
      toast.error('Gagal memuat data chat')
    } finally {
      setLoading(false)
    }
  }

  const loadRoomMessages = async (roomId) => {
    try {
      setLoading(true)
      const response = await api.get(`/chat/messages/${roomId}`)
      if (response.data.success) {
        setMessages(response.data.data || [])
        setSelectedRoom(roomId)
      }
    } catch (error) {
      console.error('Error loading room messages:', error)
      toast.error('Gagal memuat pesan')
    } finally {
      setLoading(false)
    }
  }

  const sendReply = async () => {
    if (!replyMessage.trim() || !selectedRoom) {
      toast.error('Pesan tidak boleh kosong')
      return
    }

    try {
      setLoading(true)
      
      // Send message using chat service
      const response = await api.post('/chat/message', {
        room_id: selectedRoom,
        sender_id: user.id,
        message: replyMessage.trim(),
        message_type: 'text'
      })

      if (response.data.success) {
        toast.success('Pesan berhasil dikirim!')
        setReplyMessage('')
        setReplyingTo(null)
        
        // Reload messages to show the new message
        await loadRoomMessages(selectedRoom)
      } else {
        toast.error(response.data.message || 'Gagal mengirim pesan')
      }
    } catch (error) {
      console.error('Error sending reply:', error)
      toast.error('Gagal mengirim pesan')
    } finally {
      setLoading(false)
    }
  }

  const handleReply = (message) => {
    setReplyingTo(message)
    setReplyMessage('')
  }

  const cancelReply = () => {
    setReplyingTo(null)
    setReplyMessage('')
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredRooms = chatRooms.filter(room =>
    (room.other_user?.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (room.other_user?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (room.last_message || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredMessages = messages.filter(message =>
    (message.message || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (message.sender?.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (message.sender?.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="h-8 w-8 text-red-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Data Chat Database</h1>
                <p className="text-gray-600">Melihat dan membalas data chat yang tersimpan di database</p>
              </div>
            </div>
            <button
              onClick={loadChatData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('rooms')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'rooms'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>Chat Rooms ({chatRooms.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'messages'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Messages ({messages.length})</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari chat rooms atau messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm">
            {activeTab === 'rooms' ? (
              /* Chat Rooms Tab */
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Room ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Message
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Message Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unread Count
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRooms.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                          Tidak ada chat rooms
                        </td>
                      </tr>
                    ) : (
                      filteredRooms.map((room, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {room.room_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-white" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {room.other_user?.nama || room.other_user?.username || 'Unknown'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {room.other_user?.email || 'No email'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {room.last_message || 'No messages'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {room.last_message_time ? formatDate(room.last_message_time) : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {room.unread_count || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => loadRoomMessages(room.room_id)}
                              className="text-red-600 hover:text-red-900 mr-3"
                              title="View Messages"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Messages Tab */
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Room ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Read
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMessages.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                          Tidak ada messages
                        </td>
                      </tr>
                    ) : (
                      filteredMessages.map((message, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {message.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {message.room_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <User className="h-3 w-3 text-white" />
                              </div>
                              <div className="ml-2">
                                <div className="text-sm font-medium text-gray-900">
                                  {message.sender?.nama || message.sender?.username || 'Unknown'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {message.sender_id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                            <div className="truncate" title={message.message}>
                              {message.message}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              message.message_type === 'text' ? 'bg-blue-100 text-blue-800' :
                              message.message_type === 'image' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {message.message_type || 'text'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              message.is_read ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {message.is_read ? 'Read' : 'Unread'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(message.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleReply(message)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                              title="Reply to Message"
                            >
                              <Reply className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Selected Room Info */}
        {selectedRoom && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Messages for Room: {selectedRoom}
              </h3>
              <button
                onClick={() => setSelectedRoom(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                ×
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Showing {messages.length} messages for this room
            </p>
          </div>
        )}

        {/* Reply Section */}
        {selectedRoom && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
            <div className="space-y-4">
              {replyingTo && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Replying to: {replyingTo.sender?.nama || replyingTo.sender?.username || 'Unknown'}
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        "{replyingTo.message}"
                      </p>
                    </div>
                    <button
                      onClick={cancelReply}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <span className="sr-only">Cancel reply</span>
                      ×
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder={replyingTo ? "Ketik balasan..." : "Ketik pesan baru..."}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendReply()
                    }
                  }}
                />
                <button
                  onClick={sendReply}
                  disabled={!replyMessage.trim() || loading}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Send</span>
                </button>
              </div>
              
              <div className="text-sm text-gray-500">
                💡 <strong>Tips:</strong> 
                <ul className="mt-1 ml-4 list-disc">
                  <li>Klik tombol Reply (↩️) pada pesan untuk membalas</li>
                  <li>Tekan Enter untuk mengirim pesan</li>
                  <li>Pesan akan tersimpan ke database dan muncul di UI</li>
                  <li>Refresh halaman untuk melihat pesan terbaru</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatDataViewer 