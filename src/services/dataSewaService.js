import api from './api';

// Owner-facing service (read-only) using admin endpoints that are auth-protected
export const dataSewaService = {
  getAll: async () => {
    const res = await api.get('/admin/data-sewa');
    return res.data;
  },
  getCategories: async () => {
    const res = await api.get('/admin/data-sewa/categories/list');
    return res.data;
  },
  getByCategory: async (kategori) => {
    const res = await api.get(`/admin/data-sewa/category/${encodeURIComponent(kategori)}`);
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/admin/data-sewa/${id}`);
    return res.data;
  }
};
