import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import websocketService from '../services/websocketService'

const useChatSocket = () => {
    const { user, isAuthenticated } = useAuth()
    const messageCallbacks = useRef(new Map())
    const notificationCallbacks = useRef(new Map())

    // Connect to WebSocket when user is authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            const token = localStorage.getItem('token')
            websocketService.connect(user.id, token)
        } else {
            websocketService.disconnect()
        }

        return () => {
            websocketService.disconnect()
        }
    }, [isAuthenticated, user])

    // Listen for new messages
    useEffect(() => {
        const handleNewMessage = (data) => {
            console.log('💬 New message received:', data)

            // Call all registered callbacks for this room
            if (messageCallbacks.current.has(data.roomId)) {
                messageCallbacks.current.get(data.roomId).forEach(callback => {
                    callback(data)
                })
            }
        }

        const handleNewNotification = (data) => {
            console.log('🔔 New notification received:', data)

            // Call all registered notification callbacks
            notificationCallbacks.current.forEach(callback => {
                callback(data)
            })
        }

        websocketService.on('new_message', handleNewMessage)
        websocketService.on('new_notification', handleNewNotification)

        return () => {
            websocketService.off('new_message', handleNewMessage)
            websocketService.off('new_notification', handleNewNotification)
        }
    }, [])

    // Join a chat room
    const joinRoom = useCallback((roomId) => {
        if (websocketService.getConnectionStatus().isConnected) {
            websocketService.joinChatRoom(roomId)
            console.log(`🔗 Joined chat room: ${roomId}`)
        }
    }, [])

    // Leave a chat room
    const leaveRoom = useCallback((roomId) => {
        if (websocketService.getConnectionStatus().isConnected) {
            websocketService.leaveChatRoom(roomId)
            console.log(`🔗 Left chat room: ${roomId}`)
        }
    }, [])

    // Register callback for new messages in a specific room
    const onNewMessage = useCallback((roomId, callback) => {
        if (!messageCallbacks.current.has(roomId)) {
            messageCallbacks.current.set(roomId, [])
        }
        messageCallbacks.current.get(roomId).push(callback)

        // Return cleanup function
        return () => {
            if (messageCallbacks.current.has(roomId)) {
                const callbacks = messageCallbacks.current.get(roomId)
                const index = callbacks.indexOf(callback)
                if (index > -1) {
                    callbacks.splice(index, 1)
                }
            }
        }
    }, [])

    // Register callback for new notifications
    const onNewNotification = useCallback((callback) => {
        const callbackId = Date.now() + Math.random()
        notificationCallbacks.current.set(callbackId, callback)

        // Return cleanup function
        return () => {
            notificationCallbacks.current.delete(callbackId)
        }
    }, [])

    // Send a chat message via WebSocket (for real-time preview)
    const sendMessage = useCallback((roomId, message, senderId) => {
        if (websocketService.getConnectionStatus().isConnected) {
            websocketService.sendChatMessage(roomId, message, senderId)
        }
    }, [])

    // Get connection status
    const getConnectionStatus = useCallback(() => {
        return websocketService.getConnectionStatus()
    }, [])

    return {
        joinRoom,
        leaveRoom,
        onNewMessage,
        onNewNotification,
        sendMessage,
        getConnectionStatus,
        isConnected: websocketService.getConnectionStatus().isConnected
    }
}

export default useChatSocket 