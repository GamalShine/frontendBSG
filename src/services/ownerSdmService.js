import api from './api'

export const ownerSdmService = {
  // Hierarchy (read-only)
  async getHierarchy() {
    const res = await api.get('/owner/sdm/hierarchy')
    return res.data
  },
}
