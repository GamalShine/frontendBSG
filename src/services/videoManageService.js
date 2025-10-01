import api from './api'

export const videoManageService = {
  async getCurrent(role) {
    const res = await api.get(`/upload/video-manage/${role}`)
    return res.data
  },
  async upload(role, file) {
    const form = new FormData()
    form.append('video', file)
    const res = await api.post(`/upload/video-manage/${role}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },
  async list(role) {
    const res = await api.get(`/upload/video-manage/${role}/list`)
    return res.data
  },
  async setActive(id) {
    const res = await api.patch(`/upload/video-manage/${id}/activate`)
    return res.data
  },
  async remove(id) {
    const res = await api.delete(`/upload/video-manage/${id}`)
    return res.data
  }
}
