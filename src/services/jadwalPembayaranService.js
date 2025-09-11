import api from './api'

export const jadwalPembayaranService = {
  // List all jadwal pembayaran
  getAll: async () => {
    const res = await api.get('/jadwal-pembayaran')
    return res.data
  },

  // Get by ID
  getById: async (id) => {
    const res = await api.get(`/jadwal-pembayaran/${id}`)
    return res.data
  },

  // Create
  create: async (data) => {
    const res = await api.post('/jadwal-pembayaran', data)
    return res.data
  },

  // Update
  update: async (id, data) => {
    const res = await api.put(`/jadwal-pembayaran/${id}`, data)
    return res.data
  },

  // Delete (soft delete)
  remove: async (id) => {
    const res = await api.delete(`/jadwal-pembayaran/${id}`)
    return res.data
  },

  // Get available PICs (for dropdown)
  getPics: async () => {
    const res = await api.get('/jadwal-pembayaran/pics')
    return res.data
  },

  // Initialize default items (Owner only)
  initializeDefault: async () => {
    const res = await api.post('/jadwal-pembayaran/initialize-default')
    return res.data
  }
}
