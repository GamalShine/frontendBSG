import api from './api'
import { API_ENDPOINTS } from '../config/constants'

export const aturanService = {
  async listOwner(params = {}) {
    const res = await api.get(API_ENDPOINTS.SDM.ATURAN.OWNER.LIST, { params })
    return res.data
  },
  async listAdmin(params = {}) {
    const res = await api.get(API_ENDPOINTS.SDM.ATURAN.ADMIN.LIST, { params })
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
    const res = await api.get(API_ENDPOINTS.SDM.ATURAN.ADMIN.BY_ID(id))
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
    const res = await api.post(API_ENDPOINTS.SDM.ATURAN.ADMIN.LIST, payload)
    return res.data
  },
  async updateAdmin(id, payload) {
    const res = await api.put(API_ENDPOINTS.SDM.ATURAN.ADMIN.BY_ID(id), payload)
    return res.data
  },
  async deleteAdmin(id) {
    const res = await api.delete(API_ENDPOINTS.SDM.ATURAN.ADMIN.BY_ID(id))
    return res.data
  }
}
