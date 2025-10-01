import api from './api'

const divisiService = {
  async list(params = {}) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).trim() !== '') search.set(k, v)
    })
    const qs = search.toString()
    const url = qs ? `/divisi?${qs}` : '/divisi'
    const resp = await api.get(url)
    return resp?.data
  }
}

export default divisiService
