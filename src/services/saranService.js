import api from './api'

export const saranService = {
  // List saran untuk admin (hanya miliknya)
  async getSaran(params = {}) {
    try {
      const res = await api.get('/saran', { params })
      return res.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // List saran untuk owner (semua admin)
  async getOwnerSaran(params = {}) {
    try {
      const res = await api.get('/saran/owner', { params })
      return res.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  async getById(id) {
    try {
      const res = await api.get(`/saran/${id}`)
      return res.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  async create(payload) {
    try {
      const res = await api.post('/saran', payload)
      return res.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  async update(id, payload) {
    try {
      const res = await api.put(`/saran/${id}`, payload)
      return res.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  async remove(id) {
    try {
      const res = await api.delete(`/saran/${id}`)
      return res.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }
}

export default saranService
