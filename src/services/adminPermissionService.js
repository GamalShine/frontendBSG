import api from './api';

export const adminPermissionService = {
  // Get all admin users
  async getAdminUsers() {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin users:', error);
      throw error;
    }
  },

  // Get menu permissions for specific admin
  async getAdminPermissions(adminId) {
    try {
      const response = await api.get(`/admin/permissions/${adminId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching admin permissions:', error);
      throw error;
    }
  },

  // Save menu permissions for specific admin
  async saveAdminPermissions(adminId, permissions) {
    try {
      const response = await api.post(`/admin/permissions/${adminId}`, {
        permissions
      });
      return response.data;
    } catch (error) {
      console.error('Error saving admin permissions:', error);
      throw error;
    }
  },

  // Get all menu structure
  async getMenuStructure() {
    try {
      const response = await api.get('/admin/menu-structure');
      return response.data;
    } catch (error) {
      console.error('Error fetching menu structure:', error);
      throw error;
    }
  },

  // Reset permissions to default
  async resetPermissions(adminId) {
    try {
      const response = await api.post(`/admin/permissions/${adminId}/reset`);
      return response.data;
    } catch (error) {
      console.error('Error resetting permissions:', error);
      throw error;
    }
  },

  // Bulk update permissions for multiple admins
  async bulkUpdatePermissions(permissionsData) {
    try {
      const response = await api.post('/admin/permissions/bulk-update', {
        permissions: permissionsData
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating permissions:', error);
      throw error;
    }
  },

  // Get permission templates
  async getPermissionTemplates() {
    try {
      const response = await api.get('/admin/permission-templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching permission templates:', error);
      throw error;
    }
  },

  // Apply permission template to admin
  async applyPermissionTemplate(adminId, templateId) {
    try {
      const response = await api.post(`/admin/permissions/${adminId}/apply-template`, {
        template_id: templateId
      });
      return response.data;
    } catch (error) {
      console.error('Error applying permission template:', error);
      throw error;
    }
  }
};
