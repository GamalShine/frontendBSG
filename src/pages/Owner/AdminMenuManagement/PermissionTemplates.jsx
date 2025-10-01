import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const PermissionTemplates = ({ onApplyTemplate, onClose }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: {}
  });

  // Mock templates data - replace with actual API call
  const mockTemplates = [
    {
      id: 1,
      name: 'Admin Keuangan',
      description: 'Template untuk admin yang mengelola keuangan',
      permissions: {
        'Keuangan': { view: true, create: true, edit: true, delete: false, approve: true },
        'Marketing': { view: true, create: false, edit: false, delete: false, analytics: false },
        'Operasional': { view: true, create: false, edit: false, delete: false, manage: false },
        'SDM': { view: true, create: false, edit: false, delete: false, approve: false },
        'Chat': { view: true, manage: false, moderate: false },
        'Pengumuman': { view: true, create: false, edit: false, delete: false, publish: false },
        'Tugas': { view: true, create: false, edit: false, delete: false, assign: false, approve: false },
        'Training': { view: true, create: false, edit: false, delete: false, enroll: false },
        'Komplain': { view: true, create: false, edit: false, delete: false, resolve: false }
      },
      created_at: '2024-01-15T10:00:00Z',
      usage_count: 3
    },
    {
      id: 2,
      name: 'Admin Marketing',
      description: 'Template untuk admin yang mengelola marketing',
      permissions: {
        'Keuangan': { view: true, create: false, edit: false, delete: false, approve: false },
        'Marketing': { view: true, create: true, edit: true, delete: true, analytics: true },
        'Operasional': { view: true, create: false, edit: false, delete: false, manage: false },
        'SDM': { view: true, create: false, edit: false, delete: false, approve: false },
        'Chat': { view: true, manage: false, moderate: false },
        'Pengumuman': { view: true, create: false, edit: false, delete: false, publish: false },
        'Tugas': { view: true, create: false, edit: false, delete: false, assign: false, approve: false },
        'Training': { view: true, create: false, edit: false, delete: false, enroll: false },
        'Komplain': { view: true, create: false, edit: false, delete: false, resolve: false }
      },
      created_at: '2024-01-15T11:00:00Z',
      usage_count: 2
    },
    {
      id: 3,
      name: 'Admin SDM',
      description: 'Template untuk admin yang mengelola SDM',
      permissions: {
        'Keuangan': { view: true, create: false, edit: false, delete: false, approve: false },
        'Marketing': { view: true, create: false, edit: false, delete: false, analytics: false },
        'Operasional': { view: true, create: false, edit: false, delete: false, manage: false },
        'SDM': { view: true, create: true, edit: true, delete: true, approve: true },
        'Chat': { view: true, manage: false, moderate: false },
        'Pengumuman': { view: true, create: false, edit: false, delete: false, publish: false },
        'Tugas': { view: true, create: false, edit: false, delete: false, assign: false, approve: false },
        'Training': { view: true, create: true, edit: true, delete: true, enroll: true },
        'Komplain': { view: true, create: false, edit: false, delete: false, resolve: false }
      },
      created_at: '2024-01-15T12:00:00Z',
      usage_count: 1
    }
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500));
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Gagal memuat templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setFormData({
      name: '',
      description: '',
      permissions: {}
    });
    setEditingTemplate(null);
    setShowCreateForm(true);
  };

  const handleEditTemplate = (template) => {
    setFormData({
      name: template.name,
      description: template.description,
      permissions: { ...template.permissions }
    });
    setEditingTemplate(template);
    setShowCreateForm(true);
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus template ini?')) {
      return;
    }

    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      toast.success('Template berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Gagal menghapus template');
    }
  };

  const handleSaveTemplate = async () => {
    if (!formData.name.trim()) {
      toast.error('Nama template harus diisi');
      return;
    }

    try {
      if (editingTemplate) {
        // Update existing template
        const updatedTemplate = {
          ...editingTemplate,
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions
        };
        
        setTemplates(prev => prev.map(t => 
          t.id === editingTemplate.id ? updatedTemplate : t
        ));
        toast.success('Template berhasil diupdate!');
      } else {
        // Create new template
        const newTemplate = {
          id: Date.now(),
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
          created_at: new Date().toISOString(),
          usage_count: 0
        };
        
        setTemplates(prev => [newTemplate, ...prev]);
        toast.success('Template berhasil dibuat!');
      }
      
      setShowCreateForm(false);
      setEditingTemplate(null);
      setFormData({ name: '', description: '', permissions: {} });
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Gagal menyimpan template');
    }
  };

  const handleApplyTemplate = (template) => {
    if (onApplyTemplate) {
      onApplyTemplate(template);
    }
    onClose();
  };

  const handleCopyTemplate = (template) => {
    setFormData({
      name: `${template.name} (Copy)`,
      description: template.description,
      permissions: { ...template.permissions }
    });
    setEditingTemplate(null);
    setShowCreateForm(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (showCreateForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-[800px] max-h-[90vh] flex flex-col">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingTemplate ? 'Edit Template' : 'Buat Template Baru'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingTemplate(null);
                  setFormData({ name: '', description: '', permissions: {} });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Template
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan nama template"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan deskripsi template"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="text-sm text-gray-600 mb-3">
                  Template ini akan menggunakan permissions default. Anda dapat mengedit permissions setelah template dibuat.
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingTemplate(null);
                  setFormData({ name: '', description: '', permissions: {} });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveTemplate}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingTemplate ? 'Update' : 'Buat Template'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[900px] max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Permission Templates</h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCreateTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Buat Template</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              Memuat templates...
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada template
              </h3>
              <p className="text-gray-500">
                Buat template pertama untuk mempermudah pengaturan permissions
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {template.name}
                        </h4>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {template.usage_count} penggunaan
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{template.description}</p>
                      <div className="text-sm text-gray-500">
                        Dibuat: {formatDate(template.created_at)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleApplyTemplate(template)}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                        title="Terapkan template"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleCopyTemplate(template)}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Copy template"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Edit template"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus template"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionTemplates;
