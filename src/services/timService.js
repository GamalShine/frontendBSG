import api from './api'
import { API_ENDPOINTS } from '../config/constants'

export const timService = {
    // Get all tim merah
    async getTimMerah(params = {}) {
        try {
            const response = await api.get(API_ENDPOINTS.TIM.MERAH, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get tim merah by ID
    async getTimMerahById(id) {
        try {
            const response = await api.get(API_ENDPOINTS.TIM.MERAH_BY_ID(id))
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Create new tim merah
    async createTimMerah(timData) {
        try {
            const response = await api.post(API_ENDPOINTS.TIM.MERAH, timData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update tim merah
    async updateTimMerah(id, timData) {
        try {
            const response = await api.put(API_ENDPOINTS.TIM.MERAH_BY_ID(id), timData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Delete tim merah
    async deleteTimMerah(id) {
        try {
            const response = await api.delete(API_ENDPOINTS.TIM.MERAH_BY_ID(id))
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get all tim biru
    async getTimBiru(params = {}) {
        try {
            const response = await api.get(API_ENDPOINTS.TIM.BIRU, { params })
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get tim biru by ID
    async getTimBiruById(id) {
        try {
            const response = await api.get(API_ENDPOINTS.TIM.BIRU_BY_ID(id))
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Get tim biru detail (alias for getTimBiruById)
    async getTimBiruDetail(id) {
        try {
            const response = await api.get(API_ENDPOINTS.TIM.BIRU_BY_ID(id))
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Create new tim biru
    async createTimBiru(timData) {
        try {
            const response = await api.post(API_ENDPOINTS.TIM.BIRU, timData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    // Update tim biru
    async updateTimBiru(id, timData) {
        try {
            const response = await api.put(API_ENDPOINTS.TIM.BIRU_BY_ID(id), timData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

      // Delete tim biru
  async deleteTimBiru(id) {
    try {
      const response = await api.delete(API_ENDPOINTS.TIM.BIRU_BY_ID(id))
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // ===== OWNER METHODS =====

  // Get tim merah for owner (using correct endpoint)
  async getTimMerahForOwner(params = {}) {
    try {
      // Owner read list
      const response = await api.get('/owner/tim-merah-biru/merah', { params })
      return response.data
    } catch (error) {
      console.error('Error in getTimMerahForOwner:', error)
      throw error
    }
  },

  // Get tim biru for owner (using correct endpoint)
  async getTimBiruForOwner(params = {}) {
    try {
      // Owner read list
      const response = await api.get('/owner/tim-merah-biru/biru', { params })
      return response.data
    } catch (error) {
      console.error('Error in getTimBiruForOwner:', error)
      throw error
    }
  },

  // Get detail tim merah for owner (delegate to common endpoint, backend allows owner)
  async getTimMerahByIdForOwner(id) {
    try {
      const response = await api.get(`/tim-merah-biru/merah/${id}`)
      return response.data
    } catch (error) {
      console.error('Error in getTimMerahByIdForOwner:', error)
      throw error
    }
  },

  // Get detail tim biru for owner (delegate to common endpoint, backend allows owner)
  async getTimBiruByIdForOwner(id) {
    try {
      const response = await api.get(`/tim-merah-biru/biru/${id}`)
      return response.data
    } catch (error) {
      console.error('Error in getTimBiruByIdForOwner:', error)
      throw error
    }
  },

  // Create tim merah for owner (delegate to common endpoint)
  async createTimMerahForOwner(payload) {
    try {
      const response = await api.post('/tim-merah-biru/merah', payload)
      return response.data
    } catch (error) {
      console.error('Error in createTimMerahForOwner:', error)
      throw error
    }
  },

  // Create tim biru for owner (delegate to common endpoint)
  async createTimBiruForOwner(payload) {
    try {
      const response = await api.post('/tim-merah-biru/biru', payload)
      return response.data
    } catch (error) {
      console.error('Error in createTimBiruForOwner:', error)
      throw error
    }
  },

  // Update tim merah for owner (delegate to common endpoint)
  async updateTimMerahForOwner(id, payload) {
    try {
      const response = await api.put(`/tim-merah-biru/merah/${id}`, payload)
      return response.data
    } catch (error) {
      console.error('Error in updateTimMerahForOwner:', error)
      throw error
    }
  },

  // Update tim biru for owner (delegate to common endpoint)
  async updateTimBiruForOwner(id, payload) {
    try {
      const response = await api.put(`/tim-merah-biru/biru/${id}`, payload)
      return response.data
    } catch (error) {
      console.error('Error in updateTimBiruForOwner:', error)
      throw error
    }
  },

  // Delete tim merah for owner (delegate to common endpoint)
  async deleteTimMerahForOwner(id) {
    try {
      const response = await api.delete(`/tim-merah-biru/merah/${id}`)
      return response.data
    } catch (error) {
      console.error('Error in deleteTimMerahForOwner:', error)
      throw error
    }
  },

  // Delete tim biru for owner (delegate to common endpoint)
  async deleteTimBiruForOwner(id) {
    try {
      const response = await api.delete(`/tim-merah-biru/biru/${id}`)
      return response.data
    } catch (error) {
      console.error('Error in deleteTimBiruForOwner:', error)
      throw error
    }
  },

  // Snapshot helper: get nama/divisi/posisi from SDM by user_id
  async getSnapshot(userId) {
    try {
      const response = await api.get('/tim-merah-biru/snapshot', { params: { user_id: userId } })
      return response.data
    } catch (error) {
      console.error('Error in getSnapshot:', error)
      throw error
    }
  }
}

 