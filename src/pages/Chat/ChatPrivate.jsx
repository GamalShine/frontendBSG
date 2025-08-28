import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { chatService } from '../../services/chatService'
import { chatGroupService } from '../../services/chatService'
import useChatSocket from '../../hooks/useChatSocket'
import { isDuplicateKeyError, getErrorMessage, extractErrorMessage } from '../../utils/errorHandler'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { 
  Search, 
  MessageCircle, 
  Send, 
  MoreVertical,
  User,
  Phone,
  Video,
  Trash2,
  Wifi,
  WifiOff,
  Users,
  Plus,
  RefreshCw
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const ChatPrivate = () => {
  const { user } = useAuth()
  const { joinRoom, leaveRoom, onNewMessage, isConnected } = useChatSocket()
  
  // Tab state
  const [activeTab, setActiveTab] = useState('all') // 'all' for combined list
  
  // Private chat state
  const [contacts, setContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  
  // Group chat state
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  
  // Combined chat list state
  const [combinedChatList, setCombinedChatList] = useState([])
  
  // Shared chat state
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
      loadAllChats()
      }
  }, [user])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' })
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

  // Load all chats (contacts and groups) and combine them
  const loadAllChats = async () => {
    try {
      setLoading(true)
      console.log('Loading all chats for user:', user.id)
      
      // Load contacts and groups in parallel
      const [contactsResponse, groupsResponse] = await Promise.all([
        loadContactsData(),
        loadGroupsData()
      ])
      
      // Combine and sort by last message time
      const combined = [...contactsResponse, ...groupsResponse]
        .sort((a, b) => {
          // Sort by last_message_time, newest first
          const timeA = a.last_message_time ? new Date(a.last_message_time).getTime() : 0
          const timeB = b.last_message_time ? new Date(b.last_message_time).getTime() : 0
          return timeB - timeA
        })
      
      console.log('Combined chat list:', combined)
      setCombinedChatList(combined)
    } catch (error) {
      console.error('Error loading all chats:', error)
      toast.error('Gagal memuat daftar chat')
      setCombinedChatList([])
    } finally {
      setLoading(false)
    }
  }

  // Load contacts data (without setting state)
  const loadContactsData = async () => {
    try {
      console.log('Loading contacts for user:', user.id)
      
      // Get new contacts (users without existing chat rooms)
      const contactsResponse = await chatService.getContacts(user.id)
      console.log('Contacts response:', contactsResponse)
      
      // Get existing chat rooms
      const roomsResponse = await chatService.getChatRooms(user.id)
      console.log('Rooms response:', roomsResponse)
      
      let allContacts = []
      const existingContactIds = new Set() // Track existing contact IDs to avoid duplicates
      
      if (roomsResponse.success) {
        // Convert chat rooms to contact format
        const existingContacts = roomsResponse.data
          .filter(room => room && room.room_id && room.other_user) // Filter out invalid rooms
          .map(room => {

            
            const contact = {
              id: room.other_user.id,
              nama: room.other_user.nama || room.other_user.username || 'Unknown User',
              username: room.other_user.username,
              email: room.other_user.email,
              role: room.other_user.role || 'User',
              last_message: room.last_message || 'Belum ada pesan',
              last_message_time: room.last_message_time,
              room_id: room.room_id,
              isExistingChat: true,
              type: 'private', // Add type for identification
              isOnline: Math.random() > 0.7, // Simulate online status
              unread_count: room.unread_count || 0 // Use unread_count from backend
            }
            

            
            existingContactIds.add(contact.id) // Track this ID
            return contact
          })
        
        allContacts = [...existingContacts]
      }
      
      if (contactsResponse.success) {
        // Only add new contacts that don't already exist
        const newContacts = contactsResponse.data
          .filter(contact => 
            contact && 
            contact.id && 
            !existingContactIds.has(contact.id)
          )
          .map(contact => ({
            ...contact,
            nama: contact.nama || contact.username || 'Unknown User',
            role: contact.role || 'User',
            last_message: 'Belum ada pesan',
            last_message_time: null,
            isExistingChat: false,
            type: 'private', // Add type for identification
            isOnline: Math.random() > 0.7, // Simulate online status
            unread_count: 0
          }))
        
        allContacts = [...allContacts, ...newContacts]
      }
      
      console.log('All contacts:', allContacts)
      return allContacts
    } catch (error) {
      console.error('Error loading contacts:', error)
      return []
    }
  }

  // Load groups data (without setting state)
  const loadGroupsData = async () => {
    try {
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
            description: group.group_description || group.description || 'Tidak ada deskripsi',
            type: 'group', // Add type for identification
            last_message: group.last_message || 'Belum ada pesan',
            last_message_time: group.last_message_time || null,
            unread_count: Math.floor(Math.random() * 5) // Simulate unread count
          }))
        
        console.log('🔍 Valid groups:', validGroups)
        return validGroups
      } else {
        console.error('Failed to load groups:', response.message)
        return []
      }
    } catch (error) {
      console.error('Error loading groups:', error)
      return []
    }
  }

  // Select contact for private chat
  const selectContact = async (contact) => {
    try {
      setLoading(true)
      setSelectedContact(contact)
      setSelectedGroup(null) // Clear group selection
      
      // Leave previous room if exists
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
        // Use existing room
        roomId = contact.room_id
        roomData = { room_id: roomId }
        setCurrentRoom(roomData)
        console.log('Using existing room:', roomId)
      } else {
        // Get or create chat room
        console.log('Creating new room between user', user.id, 'and contact', contact.id)
        const roomResponse = await chatService.getOrCreateRoom(user.id, contact.id)
        console.log('Room creation response:', roomResponse)
        
        if (roomResponse.success && roomResponse.data) {
          roomData = roomResponse.data
          setCurrentRoom(roomData)
          roomId = roomData.room_id
          console.log('New room created:', roomId)
        } else {
          console.error('Failed to create room:', roomResponse)
          throw new Error('Gagal membuat chat room')
        }
      }
      
      // Try to join the chat room for real-time updates (but don't fail if WebSocket is not available)
      try {
        joinRoom(roomId)
        console.log('Joined room:', roomId)
      } catch (wsError) {
        console.warn('WebSocket connection failed, continuing without real-time updates:', wsError)
      }
      
      // Load messages
      console.log('Loading messages for room:', roomId)
      const messagesResponse = await chatService.getMessages(roomId)
      console.log('Messages response:', messagesResponse)
      
      if (messagesResponse.success) {
        // Filter out messages with invalid IDs (like id = 0) and reverse to show oldest first
        const validMessages = (messagesResponse.data || [])
          .filter(msg => msg && msg.id !== 0 && msg.id !== null)
          .reverse() // Show oldest first (since backend returns newest first)
        
        console.log('Valid messages loaded:', validMessages.length)
        setMessages(validMessages)
        
        // Mark messages as read and update unread count
        try {
          await chatService.markAsRead(roomId, user.id)
          
          // Update unread count in contacts list
          setContacts(prev => 
            prev.map(c => 
              c.id === contact.id 
                ? { ...c, unread_count: 0 }
                : c
            )
          )
          
          // Update unread count in allContacts
          setAllContacts(prev => 
            prev.map(c => 
              c.id === contact.id 
                ? { ...c, unread_count: 0 }
                : c
            )
          )
          
          // Update unread count in combinedChatList
          setCombinedChatList(prev => 
            prev.map(c => 
              c.id === contact.id 
                ? { ...c, unread_count: 0 }
                : c
            )
          )
        } catch (readError) {
          console.warn('Error marking messages as read:', readError)
        }
      } else {
        console.error('Failed to load messages:', messagesResponse.message)
        setMessages([])
      }
      
      // Set up real-time message listener (only if WebSocket is connected)
      let cleanup = null
      if (isConnected) {
        try {
          cleanup = onNewMessage(roomId, (data) => {
            console.log('Received real-time message:', data)
            // Only add message if it's from the other user
            if (data.sender !== user.id) {
              // Create a temporary message object
              const tempMessage = {
                id: Date.now(), // Temporary ID
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
              
              // Update last message and increment unread count in contacts
              setContacts(prev => 
                prev.map(c => 
                  c.id === contact.id 
                    ? { 
                        ...c, 
                        last_message: data.message, 
                        last_message_time: data.timestamp,
                        unread_count: (c.unread_count || 0) + 1
                      }
                    : c
                )
              )
              
              // Update unread count in allContacts
              setAllContacts(prev => 
                prev.map(c => 
                  c.id === contact.id 
                    ? { 
                        ...c, 
                        last_message: data.message, 
                        last_message_time: data.timestamp,
                        unread_count: (c.unread_count || 0) + 1
                      }
                    : c
                )
              )
              
              // Update unread count in combinedChatList
              setCombinedChatList(prev => 
                prev.map(c => 
                  c.id === contact.id 
                    ? { 
                        ...c, 
                        last_message: data.message, 
                        last_message_time: data.timestamp,
                        unread_count: (c.unread_count || 0) + 1
                      }
                    : c
                )
              )
              
              // Show notification if not focused
              if (!document.hasFocus()) {
                toast.success(`Pesan baru dari ${contact.nama}`)
              }
            }
          })
        } catch (wsError) {
          console.warn('Failed to set up real-time message listener:', wsError)
        }
      }
      
      // Store cleanup function
      setCurrentRoom(prev => ({ ...prev, cleanup }))
      
    } catch (error) {
      console.error('Error selecting contact:', error)
      toast.error('Gagal membuka chat')
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  // Select group for group chat
  const selectGroup = async (group) => {
    try {
      setLoading(true)
      setSelectedGroup(group)
      setSelectedContact(null) // Clear contact selection
      
      // Leave previous room if exists
      if (currentRoom) {
        try {
          leaveRoom(currentRoom.room_id)
        } catch (wsError) {
          console.warn('Error leaving room:', wsError)
        }
      }
      
      console.log('🔍 Selecting group:', group.group_id)
      
      // Set current room for group
      setCurrentRoom({ room_id: group.group_id, isGroup: true })
      
      // Try to join the group room for real-time updates
      try {
        joinRoom(group.group_id)
        console.log('Joined group room:', group.group_id)
      } catch (wsError) {
        console.warn('WebSocket connection failed, continuing without real-time updates:', wsError)
      }
      
      const messagesResponse = await chatGroupService.getGroupMessages(group.group_id)
      console.log('🔍 Group messages response:', messagesResponse)
      
      if (messagesResponse.success) {
        // Handle the response structure properly
        const messagesData = messagesResponse.data
        if (messagesData && messagesData.messages && Array.isArray(messagesData.messages)) {
          // Filter out messages with invalid IDs (like id = 0) and reverse to show oldest first
          const validMessages = messagesData.messages.filter(msg => 
            msg && msg.id !== 0 && msg.id !== null
          ).reverse() // Show oldest first (since backend returns newest first)
          console.log('🔍 Valid messages:', validMessages)
          setMessages(validMessages)
        } else if (Array.isArray(messagesData)) {
          // Filter out messages with invalid IDs and reverse to show oldest first
          const validMessages = messagesData.filter(msg => 
            msg && msg.id !== 0 && msg.id !== null
          ).reverse() // Show oldest first (since backend returns newest first)
          console.log('🔍 Valid messages (array):', validMessages)
          setMessages(validMessages)
        } else {
          // Fallback to empty array
          console.warn('Unexpected messages data structure:', messagesData)
          setMessages([])
        }
        
                 // Reset unread count for current group since we opened it
         if (group) {
           setContacts(prev => 
             prev.map(c => 
               c.group_id === group.group_id 
                 ? { ...c, unread_count: 0 }
                 : c
             )
           )
           
           setAllContacts(prev => 
             prev.map(c => 
               c.group_id === group.group_id 
                 ? { ...c, unread_count: 0 }
                 : c
             )
           )
           
           setCombinedChatList(prev => 
             prev.map(c => 
               c.group_id === group.group_id 
                 ? { ...c, unread_count: 0 }
                 : c
             )
           )
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

  // Update chat list after new message
  const updateChatListAfterMessage = (roomId, message, senderId) => {
    setCombinedChatList(prevList => {
      const updatedList = prevList.map(item => {
        if (item.type === 'private' && item.room_id === roomId) {
          return {
            ...item,
            last_message: message,
            last_message_time: new Date().toISOString()
          }
        } else if (item.type === 'group' && item.group_id === roomId) {
          return {
            ...item,
            last_message: message,
            last_message_time: new Date().toISOString()
          }
        }
        return item
      })
      
      // Sort by last message time, newest first
      return updatedList.sort((a, b) => {
        const timeA = a.last_message_time ? new Date(a.last_message_time).getTime() : 0
        const timeB = b.last_message_time ? new Date(b.last_message_time).getTime() : 0
        return timeB - timeA
      })
    })
  }

  // Send message (works for both private and group)
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentRoom) {
      console.log('Cannot send message: no message or no current room')
      return
    }

    const messageText = newMessage.trim()
    setNewMessage('')

    // Check if it's a group message
    const isGroupMessage = currentRoom.isGroup

    if (isGroupMessage) {
      await sendGroupMessage(messageText)
    } else {
      await sendPrivateMessage(messageText)
    }
  }

  // Send private message
  const sendPrivateMessage = async (messageText) => {
    // Declare tempMessage outside try block so it can be accessed in catch block
    let tempMessage = null

    try {
      console.log('Sending message to room:', currentRoom.room_id)
      
      // Optimistically add message to UI
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
      
      // Update last message in contacts
      if (selectedContact) {
        setContacts(prev => 
          prev.map(contact => 
            contact.id === selectedContact.id 
              ? { ...contact, last_message: messageText, last_message_time: new Date().toISOString() }
              : contact
          )
        )
      }

      // Send message to backend
      const response = await chatService.sendMessage(
        currentRoom.room_id, 
        messageText, 
        user.id
      )
      
      console.log('Send message response:', response)
      
      if (response.success && response.data) {
        // Replace temp message with real message from server
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id ? response.data : msg
          )
        )
        console.log('Message sent successfully')
        
        // Show success message if it's a fallback
        if (response.data.isFallback) {
          toast.warning('Pesan ditampilkan di UI tapi mungkin tidak tersimpan di server')
        } else {
          toast.success('Pesan berhasil dikirim!')
          // Update chat list after successful message
          updateChatListAfterMessage(currentRoom.room_id, messageText, user.id)
          
          // Reset unread count for current contact since we sent a message
          if (selectedContact) {
            setContacts(prev => 
              prev.map(c => 
                c.id === selectedContact.id 
                  ? { ...c, unread_count: 0 }
                  : c
              )
            )
            
            setAllContacts(prev => 
              prev.map(c => 
                c.id === selectedContact.id 
                  ? { ...c, unread_count: 0 }
                  : c
              )
            )
            
            setCombinedChatList(prev => 
              prev.map(c => 
                c.id === selectedContact.id 
                  ? { ...c, unread_count: 0 }
                  : c
              )
            )
          }
        }
      } else {
        console.error('Failed to send message:', response.message)
        
        // Handle server errors with auto-retry
        if (response.isServerError || response.isDatabaseError) {
          console.log('Server/Database error detected, will retry automatically...')
          toast.error(response.message)
          
          // Multiple retry attempts with increasing delays
          let retryAttempt = 0
          const maxRetries = 3
          const baseDelay = response.isDatabaseError ? 3000 : 2000
          
          const attemptRetry = async () => {
            retryAttempt++
            const retryDelay = baseDelay * retryAttempt
            
            console.log(`🔄 Auto-retry attempt ${retryAttempt}/${maxRetries} in ${retryDelay}ms...`)
            
            setTimeout(async () => {
              try {
                const retryResponse = await chatService.sendMessage(
                  currentRoom.room_id, 
                  messageText, 
                  user.id
                )
                
                if (retryResponse.success && retryResponse.data) {
                  // Replace temp message with real message from server
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === tempMessage.id ? retryResponse.data : msg
                    )
                  )
                  toast.success(`Pesan berhasil dikirim setelah ${retryAttempt} percobaan!`)
                  console.log('Message sent successfully after retry')
                  
                  // Update chat list after successful retry
                  updateChatListAfterMessage(currentRoom.room_id, messageText, user.id)
                  
                  // Reset unread count for current contact since we sent a message
                  if (selectedContact) {
                    setContacts(prev => 
                      prev.map(c => 
                        c.id === selectedContact.id 
                          ? { ...c, unread_count: 0 }
                          : c
                      )
                    )
                    
                    setAllContacts(prev => 
                      prev.map(c => 
                        c.id === selectedContact.id 
                          ? { ...c, unread_count: 0 }
                          : c
                      )
                    )
                    
                    setCombinedChatList(prev => 
                      prev.map(c => 
                        c.id === selectedContact.id 
                          ? { ...c, unread_count: 0 }
                          : c
                      )
                    )
                  }
                  
                  // Show warning if it's a fallback
                  if (retryResponse.data.isFallback) {
                    toast.warning('Pesan ditampilkan di UI tapi mungkin tidak tersimpan di server')
                  }
                } else if (retryResponse.isServerError || retryResponse.isDatabaseError) {
                  // If still server/database error and we haven't reached max retries
                  if (retryAttempt < maxRetries) {
                    attemptRetry() // Try again
                  } else {
                    // Max retries reached, keep temp message as fallback
                    const fallbackMessage = {
                      ...tempMessage,
                      id: `temp_${Date.now()}`,
                      isFallback: true,
                      warning: 'Pesan mungkin tidak tersimpan di server'
                    }
                    setMessages(prev => 
                      prev.map(msg => 
                        msg.id === tempMessage.id ? fallbackMessage : msg
                      )
                    )
                    toast.warning('Pesan ditampilkan di UI tapi mungkin tidak tersimpan di server')
                    console.error('Max retries reached, keeping message as fallback')
                  }
                } else {
                  // Other error, keep temp message as fallback
                  const fallbackMessage = {
                    ...tempMessage,
                    id: `temp_${Date.now()}`,
                    isFallback: true,
                    warning: 'Pesan mungkin tidak tersimpan di server'
                  }
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === tempMessage.id ? fallbackMessage : msg
                    )
                  )
                  toast.warning('Pesan ditampilkan di UI tapi mungkin tidak tersimpan di server')
                  console.error('Other error during retry:', retryResponse.message)
                }
              } catch (retryError) {
                console.error(`Auto-retry attempt ${retryAttempt} failed:`, retryError)
                
                if (retryAttempt < maxRetries) {
                  attemptRetry() // Try again
                } else {
                  // Max retries reached, keep temp message as fallback
                  const fallbackMessage = {
                    ...tempMessage,
                    id: `temp_${Date.now()}`,
                    isFallback: true,
                    warning: 'Pesan mungkin tidak tersimpan di server'
                  }
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === tempMessage.id ? fallbackMessage : msg
                    )
                  )
                  toast.warning('Pesan ditampilkan di UI tapi mungkin tidak tersimpan di server')
                  console.error('Max retries reached, keeping message as fallback')
                }
              }
            }, retryDelay)
          }
          
          // Start the retry process
          attemptRetry()
          
          // Keep the temp message for now (will be replaced or kept as fallback)
          return
        }
        
        // For any other error, keep temp message as fallback
        const fallbackMessage = {
          ...tempMessage,
          id: `temp_${Date.now()}`,
          isFallback: true,
          warning: 'Pesan mungkin tidak tersimpan di server'
        }
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id ? fallbackMessage : msg
          )
        )
        toast.warning('Pesan ditampilkan di UI tapi mungkin tidak tersimpan di server')
        console.error('Non-server error, keeping message as fallback')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      console.error('Error details:', extractErrorMessage(error))
      
      // For any error, keep temp message as fallback
      if (tempMessage) {
        const fallbackMessage = {
          ...tempMessage,
          id: `temp_${Date.now()}`,
          isFallback: true,
          warning: 'Pesan mungkin tidak tersimpan di server'
        }
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id ? fallbackMessage : msg
          )
        )
        toast.warning('Pesan ditampilkan di UI tapi mungkin tidak tersimpan di server')
      }
    }
  }

  // Send group message
  const sendGroupMessage = async (messageText) => {
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
        console.log('Group message sent successfully')
        
        // Update chat list after successful group message
        updateChatListAfterMessage(selectedGroup.group_id, messageText, user.id)
        
        // Reset unread count for current group since we sent a message
        if (selectedGroup) {
          setContacts(prev => 
            prev.map(c => 
              c.group_id === selectedGroup.group_id 
                ? { ...c, unread_count: 0 }
                : c
            )
          )
          
          setAllContacts(prev => 
            prev.map(c => 
              c.group_id === selectedGroup.group_id 
                ? { ...c, unread_count: 0 }
                : c
            )
          )
          
          setCombinedChatList(prev => 
            prev.map(c => 
              c.group_id === selectedGroup.group_id 
                ? { ...c, unread_count: 0 }
                : c
            )
          )
        }
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
                console.log('Group message sent successfully after retry')
                
                // Update chat list after successful retry
                updateChatListAfterMessage(selectedGroup.group_id, messageText, user.id)
                
                // Reset unread count for current group since we sent a message
                if (selectedGroup) {
                  setContacts(prev => 
                    prev.map(c => 
                      c.group_id === selectedGroup.group_id 
                        ? { ...c, unread_count: 0 }
                        : c
                    )
                  )
                  
                  setAllContacts(prev => 
                    prev.map(c => 
                      c.group_id === selectedGroup.group_id 
                        ? { ...c, unread_count: 0 }
                        : c
                    )
                  )
                  
                  setCombinedChatList(prev => 
                    prev.map(c => 
                      c.group_id === selectedGroup.group_id 
                        ? { ...c, unread_count: 0 }
                        : c
                    )
                  )
                }
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
      sendMessage()
    }
  }

  const deleteChat = async () => {
    if (!currentRoom) return

    if (!window.confirm('Apakah Anda yakin ingin menghapus chat ini?')) {
      return
    }

    try {
      // Leave the room
      leaveRoom(currentRoom.room_id)
      
      // Clean up message listener
      if (currentRoom.cleanup) {
        currentRoom.cleanup()
      }
      
      if (currentRoom.isGroup) {
        // For group chat, just clear the selection
        setSelectedGroup(null)
        setCurrentRoom(null)
        setMessages([])
        toast.success('Grup chat ditutup')
      } else {
        // For private chat, delete the chat room
        const response = await chatService.deleteChatRoom(currentRoom.room_id, user.id)
        if (response.success) {
          toast.success('Chat berhasil dihapus')
          setSelectedContact(null)
          setCurrentRoom(null)
          setMessages([])
          loadContacts() // Reload contacts to update the list
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

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return `Hari ini ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Kemarin ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return `${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
    }
  }

  // Filter contacts and groups based on search term and existing chats with messages
  const filteredCombinedList = combinedChatList.filter(item => {
    const name = item.nama || item.group_name || item.username || 'Unknown User'
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Only show items that have existing chats with messages or are groups
    if (item.type === 'private') {
      // For private chats, only show if they have existing chat AND have messages
      return matchesSearch && item.isExistingChat && item.last_message && item.last_message !== 'Belum ada pesan'
    } else if (item.type === 'group') {
      // For groups, show all (groups are considered existing chats)
      return matchesSearch
    }
    
    return false
  })

  // Start new chat with selected contact
  const startNewChat = async (contact) => {
    try {
      setShowNewChatModal(false)
      setNewChatSearchTerm('')
      
      // Create new chat room
      const roomResponse = await chatService.getOrCreateRoom(user.id, contact.id)
      
      if (roomResponse.success && roomResponse.data) {
        // Add the new contact to the chat list
        const newContact = {
          id: contact.id,
          nama: contact.nama || contact.username || 'Unknown User',
          username: contact.username,
          email: contact.email,
          role: contact.role || 'User', // Ensure role exists
          last_message: 'Belum ada pesan',
          last_message_time: null,
          room_id: roomResponse.data.room_id,
          isExistingChat: true,
          type: 'private'
        }
        
        // Add to combined chat list
        setCombinedChatList(prev => [newContact, ...prev])
        
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

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSelectedContact(null)
    setSelectedGroup(null)
    setCurrentRoom(null)
    setMessages([])
    setSearchTerm('')
    
    // Load data for the selected tab
    if (tab === 'all') {
      loadAllChats()
    }
  }

  // Get current chat info
  const getCurrentChatInfo = () => {
    if (selectedContact) {
      // Use the actual role from database
      const role = selectedContact.role || 'User'
      
      return {
        name: selectedContact.nama || selectedContact.username || 'User',
        role: role,
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
    <div className="flex h-full bg-gray-100">
      {/* Sidebar - WhatsApp Style */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header - WhatsApp Style */}
        <div className="bg-red-600 text-white p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Chat</h2>
            <div className="flex items-center space-x-3">
              {isConnected ? (
                <Wifi className="h-5 w-5 text-red-100" title="Terhubung" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-100" title="Terputus" />
              )}
              <button
                onClick={handleShowNewChatModal}
                className="p-2 text-white hover:bg-red-700 rounded-full transition-colors"
                title="Buat chat baru"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Search - WhatsApp Style */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari atau mulai chat baru..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 placeholder-gray-500"
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner size="medium" />
            </div>
          ) : filteredCombinedList.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
              {searchTerm ? 'Tidak ada chat yang ditemukan' : 'Belum ada chat yang aktif'}
              </div>
            ) : (
            filteredCombinedList.map((item, index) => (
              <div
                key={`${item.id || item.group_id}-${item.type}-${index}`}
                onClick={() => {
                  if (item.type === 'private') {
                    selectContact(item)
                  } else if (item.type === 'group') {
                    selectGroup(item)
                  }
                }}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  (item.type === 'private' && selectedContact?.id === item.id) ||
                  (item.type === 'group' && selectedGroup?.group_id === item.group_id)
                    ? 'bg-red-50 border-red-200'
                    : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar - WhatsApp Style */}
                  <div className="relative">
                    <div className={`w-12 h-12 ${item.type === 'private' ? 'bg-gray-400' : 'bg-red-600'} rounded-full flex items-center justify-center`}>
                      {item.type === 'private' ? <User className="h-6 w-6 text-white" /> : <Users className="h-6 w-6 text-white" />}
                    </div>
                    {/* Online indicator for private chats */}
                    {item.type === 'private' && item.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-600 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  {/* Chat Info - WhatsApp Style */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {item.type === 'private' ? (item.nama || item.username || 'User') : item.group_name}
                      </h3>
                      {item.last_message_time && (
                        <span className="text-xs text-gray-500 font-medium">
                          {formatTime(item.last_message_time)}
                        </span>
                      )}
                    </div>
                    
                    {/* Last Message - WhatsApp Style */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-600 truncate">
                          {item.last_message || 'Belum ada pesan'}
                        </p>
                        
                        {/* Additional Info */}
                        <div className="flex items-center space-x-2 mt-1">
                          {item.type === 'group' && (
                            <span className="text-xs text-gray-400">
                              {item.member_count || 0} anggota
                            </span>
                          )}
                          {item.type === 'private' && item.role && (
                            <span className="text-xs text-gray-400">
                              {item.role}
                            </span>
                          )}

                        </div>
                      </div>
                      
                      {/* Unread indicator - WhatsApp Style */}
                      {item.unread_count > 0 && (
                        <div className="ml-2 flex-shrink-0">
                          <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">
                              {item.unread_count > 9 ? '9+' : item.unread_count}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChatInfo ? (
          <>
            {/* Chat Header - WhatsApp Style */}
            <div className="bg-red-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    {currentChatInfo.avatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {currentChatInfo.name}
                      <span className="text-sm font-normal text-red-100 ml-2">
                        - {currentChatInfo.role}
                      </span>
                    </h3>

                    {/* Last seen / Online status */}
                    {selectedContact && (
                      <p className="text-xs text-red-200">
                        {selectedContact.isOnline ? (
                          <span className="text-red-300 font-medium">● online</span>
                        ) : (
                          <span>terakhir dilihat {formatDate(selectedContact.last_message_time)}</span>
                        )}
                      </p>
                    )}
                    {/* Typing indicator */}
                    {selectedContact?.isTyping && (
                      <p className="text-xs text-red-200 animate-pulse">
                        mengetik...
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="p-2 text-white hover:bg-red-700 rounded-full transition-colors">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-white hover:bg-red-700 rounded-full transition-colors">
                    <Video className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={deleteChat}
                    className="p-2 text-white hover:bg-red-700 rounded-full transition-colors"
                    title={currentRoom?.isGroup ? 'Tutup grup' : 'Hapus chat'}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages - WhatsApp Style */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
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
                    className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'} mb-3`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.sender_id === user.id
                          ? 'bg-red-600 text-white rounded-br-md'
                          : 'bg-gray-200 text-gray-900 rounded-bl-md'
                      } ${message.isFallback ? 'border-2 border-yellow-400' : ''}`}
                    >
                      {message.sender_id !== user.id && currentRoom?.isGroup && (
                        <p className="text-xs font-medium mb-1 text-gray-600">
                          {message.sender?.nama || 'Unknown User'}
                        </p>
                      )}
                      <p className="text-sm">{message.message}</p>
                      {message.isFallback && (
                        <p className="text-xs text-yellow-600 font-medium mt-1">
                          ⚠️ {message.warning}
                        </p>
                      )}
                      <div className={`flex items-center justify-end mt-1 space-x-1 ${
                        message.sender_id === user.id ? 'text-red-100' : 'text-gray-500'
                      }`}>
                        <span className="text-xs">
                          {formatTime(message.created_at)}
                        </span>
                        {message.sender_id === user.id && (
                          <span className="text-xs">
                            {message.is_read ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input - WhatsApp Style */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ketik pesan..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className={`p-3 text-white rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                    currentRoom?.isGroup ? 'bg-red-600 hover:bg-red-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Pilih chat untuk memulai
              </h3>
              <p className="text-gray-500">
                Pilih chat dari daftar di sebelah kiri untuk memulai percakapan
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
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
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

export default ChatPrivate 