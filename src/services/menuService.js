import api from './api'

export const menuService = {
    async getMenus() {
        const response = await api.get('/pic-menu')
        return response.data
    },

    async getMenuById(id) {
        const response = await api.get(`/pic-menu/${id}`)
        return response.data
    },

    async createMenu(menuData) {
        const response = await api.post('/pic-menu', menuData)
        return response.data
    },

    async updateMenu(id, menuData) {
        const response = await api.put(`/pic-menu/${id}`, menuData)
        return response.data
    },

    async deleteMenu(id) {
        const response = await api.delete(`/pic-menu/${id}`)
        return response.data
    },

    async getMenusByUser(userId) {
        const response = await api.get(`/pic-menu/user/${userId}`)
        return response.data
    },
} 