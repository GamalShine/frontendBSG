import api from './api'
import { API_ENDPOINTS } from '../config/constants'

export const aturanService = {
  async listOwner(params = {}) {
    const res = await api.get(API_ENDPOINTS.SDM.ATURAN.OWNER.LIST, { params })
    return res.data
  },
  async listAdmin(params = {}) {
    // Backend belum menyediakan endpoint khusus admin (/admin/aturan)
    // Gunakan endpoint umum /aturan agar kompatibel
    const res = await api.get(API_ENDPOINTS.SDM.ATURAN.LIST, { params })
    return res.data
  },
  async listDivisi(params = {}) {
    const res = await api.get(API_ENDPOINTS.SDM.ATURAN.DIVISI.LIST, { params })
    return res.data
  },
  async listTim(params = {}) {
    const res = await api.get(API_ENDPOINTS.SDM.ATURAN.TIM.LIST, { params })
    return res.data
  },
  async getByIdOwner(id) {
    const res = await api.get(API_ENDPOINTS.SDM.ATURAN.OWNER.BY_ID(id))
    return res.data
  },
  async getByIdAdmin(id) {
    // Backend belum menyediakan endpoint khusus admin (/admin/aturan/:id)
    // Gunakan endpoint umum /aturan/:id
    const res = await api.get(API_ENDPOINTS.SDM.ATURAN.BY_ID(id))
    return res.data
  },
  async getByIdDivisi(id) {
    const res = await api.get(API_ENDPOINTS.SDM.ATURAN.DIVISI.BY_ID(id))
    return res.data
  },
  async getByIdTim(id) {
    const res = await api.get(API_ENDPOINTS.SDM.ATURAN.TIM.BY_ID(id))
    return res.data
  },
  async createAdmin(payload) {
    // Gunakan endpoint umum untuk create
    const res = await api.post(API_ENDPOINTS.SDM.ATURAN.LIST, payload)
    return res.data
  },
  async updateAdmin(id, payload) {
    // Gunakan endpoint umum untuk update
    const res = await api.put(API_ENDPOINTS.SDM.ATURAN.BY_ID(id), payload)
    return res.data
  },
  async deleteAdmin(id) {
    // Gunakan endpoint umum untuk delete (soft)
    const res = await api.delete(API_ENDPOINTS.SDM.ATURAN.BY_ID(id))
    return res.data
  }
}

