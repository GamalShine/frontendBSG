import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { settingsService } from '../../services/settingsService'
import { 
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Database,
  Shield,
  Bell,
  Mail,
  Globe,
  FileText,
  Users,
  Lock,
  Palette
} from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import Switch from '../../components/UI/Switch'
import Textarea from '../../components/UI/Textarea'
import toast from 'react-hot-toast'
import AccountManagement from './AccountManagement'

const Settings = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    // General Settings
    company_name: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    timezone: 'Asia/Jakarta',
    date_format: 'DD/MM/YYYY',
    time_format: '24',
    
    // Security Settings
    password_min_length: 8,
    password_require_special: true,
    session_timeout: 30,
    max_login_attempts: 5,
    enable_2fa: false,
    require_email_verification: true,
    
    // Notification Settings
    email_notifications: true,
    push_notifications: true,
    notification_sound: true,
    auto_backup: true,
    backup_frequency: 'daily',
    
    // System Settings
    maintenance_mode: false,
    debug_mode: false,
    log_level: 'info',
    max_file_size: 5,
    allowed_file_types: 'pdf,doc,docx,jpg,jpeg,png,gif',
    
    // User Settings
    allow_registration: false,
    require_admin_approval: true,
    default_user_role: 'divisi',
    max_users: 100,
    
    // Appearance Settings
    theme: 'light',
    primary_color: '#3B82F6',
    sidebar_collapsed: false,
    show_animations: true
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await settingsService.getSettings()
      
      if (response.success) {
        setSettings(prev => ({
          ...prev,
          ...response.data
        }))
      }
    } catch (error) {
      toast.error('Gagal memuat pengaturan')
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (name, value) => {
    setSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      const response = await settingsService.updateSettings(settings)
      
      if (response.success) {
        toast.success('Pengaturan berhasil disimpan')
      } else {
        toast.error('Gagal menyimpan pengaturan')
      }
    } catch (error) {
      toast.error('Gagal menyimpan pengaturan')
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!window.confirm('Apakah Anda yakin ingin mereset semua pengaturan ke default?')) {
      return
    }

    try {
      setLoading(true)
      const response = await settingsService.resetSettings()
      
      if (response.success) {
        toast.success('Pengaturan berhasil direset')
        loadSettings()
      } else {
        toast.error('Gagal mereset pengaturan')
      }
    } catch (error) {
      toast.error('Gagal mereset pengaturan')
      console.error('Error resetting settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'general', name: 'Umum', icon: SettingsIcon },
    { id: 'security', name: 'Keamanan', icon: Shield },
    { id: 'notifications', name: 'Notifikasi', icon: Bell },
    { id: 'system', name: 'Sistem', icon: Database },
    { id: 'users', name: 'Pengguna', icon: Users },
    { id: 'accounts', name: 'Kelola Akun', icon: Users },
    { id: 'appearance', name: 'Tampilan', icon: Palette }
  ]

  // Hanya owner yang melihat tab Kelola Akun
  const availableTabs = (user?.role === 'owner')
    ? tabs
    : tabs.filter(t => t.id !== 'accounts')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat pengaturan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem</h1>
          <p className="text-gray-600">Kelola konfigurasi sistem perusahaan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Default
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardBody className="p-0">
                <nav className="space-y-1">
                  {availableTabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {tab.name}
                      </button>
                    )
                  })}
                </nav>
              </CardBody>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Pengaturan Umum</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Perusahaan
                      </label>
                      <Input
                        value={settings.company_name}
                        onChange={(e) => handleChange('company_name', e.target.value)}
                        placeholder="Masukkan nama perusahaan"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Perusahaan
                      </label>
                      <Input
                        type="email"
                        value={settings.company_email}
                        onChange={(e) => handleChange('company_email', e.target.value)}
                        placeholder="info@perusahaan.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telepon Perusahaan
                      </label>
                      <Input
                        value={settings.company_phone}
                        onChange={(e) => handleChange('company_phone', e.target.value)}
                        placeholder="+62 21 1234 5678"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <Select
                        value={settings.timezone}
                        onChange={(e) => handleChange('timezone', e.target.value)}
                      >
                        <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                        <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                        <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat Perusahaan
                    </label>
                    <Textarea
                      value={settings.company_address}
                      onChange={(e) => handleChange('company_address', e.target.value)}
                      placeholder="Masukkan alamat lengkap perusahaan"
                      rows={3}
                    />
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Pengaturan Keamanan</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimal Panjang Password
                      </label>
                      <Input
                        type="number"
                        value={settings.password_min_length}
                        onChange={(e) => handleChange('password_min_length', parseInt(e.target.value))}
                        min="6"
                        max="20"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timeout Sesi (menit)
                      </label>
                      <Input
                        type="number"
                        value={settings.session_timeout}
                        onChange={(e) => handleChange('session_timeout', parseInt(e.target.value))}
                        min="5"
                        max="480"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maksimal Percobaan Login
                      </label>
                      <Input
                        type="number"
                        value={settings.max_login_attempts}
                        onChange={(e) => handleChange('max_login_attempts', parseInt(e.target.value))}
                        min="3"
                        max="10"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maksimal Ukuran File (MB)
                      </label>
                      <Input
                        type="number"
                        value={settings.max_file_size}
                        onChange={(e) => handleChange('max_file_size', parseInt(e.target.value))}
                        min="1"
                        max="50"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Wajib Karakter Khusus
                        </label>
                        <p className="text-sm text-gray-500">
                          Password harus mengandung karakter khusus
                        </p>
                      </div>
                      <Switch
                        checked={settings.password_require_special}
                        onChange={(checked) => handleChange('password_require_special', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Aktifkan 2FA
                        </label>
                        <p className="text-sm text-gray-500">
                          Wajibkan autentikasi dua faktor
                        </p>
                      </div>
                      <Switch
                        checked={settings.enable_2fa}
                        onChange={(checked) => handleChange('enable_2fa', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Verifikasi Email
                        </label>
                        <p className="text-sm text-gray-500">
                          Wajibkan verifikasi email untuk registrasi
                        </p>
                      </div>
                      <Switch
                        checked={settings.require_email_verification}
                        onChange={(checked) => handleChange('require_email_verification', checked)}
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Pengaturan Notifikasi</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Notifikasi Email
                        </label>
                        <p className="text-sm text-gray-500">
                          Kirim notifikasi melalui email
                        </p>
                      </div>
                      <Switch
                        checked={settings.email_notifications}
                        onChange={(checked) => handleChange('email_notifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Notifikasi Push
                        </label>
                        <p className="text-sm text-gray-500">
                          Tampilkan notifikasi push di browser
                        </p>
                      </div>
                      <Switch
                        checked={settings.push_notifications}
                        onChange={(checked) => handleChange('push_notifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Suara Notifikasi
                        </label>
                        <p className="text-sm text-gray-500">
                          Putar suara saat ada notifikasi
                        </p>
                      </div>
                      <Switch
                        checked={settings.notification_sound}
                        onChange={(checked) => handleChange('notification_sound', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Backup Otomatis
                        </label>
                        <p className="text-sm text-gray-500">
                          Lakukan backup data secara otomatis
                        </p>
                      </div>
                      <Switch
                        checked={settings.auto_backup}
                        onChange={(checked) => handleChange('auto_backup', checked)}
                      />
                    </div>
                  </div>
                  
                  {settings.auto_backup && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Frekuensi Backup
                      </label>
                      <Select
                        value={settings.backup_frequency}
                        onChange={(e) => handleChange('backup_frequency', e.target.value)}
                      >
                        <option value="daily">Harian</option>
                        <option value="weekly">Mingguan</option>
                        <option value="monthly">Bulanan</option>
                      </Select>
                    </div>
                  )}
                </CardBody>
              </Card>
            )}

            {/* System Settings */}
            {activeTab === 'system' && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Pengaturan Sistem</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Level Log
                      </label>
                      <Select
                        value={settings.log_level}
                        onChange={(e) => handleChange('log_level', e.target.value)}
                      >
                        <option value="error">Error</option>
                        <option value="warn">Warning</option>
                        <option value="info">Info</option>
                        <option value="debug">Debug</option>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipe File yang Diizinkan
                      </label>
                      <Input
                        value={settings.allowed_file_types}
                        onChange={(e) => handleChange('allowed_file_types', e.target.value)}
                        placeholder="pdf,doc,docx,jpg,jpeg,png,gif"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Mode Maintenance
                        </label>
                        <p className="text-sm text-gray-500">
                          Aktifkan mode maintenance untuk perbaikan sistem
                        </p>
                      </div>
                      <Switch
                        checked={settings.maintenance_mode}
                        onChange={(checked) => handleChange('maintenance_mode', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Mode Debug
                        </label>
                        <p className="text-sm text-gray-500">
                          Aktifkan mode debug untuk pengembangan
                        </p>
                      </div>
                      <Switch
                        checked={settings.debug_mode}
                        onChange={(checked) => handleChange('debug_mode', checked)}
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* User Settings */}
            {activeTab === 'users' && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Pengaturan Pengguna</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role Default
                      </label>
                      <Select
                        value={settings.default_user_role}
                        onChange={(e) => handleChange('default_user_role', e.target.value)}
                      >
                        <option value="divisi">Divisi</option>
                        <option value="leader">Leader</option>
                        <option value="admin">Admin</option>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maksimal Pengguna
                      </label>
                      <Input
                        type="number"
                        value={settings.max_users}
                        onChange={(e) => handleChange('max_users', parseInt(e.target.value))}
                        min="10"
                        max="1000"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Izinkan Registrasi
                        </label>
                        <p className="text-sm text-gray-500">
                          Izinkan pengguna mendaftar sendiri
                        </p>
                      </div>
                      <Switch
                        checked={settings.allow_registration}
                        onChange={(checked) => handleChange('allow_registration', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Persetujuan Admin
                        </label>
                        <p className="text-sm text-gray-500">
                          Wajibkan persetujuan admin untuk registrasi
                        </p>
                      </div>
                      <Switch
                        checked={settings.require_admin_approval}
                        onChange={(checked) => handleChange('require_admin_approval', checked)}
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Pengaturan Tampilan</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tema
                      </label>
                      <Select
                        value={settings.theme}
                        onChange={(e) => handleChange('theme', e.target.value)}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Warna Utama
                      </label>
                      <Input
                        type="color"
                        value={settings.primary_color}
                        onChange={(e) => handleChange('primary_color', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Sidebar Collapsed
                        </label>
                        <p className="text-sm text-gray-500">
                          Sidebar dalam keadaan collapsed secara default
                        </p>
                      </div>
                      <Switch
                        checked={settings.sidebar_collapsed}
                        onChange={(checked) => handleChange('sidebar_collapsed', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Animasi
                        </label>
                        <p className="text-sm text-gray-500">
                          Tampilkan animasi dan transisi
                        </p>
                      </div>
                      <Switch
                        checked={settings.show_animations}
                        onChange={(checked) => handleChange('show_animations', checked)}
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Save Button */}
            <Card>
              <CardBody>
                <div className="flex justify-end gap-3">
                  <Button
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Simpan Pengaturan
                      </>
                    )}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Settings 