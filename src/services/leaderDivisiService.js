import api from './api'

const leaderDivisiService = {
  async list() {
    const resp = await api.get('/leader/divisi')
    return resp?.data
  }
}

export default leaderDivisiService
