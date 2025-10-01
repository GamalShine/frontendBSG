import api from './api'

export const pengajuanService = {
  async list(params = {}) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).trim() !== '') search.set(k, v)
    })
    const qs = search.toString()
    const url = qs ? `/pengajuan?${qs}` : '/pengajuan'
    const resp = await api.get(url)
    return resp?.data
  },
  async updateStatus(id, status) {
    const resp = await api.put(`/pengajuan/${id}/status`, { status })
    return resp?.data
  },
}

export default pengajuanService
