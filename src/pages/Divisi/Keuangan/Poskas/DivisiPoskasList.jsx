import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Badge from '@/components/UI/Badge';
import Select from '@/components/UI/Select';
import Table from '@/components/UI/Table';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

const DivisiPoskasList = () => {
  const [poskasList, setPoskasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    kategori: '',
    status: '',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchPoskasList();
  }, [filters]);

  const fetchPoskasList = async () => {
    try {
      setLoading(true);
      // Simulate API call - divisi can only view their own data
      const mockData = [
        {
          id: 1,
          tanggal_poskas: '2024-08-18',
          isi_poskas: 'Laporan keuangan harian divisi keuangan',
          kategori: 'HARIAN',
          status: 'AKTIF',
          created_by: 'John Doe',
          divisi: 'KEUANGAN'
        },
        {
          id: 2,
          tanggal_poskas: '2024-08-17',
          isi_poskas: 'Review budget bulanan',
          kategori: 'BULANAN',
          status: 'AKTIF',
          created_by: 'Jane Smith',
          divisi: 'KEUANGAN'
        }
      ];
      setPoskasList(mockData);
    } catch (err) {
      setError('Gagal mengambil data poskas');
      console.error('Error fetching poskas list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AKTIF':
        return <Badge variant="success">Aktif</Badge>;
      case 'NONAKTIF':
        return <Badge variant="secondary">Nonaktif</Badge>;
      case 'DRAFT':
        return <Badge variant="warning">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getKategoriBadge = (kategori) => {
    switch (kategori) {
      case 'HARIAN':
        return <Badge variant="outline">Harian</Badge>;
      case 'MINGGUAN':
        return <Badge variant="outline">Mingguan</Badge>;
      case 'BULANAN':
        return <Badge variant="outline">Bulanan</Badge>;
      case 'KHUSUS':
        return <Badge variant="outline">Khusus</Badge>;
      default:
        return <Badge variant="outline">{kategori}</Badge>;
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Daftar Poskas - Divisi Keuangan (Read Only)</h3>
        </CardHeader>
        <CardBody>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Input
              placeholder="Cari poskas..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <Select
              value={filters.kategori}
              onValueChange={(value) => handleFilterChange('kategori', value)}
            >
              <option value="">Semua Kategori</option>
              <option value="HARIAN">Harian</option>
              <option value="MINGGUAN">Mingguan</option>
              <option value="BULANAN">Bulanan</option>
              <option value="KHUSUS">Khusus</option>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <option value="">Semua Status</option>
              <option value="AKTIF">Aktif</option>
              <option value="NONAKTIF">Nonaktif</option>
              <option value="DRAFT">Draft</option>
            </Select>
          </div>

          {/* Table */}
          <Table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Isi Poskas</th>
                <th>Kategori</th>
                <th>Status</th>
                <th>Dibuat Oleh</th>
                <th>Divisi</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {poskasList.map((poskas) => (
                <tr key={poskas.id}>
                  <td>{new Date(poskas.tanggal_poskas).toLocaleDateString('id-ID')}</td>
                  <td className="max-w-xs truncate">{poskas.isi_poskas}</td>
                  <td>{getKategoriBadge(poskas.kategori)}</td>
                  <td>{getStatusBadge(poskas.status)}</td>
                  <td>{poskas.created_by}</td>
                  <td>
                    <Badge variant="outline">{poskas.divisi}</Badge>
                  </td>
                  <td>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      Lihat Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Info Message */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800 text-sm">
              <strong>Info:</strong> Divisi hanya dapat melihat data poskas yang terkait dengan divisi masing-masing. 
              Untuk mengubah atau menambah data, silakan hubungi Admin atau Owner.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DivisiPoskasList;

