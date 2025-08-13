import { toast } from 'react-hot-toast'
import { API_CONFIG } from '../config/constants'

class WebSocketService {
    constructor() {
        this.ws = null
        this.isConnected = false
        this.reconnectAttempts = 0
        this.maxReconnectAttempts = 5
        this.reconnectDelay = 1000
        this.eventListeners = new Map()
        this.userId = null
    }

    connect(userId, token) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return
        }

        this.userId = userId
        const wsUrl = API_CONFIG.getWsUrl()

        try {
            console.log('🔌 Attempting to connect to WebSocket:', wsUrl)
            this.ws = new WebSocket(wsUrl)

            this.ws.onopen = () => {
                console.log('🔌 WebSocket connected')
                this.isConnected = true
                this.reconnectAttempts = 0

                // Send user login message
                this.send({
                    type: 'user_login',
                    data: { userId: parseInt(userId) }
                })

                toast.success('Terhubung ke server real-time!')
            }

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    this.handleMessage(data)
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error)
                }
            }

            this.ws.onclose = (event) => {
                console.log('🔌 WebSocket disconnected:', event.code, event.reason)
                this.isConnected = false

                if (event.code !== 1000) { // Not a normal closure
                    this.attemptReconnect()
                }

                toast.error('Terputus dari server real-time')
            }

            this.ws.onerror = (error) => {
                console.error('🔌 WebSocket error:', error)
                // Don't show error toast on initial connection failure
                // Only show if we were previously connected
                if (this.isConnected) {
                    toast.error('Kesalahan koneksi WebSocket')
                }
            }
        } catch (error) {
            console.error('Error creating WebSocket connection:', error)
            toast.error('Gagal membuat koneksi WebSocket')
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close(1000, 'User disconnect')
            this.ws = null
            this.isConnected = false
            this.userId = null
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnection attempts reached')
            toast.error('Gagal terhubung ulang ke server')
            return
        }

        this.reconnectAttempts++
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

        setTimeout(() => {
            if (this.userId) {
                const token = localStorage.getItem('token')
                this.connect(this.userId, token)
            }
        }, this.reconnectDelay * this.reconnectAttempts)
    }

    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data))
        } else {
            console.warn('WebSocket is not connected')
        }
    }

    handleMessage(data) {
        console.log('📨 WebSocket message received:', data)

        switch (data.type) {
            case 'welcome':
                console.log('Welcome message:', data.data)
                break

            case 'new_message':
                this.emit('new_message', data.data)
                break

            case 'new_notification':
                this.emit('new_notification', data.data)
                break

            default:
                console.log('Unknown message type:', data.type)
        }
    }

    // Event listener management
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, [])
        }
        this.eventListeners.get(event).push(callback)
    }

    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event)
            const index = listeners.indexOf(callback)
            if (index > -1) {
                listeners.splice(index, 1)
            }
        }
    }

    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data)
                } catch (error) {
                    console.error('Error in event listener:', error)
                }
            })
        }
    }

    // Chat-specific methods
    joinChatRoom(roomId) {
        this.send({
            type: 'join_room',
            data: { room: `chat_${roomId}` }
        })
    }

    leaveChatRoom(roomId) {
        this.send({
            type: 'leave_room',
            data: { room: `chat_${roomId}` }
        })
    }

    sendChatMessage(roomId, message, senderId) {
        this.send({
            type: 'chat_message',
            data: {
                roomId: roomId,
                message: message,
                sender: senderId
            }
        })
    }

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts
        }
    }
}

// Create singleton instance
const websocketService = new WebSocketService()

export default websocketService 