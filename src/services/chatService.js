import api from './api'

export const chatService = {
    async getChatRooms() {
        const response = await api.get('/chat/rooms')
        return response.data
    },

    async getChatRoom(roomId) {
        const response = await api.get(`/chat/rooms/${roomId}`)
        return response.data
    },

    async getMessages(roomId) {
        const response = await api.get(`/chat/rooms/${roomId}/messages`)
        return response.data
    },

    async sendMessage(roomId, messageData) {
        const formData = new FormData()
        formData.append('message', messageData.message)
        formData.append('message_type', messageData.message_type || 'text')

        if (messageData.file) {
            formData.append('file', messageData.file)
        }

        const response = await api.post(`/chat/rooms/${roomId}/messages`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },

    async createChatRoom(userId) {
        const response = await api.post('/chat/room', { user2_id: userId })
        return response.data
    },

    async markAsRead(roomId) {
        const response = await api.patch(`/chat/rooms/${roomId}/read`)
        return response.data
    },

    async getUnreadCount() {
        const response = await api.get('/chat/unread-count')
        return response.data
    },

    async getContacts(currentUserId) {
        const response = await api.get(`/chat/contacts?current_user_id=${currentUserId}`)
        return response.data
    },

    async deleteChatRoom(roomId) {
        const response = await api.delete(`/chat/rooms/${roomId}`)
        return response.data
    },

    async markMessageAsRead(messageId) {
        const response = await api.patch(`/chat/messages/${messageId}/read`)
        return response.data
    }
} 