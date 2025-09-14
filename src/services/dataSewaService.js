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
  },
  create: async (formData) => {
    const res = await api.post('/admin/data-sewa', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  update: async (id, formData) => {
    const res = await api.put(`/admin/data-sewa/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  remove: async (id) => {
    const res = await api.delete(`/admin/data-sewa/${id}`);
    return res.data;
  }
};
