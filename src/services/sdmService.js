    import api from './api'

// SDM (Data Tim) service
// Backend routes base: /api/admin/sdm
const BASE = '/admin/sdm'

export const sdmService = {
  // Divisi
  getDivisi: (params = {}) => api.get(`${BASE}/divisi`, { params }).then(r => r.data),
  createDivisi: (payload) => api.post(`${BASE}/divisi`, payload).then(r => r.data),
  updateDivisi: (id, payload) => api.put(`${BASE}/divisi/${id}`, payload).then(r => r.data),
  deleteDivisi: (id) => api.delete(`${BASE}/divisi/${id}`).then(r => r.data),

  // Jabatan
  getJabatan: (params = {}) => api.get(`${BASE}/jabatan`, { params }).then(r => r.data),
  createJabatan: (payload) => api.post(`${BASE}/jabatan`, payload).then(r => r.data),
  updateJabatan: (id, payload) => api.put(`${BASE}/jabatan/${id}`, payload).then(r => r.data),
  deleteJabatan: (id) => api.delete(`${BASE}/jabatan/${id}`).then(r => r.data),

  // Karyawan (employees)
  getEmployees: (params = {}) => api.get(`${BASE}/employees`, { params }).then(r => r.data),
  getEmployeeById: (id) => api.get(`${BASE}/employees/${id}`).then(r => r.data),
  createEmployee: (payload) => api.post(`${BASE}/employees`, payload).then(r => r.data),
  updateEmployee: (id, payload) => api.put(`${BASE}/employees/${id}`, payload).then(r => r.data),
  deleteEmployee: (id) => api.delete(`${BASE}/employees/${id}`).then(r => r.data),

  // Hierarchy tree for frontend
  getHierarchy: () => api.get(`${BASE}/hierarchy`).then(r => r.data),
}

export default sdmService
