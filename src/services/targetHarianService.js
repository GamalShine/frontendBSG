import api from './api';

export const targetHarianService = {
  // List with pagination and filters
  getAll: async (params = {}) => {
    const res = await api.get('/data-target-harian', { params });
    return res.data; // { success, data: items[], pagination }
  },
  // Distinct years from tanggal_target
  getYears: async () => {
    const res = await api.get('/data-target-harian/years');
    return res.data; // { success, data: [{year: 2025}, ...] }
  },
  // Stats overview
  stats: async () => {
    const res = await api.get('/data-target-harian/stats/overview');
    return res.data; // { success, data: { total_records, total_this_month, total_this_year } }
  },
  // Detail by ID
  getById: async (id) => {
    try {
      const res = await api.get(`/data-target-harian/${id}`);
      return res.data; // { success, data }
    } catch (e) {
      // Jika 404, backend mengembalikan { error: 'Data tidak ditemukan' }
      if (e?.response) {
        return e.response.data;
      }
      throw e;
    }
  },
  // Create
  create: async (payload) => {
    const res = await api.post('/data-target-harian', payload);
    return res.data; // { success, data: { id } }
  },
  // Update
  update: async (id, payload) => {
    const res = await api.put(`/data-target-harian/${id}`, payload);
    return res.data; // { success, data: { id } }
  },
  // Delete
  remove: async (id) => {
    const res = await api.delete(`/data-target-harian/${id}`);
    return res.data; // { success, data: { id } }
  }
};

