import api from './api';

export const picMenuService = {
  // Get all PIC menu items for a specific user
  async getUserPicMenus(userId) {
    try {
      const response = await api.get(`/pic-menu/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user PIC menus:', error);
      throw error;
    }
  },

  // Get all PIC menu items
  async getAllPicMenus() {
    try {
      const response = await api.get('/pic-menu');
      return response.data;
    } catch (error) {
      console.error('Error fetching all PIC menus:', error);
      throw error;
    }
  },

  // Create new PIC menu item
  async createPicMenu(menuData) {
    try {
      const response = await api.post('/pic-menu', menuData);
      return response.data;
    } catch (error) {
      console.error('Error creating PIC menu:', error);
      throw error;
    }
  },

  // Update PIC menu item
  async updatePicMenu(id, menuData) {
    try {
      const response = await api.put(`/pic-menu/${id}`, menuData);
      return response.data;
    } catch (error) {
      console.error('Error updating PIC menu:', error);
      throw error;
    }
  },

  // Delete PIC menu item (soft delete)
  async deletePicMenu(id) {
    try {
      const response = await api.delete(`/pic-menu/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting PIC menu:', error);
      throw error;
    }
  },

  // Get PIC menu by ID
  async getPicMenuById(id) {
    try {
      const response = await api.get(`/pic-menu/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching PIC menu by ID:', error);
      throw error;
    }
  },

  // Get users who have access to specific menu
  async getUsersByMenu(menuLink) {
    try {
      const response = await api.get(`/pic-menu/menu/${encodeURIComponent(menuLink)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users by menu:', error);
      throw error;
    }
  },

  // Assign menu to user
  async assignMenuToUser(userId, menuData) {
    try {
      const response = await api.post('/pic-menu/assign', {
        user_id: userId,
        ...menuData
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning menu to user:', error);
      throw error;
    }
  },

  // Remove menu from user
  async removeMenuFromUser(userId, menuId) {
    try {
      const response = await api.delete(`/pic-menu/user/${userId}/menu/${menuId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing menu from user:', error);
      throw error;
    }
  },

  // Bulk assign menus to user
  async bulkAssignMenusToUser(userId, menuIds) {
    try {
      const response = await api.post('/pic-menu/bulk-assign', {
        user_id: userId,
        menu_ids: menuIds
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk assigning menus to user:', error);
      throw error;
    }
  },

  // Get menu statistics
  async getMenuStatistics() {
    try {
      const response = await api.get('/pic-menu/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching menu statistics:', error);
      throw error;
    }
  }
};
