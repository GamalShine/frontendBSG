import api from './api'

const tugasSayaService = {
  async list(params = {}) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).trim() !== '') search.set(k, v)
    })
    const qs = search.toString()
    const url = qs ? `/leader/tugas-saya?${qs}` : '/leader/tugas-saya'
    const resp = await api.get(url)
    return resp?.data
  },
  async create(payload) {
    const resp = await api.post('/leader/tugas-saya', payload)
    return resp?.data
  }
}

export default tugasSayaService
