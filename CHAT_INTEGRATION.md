# Chat Integration Documentation

## Overview
The chat functionality has been successfully integrated with the backend database and WebSocket service for real-time messaging.

## Features Implemented

### 1. Real-time Chat
- **WebSocket Connection**: Automatic connection to backend WebSocket service
- **Real-time Messages**: Instant message delivery without page refresh
- **Connection Status**: Visual indicator showing WebSocket connection status
- **Auto-reconnection**: Automatic reconnection on connection loss

### 2. Private Chat (ChatPrivate.jsx)
- **Contact List**: Shows all users with existing chat rooms and new contacts
- **Message History**: Loads and displays chat history from database
- **Real-time Updates**: New messages appear instantly
- **Optimistic UI**: Messages appear immediately when sent
- **Auto-scroll**: Automatically scrolls to latest messages
- **Notifications**: Toast notifications for new messages when tab is not focused

### 3. Group Chat (ChatGroups.jsx)
- **Group List**: Shows all available chat groups
- **Group Messages**: Real-time group messaging
- **Member Count**: Displays number of group members
- **Sender Names**: Shows sender names in group messages

## Technical Implementation

### WebSocket Service (`websocketService.js`)
- **Singleton Pattern**: Single WebSocket connection across the app
- **Event Management**: Custom event system for message handling
- **Room Management**: Join/leave chat rooms for targeted messaging
- **Error Handling**: Comprehensive error handling and reconnection logic

### Chat Hook (`useChatSocket.js`)
- **React Hook**: Custom hook for WebSocket integration
- **Room Management**: Automatic room joining/leaving
- **Message Callbacks**: Register callbacks for specific rooms
- **Connection Management**: Handles connection lifecycle

### Database Integration
- **Chat Rooms**: Stores chat room information in `chat_rooms` table
- **Messages**: Stores all messages in `messages` table
- **User Associations**: Links messages to users via foreign keys
- **Soft Delete**: Supports soft deletion of chat rooms and messages

## API Endpoints Used

### Private Chat
- `GET /api/chat/contacts` - Get available contacts
- `GET /api/chat/rooms/:user_id` - Get user's chat rooms
- `POST /api/chat/room` - Create or get chat room
- `GET /api/chat/messages/:room_id` - Get room messages
- `POST /api/chat/message` - Send message
- `PUT /api/chat/room/:room_id/delete` - Delete chat room

### Group Chat
- `GET /api/chat-group` - Get chat groups
- `GET /api/chat-group/:group_id/messages` - Get group messages
- `POST /api/chat-group/:group_id/messages` - Send group message

## WebSocket Events

### Client to Server
- `user_login` - User authentication
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `chat_message` - Send chat message

### Server to Client
- `welcome` - Welcome message after login
- `new_message` - New message received
- `new_notification` - New notification

## Environment Configuration

The WebSocket service uses the following environment variables:
- `VITE_API_URL` - Backend API URL (default: http://192.168.38.223:3000/api)
- `VITE_WS_URL` - WebSocket URL (default: ws://192.168.38.223:3000)

## Usage

### In Components
```jsx
import useChatSocket from '../../hooks/useChatSocket'

const MyComponent = () => {
  const { joinRoom, leaveRoom, onNewMessage, isConnected } = useChatSocket()
  
  // Join a room
  joinRoom('room_id')
  
  // Listen for messages
  const cleanup = onNewMessage('room_id', (data) => {
    console.log('New message:', data)
  })
  
  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [])
}
```

### Direct WebSocket Service
```jsx
import websocketService from '../../services/websocketService'

// Connect
websocketService.connect(userId, token)

// Send message
websocketService.sendChatMessage(roomId, message, senderId)

// Listen for events
websocketService.on('new_message', (data) => {
  console.log('Message received:', data)
})
```

## Database Schema

### ChatRoom Table
- `id` - Primary key
- `room_id` - Unique room identifier
- `user1_id` - First user ID
- `user2_id` - Second user ID
- `last_message` - Last message content
- `last_message_time` - Last message timestamp
- `unread_count_user1` - Unread count for user1
- `unread_count_user2` - Unread count for user2
- `status_deleted` - Soft delete flag

### Message Table
- `id` - Primary key
- `room_id` - Room identifier
- `sender_id` - Sender user ID
- `message` - Message content
- `message_type` - Message type (text, image, file)
- `is_read` - Read status
- `status_deleted` - Soft delete flag
- `created_at` - Creation timestamp

## Security Features

- **Authentication**: WebSocket connections require valid user authentication
- **Authorization**: Users can only access their own chat rooms
- **Input Validation**: All messages are validated on both client and server
- **SQL Injection Protection**: Uses parameterized queries
- **XSS Protection**: Messages are properly escaped

## Performance Optimizations

- **Connection Pooling**: Single WebSocket connection per user
- **Message Batching**: Efficient message handling
- **Lazy Loading**: Messages loaded on demand
- **Optimistic Updates**: UI updates immediately for better UX
- **Auto-cleanup**: Automatic cleanup of event listeners

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check if backend server is running
   - Verify WebSocket URL in environment variables
   - Check browser console for connection errors

2. **Messages Not Appearing**
   - Verify user authentication
   - Check if user is in the correct chat room
   - Ensure WebSocket connection is active

3. **Database Connection Issues**
   - Check database server status
   - Verify database credentials
   - Check API endpoint responses

### Debug Mode
Enable debug logging by checking browser console for:
- WebSocket connection status
- Message events
- API request/response logs
- Error messages 