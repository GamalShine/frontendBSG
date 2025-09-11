import api from './api';

// Admin endpoints
const adminBase = '/admin/data-bina-lingkungan';
// Owner endpoints
const ownerBase = '/owner/data-bina-lingkungan';

export const adminDataBinaLingkunganService = {
  getAll: (params = {}) => api.get(adminBase, { params }),
  getById: (id) => api.get(`${adminBase}/${id}`),
  create: (payload) => {
    const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
    return api.post(adminBase, payload, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
  },
  update: (id, payload) => {
    const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
    return api.put(`${adminBase}/${id}`, payload, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
  },
  remove: (id) => api.delete(`${adminBase}/${id}`),
  getLocations: () => api.get(`${adminBase}/locations/list`),
  getByLocation: (lokasi) => api.get(`${adminBase}/location/${encodeURIComponent(lokasi)}`),
};

export const ownerDataBinaLingkunganService = {
  getAll: (params = {}) => api.get(ownerBase, { params }),
  getById: (id) => api.get(`${ownerBase}/${id}`),
  create: (payload) => {
    const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
    return api.post(ownerBase, payload, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
  },
  update: (id, payload) => {
    const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
    return api.put(`${ownerBase}/${id}`, payload, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
  },
  remove: (id) => api.delete(`${ownerBase}/${id}`),
  getLocations: () => api.get(`${ownerBase}/locations/list`),
  getByLocation: (lokasi) => api.get(`${ownerBase}/location/${encodeURIComponent(lokasi)}`),
};
