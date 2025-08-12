import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import useChatSocket from '../hooks/useChatSocket'
import { chatService } from '../services/chatService'
import { toast } from 'react-hot-toast'

const ChatTest = () => {
  const { user } = useAuth()
  const { isConnected, joinRoom, leaveRoom, onNewMessage } = useChatSocket()
  const [contacts, setContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [messages, setMessages] = useState([])
  const [testMessage, setTestMessage] = useState('')
  const [loading, setLoading] = useState(false)

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
        setContacts(response.data.slice(0, 5)) // Only show first 5 contacts for testing
      }
    } catch (error) {
      console.error('Error loading contacts:', error)
      toast.error('Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }

  const testChatConnection = async (contact) => {
    try {
      setSelectedContact(contact)
      
      // Get or create chat room
      const roomResponse = await chatService.getOrCreateRoom(user.id, contact.id)
      if (!roomResponse.success) {
        throw new Error('Failed to create chat room')
      }
      
      const roomId = roomResponse.data.room_id
      
      // Join the room
      joinRoom(roomId)
      
      // Load messages
      const messagesResponse = await chatService.getMessages(roomId)
      if (messagesResponse.success) {
        setMessages(messagesResponse.data)
      }
      
      // Set up message listener
      const cleanup = onNewMessage(roomId, (data) => {
        console.log('Test: New message received:', data)
        toast.success(`New message from ${contact.nama}: ${data.message}`)
      })
      
      toast.success(`Connected to chat with ${contact.nama}`)
      
    } catch (error) {
      console.error('Error testing chat:', error)
      toast.error('Failed to test chat connection')
    }
  }

  const sendTestMessage = async () => {
    if (!testMessage.trim() || !selectedContact) return
    
    try {
      const roomResponse = await chatService.getOrCreateRoom(user.id, selectedContact.id)
      if (!roomResponse.success) {
        throw new Error('Failed to get chat room')
      }
      
      const response = await chatService.sendMessage(
        roomResponse.data.room_id,
        testMessage,
        user.id
      )
      
      if (response.success) {
        toast.success('Test message sent successfully!')
        setTestMessage('')
      } else {
        toast.error('Failed to send test message')
      }
    } catch (error) {
      console.error('Error sending test message:', error)
      toast.error('Failed to send test message')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Chat Integration Test</h1>
      
      {/* Connection Status */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{isConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          User ID: {user?.id} | Name: {user?.nama}
        </p>
      </div>

      {/* Test Controls */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Test Controls</h2>
        <div className="flex space-x-4">
          <button
            onClick={loadContacts}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load Contacts'}
          </button>
          <button
            onClick={() => setMessages([])}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear Messages
          </button>
        </div>
      </div>

      {/* Contacts */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Available Contacts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => testChatConnection(contact)}
            >
              <h3 className="font-medium">{contact.nama}</h3>
              <p className="text-sm text-gray-600">{contact.username}</p>
              <p className="text-xs text-gray-500">{contact.role}</p>
            </div>
          ))}
        </div>
        {contacts.length === 0 && !loading && (
          <p className="text-gray-500">No contacts available</p>
        )}
      </div>

      {/* Selected Contact */}
      {selectedContact && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Selected Contact</h2>
          <p><strong>Name:</strong> {selectedContact.nama}</p>
          <p><strong>Username:</strong> {selectedContact.username}</p>
          <p><strong>Role:</strong> {selectedContact.role}</p>
        </div>
      )}

      {/* Test Message */}
      {selectedContact && (
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Send Test Message</h2>
          <div className="flex space-x-2">
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Type a test message..."
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              onClick={sendTestMessage}
              disabled={!testMessage.trim()}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Recent Messages</h2>
        <div className="max-h-64 overflow-y-auto border rounded p-4">
          {messages.length === 0 ? (
            <p className="text-gray-500">No messages yet</p>
          ) : (
            messages.slice(-10).map((message) => (
              <div key={message.id} className="mb-2 p-2 bg-gray-100 rounded">
                <div className="flex justify-between">
                  <span className="font-medium">{message.sender?.nama || 'Unknown'}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm">{message.message}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* API Test Results */}
      <div className="p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">API Test Results</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>WebSocket Connection:</span>
            <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
              {isConnected ? '✓ Connected' : '✗ Disconnected'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>User Authentication:</span>
            <span className={user ? 'text-green-600' : 'text-red-600'}>
              {user ? '✓ Authenticated' : '✗ Not Authenticated'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Contacts Loaded:</span>
            <span className="text-blue-600">{contacts.length} contacts</span>
          </div>
          <div className="flex justify-between">
            <span>Messages Loaded:</span>
            <span className="text-blue-600">{messages.length} messages</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatTest 