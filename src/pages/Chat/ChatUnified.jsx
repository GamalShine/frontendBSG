import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { chatService } from '../../services/chatService'
import { chatGroupService } from '../../services/chatService'
import useChatSocket from '../../hooks/useChatSocket'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { 
  Search, 
  MessageCircle, 
  Send, 
  User,
  Phone,
  Video,
  Trash2,
  Wifi,
  WifiOff,
  Users,
  Plus
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const ChatUnified = () => {
  const { user } = useAuth()
  const { joinRoom, leaveRoom, onNewMessage, isConnected } = useChatSocket()
  
  const [activeTab, setActiveTab] = useState('private')
  const [contacts, setContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentRoom, setCurrentRoom] = useState(null)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [newChatContacts, setNewChatContacts] = useState([])
  const [newChatSearchTerm, setNewChatSearchTerm] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (user?.id) {
      if (activeTab === 'private') {
        loadContacts()
      } else {
        loadGroups()
      }
    }
  }, [user, activeTab])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Show new chat modal and load available contacts
  const handleShowNewChatModal = async () => {
    try {
      console.log('Opening new chat modal for user:', user.id)
      setShowNewChatModal(true)
      setNewChatSearchTerm('')
      
      // Load all available contacts from database
      const contactsResponse = await chatService.getContacts(user.id)
      const roomsResponse = await chatService.getChatRooms(user.id)
      console.log('Contacts API response:', contactsResponse)
      console.log('Rooms API response:', roomsResponse)
      
      if (contactsResponse.success && contactsResponse.data) {
        // Get existing chat user IDs
        const existingChatUserIds = new Set()
        if (roomsResponse.success && roomsResponse.data) {
          roomsResponse.data.forEach(room => {
            if (room && room.other_user) {
              existingChatUserIds.add(room.other_user.id)
            }
          })
        }
        
        // Mark contacts with existing chat status
        const contactsWithStatus = contactsResponse.data.map(contact => ({
          ...contact,
          hasExistingChat: existingChatUserIds.has(contact.id)
        }))
        
        console.log('Setting available contacts with status:', contactsWithStatus)
        setNewChatContacts(contactsWithStatus)
      } else {
        console.error('Failed to load contacts:', contactsResponse)
        toast.error('Gagal memuat daftar kontak')
        setNewChatContacts([])
      }
    } catch (error) {
      console.error('Error loading new chat contacts:', error)
      toast.error('Gagal memuat daftar kontak')
      setNewChatContacts([])
    }
  }

  // Start new chat with selected contact
  const startNewChat = async (contact) => {
    try {
      setShowNewChatModal(false)
      setNewChatSearchTerm('')
      
      // Create new chat room
      const roomResponse = await chatService.getOrCreateRoom(user.id, contact.id)
      
      if (roomResponse.success && roomResponse.data) {
        // Add the new contact to the contacts list
        const newContact = {
          id: contact.id,
          nama: contact.nama || contact.username || 'Unknown User',
          username: contact.username,
          email: contact.email,
          role: contact.role,
          last_message: 'Belum ada pesan',
          last_message_time: null,
          room_id: roomResponse.data.room_id,
          isExistingChat: true
        }
        
        // Add to contacts list
        setContacts(prev => [newContact, ...prev])
        
        // Select the new contact
        selectContact(newContact)
        
        toast.success(`Chat baru dengan ${contact.nama} berhasil dibuat`)
      } else {
        throw new Error('Gagal membuat chat room')
      }
    } catch (error) {
      console.error('Error starting new chat:', error)
      toast.error('Gagal membuat chat baru')
    }
  }

  const loadContacts = async () => {
    try {
      setLoading(true)
      const contactsResponse = await chatService.getContacts(user.id)
      const roomsResponse = await chatService.getChatRooms(user.id)
      
      let allContacts = []
      const existingContactIds = new Set()
      
      if (roomsResponse.success) {
        const existingContacts = roomsResponse.data
          .filter(room => room && room.room_id && room.other_user)
          .map(room => ({
            id: room.other_user.id,
            nama: room.other_user.nama || room.other_user.username || 'Unknown User',
            username: room.other_user.username,
            email: room.other_user.email,
            role: room.other_user.role,
            last_message: room.last_message || 'Belum ada pesan',
            last_message_time: room.last_message_time,
            room_id: room.room_id,
            isExistingChat: true
          }))
        
        allContacts = [...existingContacts]
        existingContacts.forEach(contact => existingContactIds.add(contact.id))
      }
      
      if (contactsResponse.success) {
        const newContacts = contactsResponse.data
          .filter(contact => 
            contact && 
            contact.id && 
            !existingContactIds.has(contact.id)
          )
          .map(contact => ({
            ...contact,
            nama: contact.nama || contact.username || 'Unknown User',
            last_message: 'Belum ada pesan',
            last_message_time: null,
            isExistingChat: false
          }))
        
        allContacts = [...allContacts, ...newContacts]
      }
      
      // Only show contacts that have existing chats with messages
      const existingChatContacts = allContacts.filter(contact => 
        contact.isExistingChat && 
        contact.last_message && 
        contact.last_message !== 'Belum ada pesan'
      )
      setContacts(existingChatContacts)
    } catch (error) {
      console.error('Error loading contacts:', error)
      toast.error('Gagal memuat daftar kontak')
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  const loadGroups = async () => {
    try {
      setLoading(true)
      const response = await chatGroupService.getUserGroups(user.id)
      
      if (response.success) {
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
        
        setGroups(validGroups)
        
        if (validGroups.length === 0) {
          toast.info('Anda belum bergabung dengan grup chat apapun')
        }
      } else {
        setGroups([])
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

  const selectContact = async (contact) => {
    try {
      setLoading(true)
      setSelectedContact(contact)
      setSelectedGroup(null)
      
      if (currentRoom) {
        try {
          leaveRoom(currentRoom.room_id)
        } catch (wsError) {
          console.warn('Error leaving room:', wsError)
        }
      }
      
      let roomId
      let roomData
      
      if (contact.isExistingChat && contact.room_id) {
        roomId = contact.room_id
        roomData = { room_id: roomId }
        setCurrentRoom(roomData)
      } else {
        const roomResponse = await chatService.getOrCreateRoom(user.id, contact.id)
        
        if (roomResponse.success && roomResponse.data) {
          roomData = roomResponse.data
          setCurrentRoom(roomData)
          roomId = roomData.room_id
        } else {
          throw new Error('Gagal membuat chat room')
        }
      }
      
      try {
        joinRoom(roomId)
      } catch (wsError) {
        console.warn('WebSocket connection failed:', wsError)
      }
      
      const messagesResponse = await chatService.getMessages(roomId)
      
      if (messagesResponse.success) {
        const validMessages = (messagesResponse.data || [])
          .filter(msg => msg && msg.id !== 0 && msg.id !== null)
          .reverse()
        
        setMessages(validMessages)
        
        try {
          await chatService.markAsRead(roomId, user.id)
        } catch (readError) {
          console.warn('Error marking messages as read:', readError)
        }
      } else {
        setMessages([])
      }
      
      let cleanup = null
      if (isConnected) {
        try {
          cleanup = onNewMessage(roomId, (data) => {
            if (data.sender !== user.id) {
              const tempMessage = {
                id: Date.now(),
                room_id: roomId,
                sender_id: data.sender,
                message: data.message,
                message_type: 'text',
                is_read: false,
                created_at: data.timestamp,
                sender: {
                  id: data.sender,
                  nama: contact.nama,
                  username: contact.username
                }
              }
              
              setMessages(prev => [...prev, tempMessage])
              
              setContacts(prev => 
                prev.map(c => 
                  c.id === contact.id 
                    ? { ...c, last_message: data.message, last_message_time: data.timestamp }
                    : c
                )
              )
              
              if (!document.hasFocus()) {
                toast.success(`Pesan baru dari ${contact.nama}`)
              }
            }
          })
        } catch (wsError) {
          console.warn('Failed to set up real-time message listener:', wsError)
        }
      }
      
      setCurrentRoom(prev => ({ ...prev, cleanup }))
      
    } catch (error) {
      console.error('Error selecting contact:', error)
      toast.error('Gagal membuka chat')
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const selectGroup = async (group) => {
    try {
      setLoading(true)
      setSelectedGroup(group)
      setSelectedContact(null)
      
      if (currentRoom) {
        try {
          leaveRoom(currentRoom.room_id)
        } catch (wsError) {
          console.warn('Error leaving room:', wsError)
        }
      }
      
      setCurrentRoom({ room_id: group.group_id, isGroup: true })
      
      try {
        joinRoom(group.group_id)
      } catch (wsError) {
        console.warn('WebSocket connection failed:', wsError)
      }
      
      const messagesResponse = await chatGroupService.getGroupMessages(group.group_id)
      
      if (messagesResponse.success) {
        const messagesData = messagesResponse.data
        if (messagesData && messagesData.messages && Array.isArray(messagesData.messages)) {
          const validMessages = messagesData.messages.filter(msg => 
            msg && msg.id !== 0 && msg.id !== null
          )
          setMessages(validMessages)
        } else if (Array.isArray(messagesData)) {
          const validMessages = messagesData.filter(msg => 
            msg && msg.id !== 0 && msg.id !== null
          )
          setMessages(validMessages)
        } else {
          setMessages([])
        }
      } else {
        setMessages([])
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

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentRoom) {
      return
    }

    const messageText = newMessage.trim()
    setNewMessage('')

    const isGroupMessage = currentRoom.isGroup

    if (isGroupMessage) {
      await sendGroupMessage(messageText)
    } else {
      await sendPrivateMessage(messageText)
    }
  }

  const sendPrivateMessage = async (messageText) => {
    let tempMessage = null

    try {
      tempMessage = {
        id: Date.now(),
        room_id: currentRoom.room_id,
        sender_id: user.id,
        message: messageText,
        message_type: 'text',
        is_read: false,
        created_at: new Date().toISOString(),
        sender: {
          id: user.id,
          nama: user.nama,
          username: user.username
        }
      }
      
      setMessages(prev => [...prev, tempMessage])
      
      if (selectedContact) {
        setContacts(prev => 
          prev.map(contact => 
            contact.id === selectedContact.id 
              ? { ...contact, last_message: messageText, last_message_time: new Date().toISOString() }
              : contact
          )
        )
      }

      const response = await chatService.sendMessage(
        currentRoom.room_id, 
        messageText, 
        user.id
      )
      
      if (response.success && response.data) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id ? response.data : msg
          )
        )
        toast.success('Pesan berhasil dikirim!')
      } else {
        toast.error(response.message || 'Gagal mengirim pesan')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Gagal mengirim pesan')
    }
  }

  const sendGroupMessage = async (messageText) => {
    let tempMessage = null

    try {
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

      const response = await chatGroupService.sendGroupMessage(selectedGroup.group_id, {
        sender_id: user.id,
        message: messageText,
        message_type: 'text'
      })
      
      if (response.success) {
        setMessages(prev => {
          const currentMessages = Array.isArray(prev) ? prev : []
          return currentMessages.map(msg => 
            msg.id === tempMessage.id ? response.data : msg
          )
        })
        toast.success('Pesan berhasil dikirim!')
      } else {
        toast.error(response.message || 'Gagal mengirim pesan')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Gagal mengirim pesan')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const deleteChat = async () => {
    if (!currentRoom) return

    if (!window.confirm('Apakah Anda yakin ingin menghapus chat ini?')) {
      return
    }

    try {
      leaveRoom(currentRoom.room_id)
      
      if (currentRoom.cleanup) {
        currentRoom.cleanup()
      }
      
      if (currentRoom.isGroup) {
        setSelectedGroup(null)
        setCurrentRoom(null)
        setMessages([])
        toast.success('Grup chat ditutup')
      } else {
        const response = await chatService.deleteChatRoom(currentRoom.room_id, user.id)
        if (response.success) {
          toast.success('Chat berhasil dihapus')
          setSelectedContact(null)
          setCurrentRoom(null)
          setMessages([])
          loadContacts()
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
      toast.error('Gagal menghapus chat')
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredContacts = contacts.filter(contact =>
    (contact.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredGroups = groups.filter(group =>
    group.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSelectedContact(null)
    setSelectedGroup(null)
    setCurrentRoom(null)
    setMessages([])
    setSearchTerm('')
    
    if (tab === 'private') {
      loadContacts()
    } else {
      loadGroups()
    }
  }

  const getCurrentChatInfo = () => {
    if (selectedContact) {
      return {
        name: selectedContact.nama || selectedContact.username || 'User',
        role: selectedContact.role || 'User',
        avatar: <User className="h-5 w-5 text-white" />,
        bgColor: 'bg-blue-500',
        type: 'Private Chat'
      }
    } else if (selectedGroup) {
      return {
        name: selectedGroup.group_name,
        role: `${selectedGroup.member_count || 0} anggota`,
        avatar: <Users className="h-5 w-5 text-white" />,
        bgColor: 'bg-green-500',
        type: 'Group Chat'
      }
    }
    return null
  }

  const currentChatInfo = getCurrentChatInfo()

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header with Tabs */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">Chat</h2>
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" title="Terhubung" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" title="Terputus" />
              )}
              <button
                onClick={handleShowNewChatModal}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Buat chat baru"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-3">
            <button
              onClick={() => handleTabChange('private')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'private'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <User className="h-4 w-4 inline mr-2" />
              Private
            </button>
            <button
              onClick={() => handleTabChange('group')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'group'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Grup
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder={activeTab === 'private' ? 'Cari kontak...' : 'Cari grup...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner size="medium" />
            </div>
          ) : activeTab === 'private' ? (
            // Private Chat Contacts
            filteredContacts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'Tidak ada kontak yang ditemukan' : 'Tidak ada kontak'}
              </div>
            ) : (
              filteredContacts.map((contact, index) => (
                <div
                  key={`${contact.id}-${contact.isExistingChat ? 'existing' : 'new'}-${index}`}
                  onClick={() => selectContact(contact)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedContact?.id === contact.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {contact.nama || contact.username || 'User'}
                          {contact.isExistingChat && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Chat
                            </span>
                          )}
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
            )
          ) : (
            // Group Chat Groups
            filteredGroups.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'Tidak ada grup yang ditemukan' : 'Tidak ada grup'}
              </div>
            ) : (
              filteredGroups.map((group, index) => (
                <div
                  key={`${group.group_id}-${index}`}
                  onClick={() => selectGroup(group)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedGroup?.group_id === group.group_id ? 'bg-green-50 border-green-200' : ''
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
            )
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChatInfo ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${currentChatInfo.bgColor} rounded-full flex items-center justify-center`}>
                    {currentChatInfo.avatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {currentChatInfo.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {currentChatInfo.role}
                    </p>
                    <p className="text-xs text-gray-400">
                      {currentChatInfo.type}
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
                    title={currentRoom?.isGroup ? 'Tutup grup' : 'Hapus chat'}
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
                  <LoadingSpinner size="medium" />
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
                          ? currentRoom?.isGroup ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      {message.sender_id !== user.id && currentRoom?.isGroup && (
                        <p className="text-xs font-medium mb-1 text-gray-600">
                          {message.sender?.nama || 'Unknown User'}
                        </p>
                      )}
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_id === user.id 
                          ? currentRoom?.isGroup ? 'text-green-100' : 'text-blue-100'
                          : 'text-gray-500'
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className={`px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                    currentRoom?.isGroup ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                  }`}
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
                {activeTab === 'private' ? 'Pilih kontak untuk memulai chat' : 'Pilih grup untuk memulai chat'}
              </h3>
              <p className="text-gray-500">
                {activeTab === 'private' 
                  ? 'Pilih kontak dari daftar di sebelah kiri untuk memulai percakapan'
                  : 'Pilih grup dari daftar di sebelah kiri untuk memulai percakapan'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Buat Chat Baru</h3>
                  <p className="text-sm text-gray-500 mt-1">Pilih user untuk memulai chat baru atau lanjutkan chat yang ada</p>
                </div>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari kontak..."
                  value={newChatSearchTerm}
                  onChange={(e) => setNewChatSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto p-4">
              {newChatContacts.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  {newChatSearchTerm ? 'Tidak ada kontak yang ditemukan' : 'Tidak ada kontak tersedia'}
                </div>
              ) : (
                newChatContacts
                  .filter(contact => 
                    (contact.nama || '').toLowerCase().includes(newChatSearchTerm.toLowerCase()) ||
                    (contact.username || '').toLowerCase().includes(newChatSearchTerm.toLowerCase()) ||
                    (contact.email || '').toLowerCase().includes(newChatSearchTerm.toLowerCase())
                  )
                  .map((contact, index) => (
                    <div
                      key={`${contact.id}-${index}`}
                      onClick={() => startNewChat(contact)}
                      className="p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {contact.nama || contact.username || 'User'}
                            {contact.hasExistingChat && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Sudah Ada Chat
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            {contact.username && contact.nama !== contact.username ? `${contact.username} • ` : ''}{contact.role || 'User'}
                          </p>
                          {contact.email && (
                            <p className="text-xs text-gray-400 truncate">
                              {contact.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatUnified
