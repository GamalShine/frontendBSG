import React from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import Card, { CardHeader, CardBody } from '../../../components/UI/Card'
import AccountManagement from '../AccountManagement'

const OwnerSettingsKelolaAkun = () => {
  const { user } = useAuth()

  if (user?.role !== 'owner') {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Akses Ditolak</h3>
        </CardHeader>
        <CardBody>
          <p className="text-gray-600">Halaman ini hanya dapat diakses oleh Owner.</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pengaturan - Kelola Akun</h1>
            <p className="text-gray-600">Tambah, ubah, nonaktifkan, atau hapus akun (Owner/Admin)</p>
          </div>
        </CardHeader>
      </Card>

      <AccountManagement />
    </div>
  )
}

export default OwnerSettingsKelolaAkun
