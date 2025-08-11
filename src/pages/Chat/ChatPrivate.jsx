import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { chatService } from '../../services/chatService'
import { userService } from '../../services/userService'
import { 
  Search, 
  MessageCircle, 
  Send, 
  MoreVertical,
  User,
  Phone,
  Video
} from 'lucide-react'
import toast from 'react-hot-toast'

const ChatPrivate = () => {
  const { user } = useAuth()
  const [contacts, setContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentRoom, setCurrentRoom] = useState(null)

  useEffect(() => {
    if (user) {
      loadContacts()
    }
  }, [user])

  const loadContacts = async () => {
    try {
      setLoading(true)
      const response = await chatService.getContacts(user.id)
      if (response.success) {
        setContacts(response.data)
      }
    } catch (error) {
      toast.error('Gagal memuat daftar kontak')
      console.error('Error loading contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectContact = async (contact) => {
    try {
      setLoading(true)
      setSelectedContact(contact)
      
      // Get or create chat room
      const roomResponse = await chatService.getOrCreateRoom(user.id, contact.id)
      if (roomResponse.success) {
        setCurrentRoom(roomResponse.data)
        
        // Load messages
        const messagesResponse = await chatService.getMessages(roomResponse.data.room_id)
        if (messagesResponse.success) {
          setMessages(messagesResponse.data)
        }
      }
    } catch (error) {
      toast.error('Gagal membuka chat')
      console.error('Error selecting contact:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentRoom) return

    try {
      const response = await chatService.sendMessage(currentRoom.room_id, newMessage.trim())
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

  const filteredContacts = contacts.filter(contact =>
    contact.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-full bg-gray-50">
      {/* Contacts Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Chat Pribadi</h2>
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Cari kontak..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Memuat kontak...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Tidak ada kontak</div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => selectContact(contact)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedContact?.id === contact.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{contact.nama}</h3>
                    <p className="text-xs text-gray-500">{contact.username}</p>
                    {contact.last_message && (
                      <p className="text-xs text-gray-600 truncate mt-1">
                        {contact.last_message}
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
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">{selectedContact.nama}</h3>
                    <p className="text-xs text-gray-500">{selectedContact.username}</p>
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
              {loading ? (
                <div className="text-center text-gray-500">Memuat pesan...</div>
              ) : messages.length === 0 ? (
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Pilih kontak untuk memulai chat</h3>
              <p className="text-gray-500">Pilih kontak dari daftar di sebelah kiri untuk memulai percakapan</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatPrivate 