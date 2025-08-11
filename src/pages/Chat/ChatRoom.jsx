import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { chatService } from '../../services/chatService'
import { 
  ArrowLeft, 
  Send, 
  MoreVertical,
  User,
  Phone,
  Video
} from 'lucide-react'
import toast from 'react-hot-toast'

const ChatRoom = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [room, setRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [otherUser, setOtherUser] = useState(null)

  useEffect(() => {
    if (roomId) {
      loadRoom()
      loadMessages()
    }
  }, [roomId])

  const loadRoom = async () => {
    try {
      setLoading(true)
      const response = await chatService.getUserRooms(user.id)
      if (response.success) {
        const currentRoom = response.data.find(r => r.room_id === roomId)
        if (currentRoom) {
          setRoom(currentRoom)
          // Determine other user
          const otherUserId = currentRoom.user1_id === user.id ? currentRoom.user2_id : currentRoom.user1_id
          // You might need to fetch other user details here
          setOtherUser({
            id: otherUserId,
            nama: 'User', // This should be fetched from user service
            username: 'username'
          })
        }
      }
    } catch (error) {
      toast.error('Gagal memuat data chat room')
      console.error('Error loading room:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    try {
      const response = await chatService.getMessages(roomId)
      if (response.success) {
        setMessages(response.data)
      }
    } catch (error) {
      toast.error('Gagal memuat pesan')
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      const response = await chatService.sendMessage(roomId, newMessage.trim())
      if (response.success) {
        setMessages(prev => [...prev, response.data])
        setNewMessage('')
      }
    } catch (error) {
      toast.error('Gagal mengirim pesan')
      console.error('Error sending message:', error)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat chat room...</p>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chat room tidak ditemukan</h3>
          <button
            onClick={() => navigate('/chat/private')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Kembali ke Chat
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/chat/private')}
              className="p-2 text-gray-400 hover:text-gray-600 mr-3"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">
                {otherUser?.nama || 'User'}
              </h3>
              <p className="text-xs text-gray-500">
                {otherUser?.username || 'username'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Phone className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Video className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500">Belum ada pesan</div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender_id === user.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.created_at).toLocaleTimeString()}
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
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatRoom 