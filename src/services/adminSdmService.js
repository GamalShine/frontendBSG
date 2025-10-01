import api from './api';

export const adminSdmService = {
  // Divisi
  getDivisi: async (params = {}) => {
    const res = await api.get('/admin/sdm/divisi', { params });
    return res.data;
  },
  createDivisi: async (payload) => {
    const res = await api.post('/admin/sdm/divisi', payload);
    return res.data;
  },
  updateDivisi: async (id, payload) => {
    const res = await api.put(`/admin/sdm/divisi/${id}`, payload);
    return res.data;
  },
  deleteDivisi: async (id) => {
    const res = await api.delete(`/admin/sdm/divisi/${id}`);
    return res.data;
  },

  // Jabatan
  getJabatan: async (params = {}) => {
    const res = await api.get('/admin/sdm/jabatan', { params });
    return res.data;
  },
  createJabatan: async (payload) => {
    const res = await api.post('/admin/sdm/jabatan', payload);
    return res.data;
  },
  updateJabatan: async (id, payload) => {
    const res = await api.put(`/admin/sdm/jabatan/${id}`, payload);
    return res.data;
  },
  deleteJabatan: async (id) => {
    const res = await api.delete(`/admin/sdm/jabatan/${id}`);
    return res.data;
  },

  // Employees
  getEmployees: async (params = {}) => {
    const res = await api.get('/admin/sdm/employees', { params });
    return res.data;
  },
  getEmployeeById: async (id) => {
    const res = await api.get(`/admin/sdm/employees/${id}`);
    return res.data;
  },
  createEmployee: async (payload) => {
    const res = await api.post('/admin/sdm/employees', payload);
    return res.data;
  },
  updateEmployee: async (id, payload) => {
    const res = await api.put(`/admin/sdm/employees/${id}`, payload);
    return res.data;
  },
  deleteEmployee: async (id) => {
    const res = await api.delete(`/admin/sdm/employees/${id}`);
    return res.data;
  },

  // Hierarchy
  getHierarchy: async () => {
    const res = await api.get('/admin/sdm/hierarchy');
    return res.data;
  }
};
