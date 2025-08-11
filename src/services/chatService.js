import api from './api'

export const chatService = {
    // Get chat contacts
    async getContacts(currentUserId) {
        try {
            const response = await api.get(`/chat/contacts?current_user_id=${currentUserId}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get or create chat room
    async getOrCreateRoom(user1Id, user2Id) {
        try {
            const roomId = `${Math.min(user1Id, user2Id)}_${Math.max(user1Id, user2Id)}`
            const response = await api.get(`/chat/room/${roomId}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get messages for a room
    async getMessages(roomId, params = {}) {
        try {
            const response = await api.get(`/chat/messages/${roomId}`, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Send message
    async sendMessage(roomId, message, senderId, messageType = 'text') {
        try {
            const response = await api.post('/chat/message', {
                room_id: roomId,
                sender_id: senderId,
                message: message,
                message_type: messageType
            })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Mark messages as read
    async markAsRead(roomId, userId) {
        try {
            const response = await api.put(`/chat/read/${roomId}`, { user_id: userId })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete chat room
    async deleteChatRoom(roomId, userId) {
        try {
            const response = await api.delete(`/chat/room/${roomId}`, {
                data: { user_id: userId }
            })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
}

export const chatGroupService = {
    // Get chat groups
    async getChatGroups(params = {}) {
        try {
            const response = await api.get('/chat-group', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get user groups
    async getUserGroups(userId) {
        try {
            const response = await api.get(`/chat-group/user/${userId}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get chat group by ID
    async getChatGroupById(groupId) {
        try {
            const response = await api.get(`/chat-group/${groupId}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Create new chat group
    async createChatGroup(groupData) {
        try {
            const response = await api.post('/chat-group', groupData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get group messages
    async getGroupMessages(groupId, params = {}) {
        try {
            const response = await api.get(`/chat-group/${groupId}/messages`, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Send group message
    async sendGroupMessage(groupId, messageData) {
        try {
            const response = await api.post(`/chat-group/${groupId}/messages`, messageData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update chat group
    async updateChatGroup(groupId, groupData) {
        try {
            const response = await api.put(`/chat-group/${groupId}`, groupData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete chat group
    async deleteChatGroup(groupId) {
        try {
            const response = await api.delete(`/chat-group/${groupId}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Add member to group
    async addMemberToGroup(groupId, userId) {
        try {
            const response = await api.post(`/chat-group/${groupId}/members`, { user_id: userId })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Remove member from group
    async removeMemberFromGroup(groupId, userId) {
        try {
            const response = await api.delete(`/chat-group/${groupId}/members/${userId}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get group members
    async getGroupMembers(groupId) {
        try {
            const response = await api.get(`/chat-group/${groupId}/members`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
}

export const adminChatService = {
    // Get all chat data for admin
    async getAdminChatData(params = {}) {
        try {
            const response = await api.get('/admin-chat', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get chat statistics
    async getChatStats(params = {}) {
        try {
            const response = await api.get('/admin-chat/stats', { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete message (admin only)
    async deleteMessage(messageId) {
        try {
            const response = await api.delete(`/admin-chat/messages/${messageId}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
} 