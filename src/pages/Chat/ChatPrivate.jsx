import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { chatService } from '../../services/chatService'
import { 
  Search, 
  MessageCircle, 
  Send, 
  MoreVertical,
  User,
  Phone,
  Video,
  Trash2
} from 'lucide-react'
import { toast } from 'react-hot-toast'

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
          
          // Mark messages as read
          await chatService.markAsRead(roomResponse.data.room_id, user.id)
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
      const response = await chatService.sendMessage(
        currentRoom.room_id, 
        newMessage.trim(), 
        user.id
      )
      if (response.success) {
        setMessages(prev => [...prev, response.data])
        setNewMessage('')
        
        // Update last message in contacts
        setContacts(prev => 
          prev.map(contact => 
            contact.id === selectedContact.id 
              ? { ...contact, last_message: newMessage.trim() }
              : contact
          )
        )
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

  const deleteChat = async () => {
    if (!currentRoom || !selectedContact) return

    if (!window.confirm('Apakah Anda yakin ingin menghapus chat ini?')) {
      return
    }

    try {
      const response = await chatService.deleteChatRoom(currentRoom.room_id, user.id)
      if (response.success) {
        toast.success('Chat berhasil dihapus')
        setSelectedContact(null)
        setCurrentRoom(null)
        setMessages([])
        loadContacts() // Reload contacts to update the list
      }
    } catch (error) {
      toast.error('Gagal menghapus chat')
      console.error('Error deleting chat:', error)
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Hari ini'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Kemarin'
    } else {
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short'
      })
    }
  }

  const filteredContacts = contacts.filter(contact =>
    contact.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-full bg-gray-50">
      {/* Contacts Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Chat Pribadi</h2>
          <div className="mt-3 relative">
            <input
              type="text"
              placeholder="Cari kontak..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? 'Tidak ada kontak yang ditemukan' : 'Tidak ada kontak'}
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => selectContact(contact)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedContact?.id === contact.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {contact.nama}
                      </h3>
                      {contact.last_message_time && (
                        <span className="text-xs text-gray-500">
                          {formatTime(contact.last_message_time)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {contact.last_message || 'Belum ada pesan'}
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
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedContact.nama}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedContact.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Video className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={deleteChat}
                    className="p-2 text-red-400 hover:text-red-600"
                    title="Hapus chat"
                  >
                    <Trash2 className="h-5 w-5" />
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
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_id === user.id ? 'text-blue-100' : 'text-gray-500'
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
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                Pilih kontak untuk memulai chat
              </h3>
              <p className="text-gray-500">
                Pilih kontak dari daftar di sebelah kiri untuk memulai percakapan
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatPrivate 