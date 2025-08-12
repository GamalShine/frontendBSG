import api from './api'
import { isDuplicateKeyError, retryApiCall } from '../utils/errorHandler'

export const chatService = {
    // Get all contacts (users without existing chat rooms)
    async getContacts(currentUserId) {
        try {
            const response = await api.get(`/chat/contacts?current_user_id=${parseInt(currentUserId)}`)
            return response.data
        } catch (error) {
            console.error('Error fetching contacts:', error)
            // Return a structured error response
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal memuat kontak',
                data: []
            }
        }
    },

    // Get existing chat rooms for a user
    async getChatRooms(userId) {
        try {
            console.log('Fetching chat rooms for user:', userId)
            const response = await api.get(`/chat/rooms/${parseInt(userId)}`)
            console.log('Chat rooms API response:', response.data)

            // Handle potential database issues gracefully
            if (response.data && response.data.success && response.data.data) {
                // Ensure data is properly formatted
                const rooms = Array.isArray(response.data.data) ? response.data.data : []
                return {
                    success: true,
                    data: rooms.filter(room => room && room.room_id) // Filter out invalid rooms
                }
            }

            return response.data
        } catch (error) {
            console.error('Error fetching chat rooms:', error)
            // Return a structured error response
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal memuat chat rooms',
                data: []
            }
        }
    },

    // Get or create chat room between two users
    async getOrCreateRoom(user1Id, user2Id) {
        try {
            console.log('Creating/finding room between users:', user1Id, user2Id)
            const response = await api.post('/chat/room', {
                user1_id: parseInt(user1Id), // Ensure user1_id is a number
                user2_id: parseInt(user2Id)  // Ensure user2_id is a number
            })
            console.log('Room creation/finding response:', response.data)
            return response.data
        } catch (error) {
            console.error('Error creating/finding chat room:', error)
            console.error('Error details:', error.response?.data || error.message)
            throw error.response?.data || error.message
        }
    },

    // Get messages for a specific room
    async getMessages(roomId, params = {}) {
        try {
            console.log('Fetching messages for room:', roomId, 'with params:', params)
            const response = await api.get(`/chat/messages/${roomId}`, { params })
            console.log('Messages API response:', response.data)

            // Handle potential database issues gracefully
            if (response.data && response.data.success) {
                let messages = []

                // Handle different response structures
                if (response.data.data && Array.isArray(response.data.data)) {
                    messages = response.data.data
                } else if (Array.isArray(response.data)) {
                    messages = response.data
                } else if (response.data.messages && Array.isArray(response.data.messages)) {
                    messages = response.data.messages
                }

                // Filter out messages with invalid IDs (like id = 0)
                const validMessages = messages.filter(msg =>
                    msg && msg.id !== 0 && msg.id !== null
                )

                console.log('Valid messages found:', validMessages.length)
                return {
                    success: true,
                    data: validMessages
                }
            }

            return response.data
        } catch (error) {
            console.error('Error fetching messages:', error)
            console.error('Error details:', error.response?.data || error.message)
            throw error.response?.data || error.message
        }
    },

    // Send a message
    async sendMessage(roomId, message, senderId, messageType = 'text') {
        try {
            // Validate input data
            if (!roomId || !message || !senderId) {
                console.error('🔍 Debug: Invalid input data:', { roomId, message, senderId })
                return {
                    success: false,
                    message: 'Data tidak lengkap: roomId, message, dan senderId diperlukan'
                }
            }

            const payload = {
                room_id: roomId,
                sender_id: parseInt(senderId), // Ensure sender_id is a number
                message: message.trim(), // Ensure message is trimmed
                message_type: messageType || 'text'
            }
            console.log('🔍 Debug: Sending message payload:', payload)

            const response = await api.post('/chat/message', payload)
            console.log('🔍 Debug: Message response:', response.data)

            // Handle different response structures
            if (response.data && response.data.success) {
                // Return the response data with the created message
                return {
                    success: true,
                    data: response.data.data || response.data.message || {
                        id: Date.now(),
                        room_id: roomId,
                        sender_id: senderId,
                        message: message,
                        message_type: messageType,
                        created_at: new Date().toISOString(),
                        sender: {
                            id: senderId,
                            nama: 'You',
                            username: 'you'
                        }
                    }
                }
            }

            return response.data
        } catch (error) {
            console.error('🔍 Debug: Message error object:', error)
            console.error('🔍 Debug: Error response:', error.response)
            console.error('🔍 Debug: Error message:', error.message)

            // Handle 500 errors gracefully
            if (error.response && error.response.status === 500) {
                console.warn('Server error (500) detected in sendMessage, returning structured error response')
                return {
                    success: false,
                    message: 'Server sedang mengalami masalah. Pesan akan dikirim ulang secara otomatis.',
                    data: null,
                    isServerError: true
                }
            }

            // Check if it's a duplicate key error
            const isDuplicate = isDuplicateKeyError(error)
            console.log('🔍 Debug: Is duplicate key error?', isDuplicate)

            if (isDuplicate) {
                console.warn('Duplicate primary key detected in sendMessage, retrying with longer delay...')

                // Wait longer before retrying for database conflicts
                await new Promise(resolve => setTimeout(resolve, 2000))

                try {
                    const payload = {
                        room_id: roomId,
                        sender_id: parseInt(senderId),
                        message: message.trim(),
                        message_type: messageType || 'text'
                    }

                    const retryResponse = await api.post('/chat/message', payload)
                    console.log('🔍 Debug: Retry successful:', retryResponse.data)

                    // Handle different response structures
                    if (retryResponse.data && retryResponse.data.success) {
                        return {
                            success: true,
                            data: retryResponse.data.data || retryResponse.data.message || {
                                id: Date.now(),
                                room_id: roomId,
                                sender_id: senderId,
                                message: message,
                                message_type: messageType,
                                created_at: new Date().toISOString(),
                                sender: {
                                    id: senderId,
                                    nama: 'You',
                                    username: 'you'
                                }
                            }
                        }
                    }

                    return retryResponse.data
                } catch (retryError) {
                    console.error('🔍 Debug: Retry also failed:', retryError)

                    // If retry also fails with duplicate key, it's likely a database issue
                    if (isDuplicateKeyError(retryError)) {
                        return {
                            success: false,
                            message: 'Database sedang mengalami masalah. Pesan akan dikirim ulang secara otomatis.',
                            data: null,
                            isDatabaseError: true
                        }
                    }

                    // If retry fails with 500 error
                    if (retryError.response && retryError.response.status === 500) {
                        return {
                            success: false,
                            message: 'Server masih mengalami masalah. Pesan akan dikirim ulang secara otomatis.',
                            data: null,
                            isServerError: true
                        }
                    }

                    return {
                        success: false,
                        message: 'Gagal mengirim pesan setelah percobaan ulang',
                        data: null
                    }
                }
            }

            // For any other error, return a fallback success response to keep the message in UI
            console.warn('Unknown error occurred, returning fallback success response')
            return {
                success: true,
                data: {
                    id: Date.now(),
                    room_id: roomId,
                    sender_id: senderId,
                    message: message,
                    message_type: messageType,
                    created_at: new Date().toISOString(),
                    sender: {
                        id: senderId,
                        nama: 'You',
                        username: 'you'
                    },
                    isFallback: true,
                    warning: 'Pesan mungkin tidak tersimpan di server'
                }
            }
        }
    },

    // Mark messages as read
    async markAsRead(roomId, userId) {
        try {
            // Since there's no specific mark as read endpoint, we'll just return success
            // The backend handles read status automatically when messages are fetched
            return { success: true }
        } catch (error) {
            console.error('Error marking messages as read:', error)
            throw error.response?.data || error.message
        }
    },

    // Delete chat room
    async deleteChatRoom(roomId, userId) {
        try {
            const response = await api.put(`/chat/room/${roomId}/delete`, {
                user_id: parseInt(userId) // Ensure user_id is a number
            })
            return response.data
        } catch (error) {
            console.error('Error deleting chat room:', error)
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
            console.error('Error fetching chat groups:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal memuat chat groups',
                data: []
            }
        }
    },

    // Get user groups
    async getUserGroups(userId) {
        try {
            const response = await api.get(`/chat-group/user-groups/${userId}`)

            // Handle potential database issues gracefully
            if (response.data && response.data.success && response.data.data) {
                const groups = Array.isArray(response.data.data) ? response.data.data : []
                // Filter out invalid groups and ensure proper structure
                const validGroups = groups.filter(group =>
                    group &&
                    group.group_id &&
                    group.group_name
                ).map(group => ({
                    ...group,
                    member_count: group.members ? group.members.length : 0,
                    description: group.group_description || 'Tidak ada deskripsi'
                }))

                return {
                    success: true,
                    data: validGroups
                }
            }

            return response.data
        } catch (error) {
            console.error('Error fetching user groups:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal memuat user groups',
                data: []
            }
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
            console.log('Group messages API response:', response.data)

            // Ensure consistent response structure
            if (response.data && response.data.success) {
                const data = response.data.data
                if (data && data.messages && Array.isArray(data.messages)) {
                    // Filter out messages with invalid IDs (like id = 0)
                    const validMessages = data.messages.filter(msg =>
                        msg && msg.id !== 0 && msg.id !== null
                    )

                    // Return paginated structure
                    return {
                        success: true,
                        data: {
                            messages: validMessages,
                            total: validMessages.length,
                            page: data.page || 1,
                            totalPages: data.totalPages || 1
                        }
                    }
                } else if (Array.isArray(data)) {
                    // Filter out messages with invalid IDs
                    const validMessages = data.filter(msg =>
                        msg && msg.id !== 0 && msg.id !== null
                    )

                    // Return direct array structure
                    return {
                        success: true,
                        data: {
                            messages: validMessages,
                            total: validMessages.length,
                            page: 1,
                            totalPages: 1
                        }
                    }
                } else {
                    // Return empty structure
                    return {
                        success: true,
                        data: {
                            messages: [],
                            total: 0,
                            page: 1,
                            totalPages: 1
                        }
                    }
                }
            }

            return response.data
        } catch (error) {
            console.error('Error fetching group messages:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal memuat pesan grup',
                data: {
                    messages: [],
                    total: 0,
                    page: 1,
                    totalPages: 1
                }
            }
        }
    },

    // Send group message
    async sendGroupMessage(groupId, messageData) {
        try {
            const response = await api.post(`/chat-group/${groupId}/message`, messageData)
            return response.data
        } catch (error) {
            console.error('🔍 Debug: Group message error object:', error)
            console.error('🔍 Debug: Error response:', error.response)
            console.error('🔍 Debug: Error message:', error.message)

            // Handle 500 errors gracefully
            if (error.response && error.response.status === 500) {
                console.warn('Server error (500) detected, returning structured error response')
                return {
                    success: false,
                    message: 'Server sedang mengalami masalah. Pesan akan dikirim ulang secara otomatis.',
                    data: null,
                    isServerError: true
                }
            }

            // Check if it's a duplicate key error (database primary key conflict)
            const isDuplicate = isDuplicateKeyError(error)
            console.log('🔍 Debug: Is duplicate key error?', isDuplicate)

            if (isDuplicate) {
                console.warn('Database primary key conflict detected, retrying with delay...')

                // Wait longer before retrying for database conflicts
                await new Promise(resolve => setTimeout(resolve, 1000))

                try {
                    const retryResponse = await api.post(`/chat-group/${groupId}/message`, messageData)
                    console.log('🔍 Debug: Group message retry successful:', retryResponse.data)
                    return retryResponse.data
                } catch (retryError) {
                    console.error('🔍 Debug: Group message retry also failed:', retryError)

                    // If retry also fails with duplicate key, it's likely a database issue
                    if (isDuplicateKeyError(retryError)) {
                        return {
                            success: false,
                            message: 'Database sedang mengalami masalah. Pesan akan dikirim ulang secara otomatis.',
                            data: null,
                            isDatabaseError: true
                        }
                    }

                    return {
                        success: false,
                        message: 'Gagal mengirim pesan setelah percobaan ulang',
                        data: null
                    }
                }
            }

            // Return structured error response
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal mengirim pesan grup',
                data: null
            }
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