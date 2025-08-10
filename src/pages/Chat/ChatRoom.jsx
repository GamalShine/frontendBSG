import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  Image as ImageIcon,
  File,
  User,
  Clock
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { formatDate } from '../../utils/helpers'
import Card, { CardHeader, CardBody } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Badge from '../../components/UI/Badge'
import { chatService } from '../../services/chatService'
import toast from 'react-hot-toast'

const ChatRoom = () => {
  const { roomId } = useParams()
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [chatRoom, setChatRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const loadChatRoom = async () => {
      try {
        setLoading(true)
        const [roomResponse, messagesResponse] = await Promise.all([
          chatService.getChatRoom(roomId),
          chatService.getMessages(roomId)
        ])
        
        setChatRoom(roomResponse.data || roomResponse)
        setMessages(messagesResponse.data || messagesResponse || [])
      } catch (error) {
        console.error('Error loading chat room:', error)
        toast.error('Gagal memuat chat room')
      } finally {
        setLoading(false)
      }
    }

    if (roomId) {
      loadChatRoom()
    }
  }, [roomId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      setSending(true)
      const messageData = {
        message: newMessage.trim(),
        message_type: 'text'
      }

      const response = await chatService.sendMessage(roomId, messageData)
      const sentMessage = response.data || response
      
      setMessages(prev => [...prev, sentMessage])
      setNewMessage('')
      
      // Mark as read
      await chatService.markAsRead(roomId)
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Gagal mengirim pesan')
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getOtherUser = () => {
    if (!chatRoom) return null
    return chatRoom.user1_id === user?.id ? chatRoom.user2 : chatRoom.user1
  }

  const getMessageTypeIcon = (messageType) => {
    switch (messageType) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />
      case 'file':
        return <File className="h-4 w-4" />
      default:
        return <MessageCircle className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat chat room...</p>
        </div>
      </div>
    )
  }

  const otherUser = getOtherUser()

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <Card className="rounded-none border-b">
        <CardBody className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                <User className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {otherUser?.nama || otherUser?.username}
                </h2>
                <p className="text-sm text-gray-500">{otherUser?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="success">Online</Badge>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === user?.id
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {!isOwnMessage && (
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-3 w-3 text-gray-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {getMessageTypeIcon(message.message_type)}
                        <span className="text-sm font-medium">
                          {isOwnMessage ? 'Anda' : otherUser?.nama || otherUser?.username}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      <div className={`flex items-center mt-1 text-xs ${
                        isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                      }`}>
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{formatDate(message.created_at)}</span>
                        {message.is_read && isOwnMessage && (
                          <span className="ml-2">✓✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada pesan</p>
            <p className="text-sm text-gray-400">Mulai percakapan sekarang!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <Card className="rounded-none border-t">
        <CardBody className="py-3">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pesan..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                rows="1"
                disabled={sending}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default ChatRoom 