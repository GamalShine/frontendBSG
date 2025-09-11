import api from './api';

export const mediaSosialService = {
  // Distinct years
  getYears: async () => {
    const res = await api.get('/media-sosial/years/distinct');
    return res.data; // { success, data: [tahun, ...] }
  },

  // Distinct months for a given year
  getMonths: async (year) => {
    const res = await api.get('/media-sosial/months/distinct', { params: { year } });
    return res.data; // { success, data: [bulanNumber, ...] }
  },

  // List with filters
  list: async ({ page = 1, limit = 50, search = '', date = '', year = '', month = '' } = {}) => {
    const res = await api.get('/media-sosial', { params: { page, limit, search, date, year, month } });
    return res.data; // { success, data: [...], pagination }
  },

  getById: async (id) => {
    const res = await api.get(`/media-sosial/${id}`);
    return res.data;
  },

  create: async (payload) => {
    const res = await api.post('/media-sosial', payload);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await api.put(`/media-sosial/${id}`, payload);
    return res.data;
  },

  remove: async (id) => {
    const res = await api.delete(`/media-sosial/${id}`);
    return res.data;
  },

  stats: async () => {
    const res = await api.get('/media-sosial/stats/overview');
    return res.data;
  },
};
