import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Select from '@/components/UI/Select';
import Table from '@/components/UI/Table';
import Badge from '@/components/UI/Badge';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

const OwnerDaftarGaji = () => {
  const [daftarGaji, setDaftarGaji] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    bulan: '',
    tahun: new Date().getFullYear(),
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchDaftarGaji();
  }, [filters]);

  const fetchDaftarGaji = async () => {
    try {
      setLoading(true);
      // Simulate API call
      const mockData = [
        {
          id: 1,
          nama: 'John Doe',
          jabatan: 'Manager',
          gaji_pokok: 5000000,
          tunjangan: 1000000,
          total: 6000000,
          status: 'aktif'
        },
        {
          id: 2,
          nama: 'Jane Smith',
          jabatan: 'Supervisor',
          gaji_pokok: 4000000,
          tunjangan: 800000,
          total: 4800000,
          status: 'aktif'
        }
      ];
      setDaftarGaji(mockData);
    } catch (err) {
      setError('Gagal mengambil data daftar gaji');
      console.error('Error fetching daftar gaji:', err);
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

  const handleExport = () => {
    // Export functionality for owner
    console.log('Exporting daftar gaji...');
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Daftar Gaji - Owner View</span>
            <Button onClick={handleExport} variant="outline">
              Export Data
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Input
              placeholder="Cari karyawan..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <Select
              value={filters.bulan}
              onValueChange={(value) => handleFilterChange('bulan', value)}
            >
              <option value="">Semua Bulan</option>
              <option value="1">Januari</option>
              <option value="2">Februari</option>
              <option value="3">Maret</option>
              <option value="4">April</option>
              <option value="5">Mei</option>
              <option value="6">Juni</option>
              <option value="7">Juli</option>
              <option value="8">Agustus</option>
              <option value="9">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </Select>
            <Input
              type="number"
              placeholder="Tahun"
              value={filters.tahun}
              onChange={(e) => handleFilterChange('tahun', e.target.value)}
            />
            <Select
              value={filters.limit}
              onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
            >
              <option value={10}>10 per halaman</option>
              <option value={25}>25 per halaman</option>
              <option value={50}>50 per halaman</option>
            </Select>
          </div>

          {/* Table */}
          <Table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Jabatan</th>
                <th>Gaji Pokok</th>
                <th>Tunjangan</th>
                <th>Total</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {daftarGaji.map((gaji) => (
                <tr key={gaji.id}>
                  <td>{gaji.nama}</td>
                  <td>{gaji.jabatan}</td>
                  <td className="font-mono">
                    Rp {gaji.gaji_pokok?.toLocaleString('id-ID')}
                  </td>
                  <td className="font-mono">
                    Rp {gaji.tunjangan?.toLocaleString('id-ID')}
                  </td>
                  <td className="font-mono font-bold">
                    Rp {gaji.total?.toLocaleString('id-ID')}
                  </td>
                  <td>
                    <Badge variant={gaji.status === 'aktif' ? 'success' : 'secondary'}>
                      {gaji.status}
                    </Badge>
                  </td>
                  <td>
                    <Button variant="outline" size="sm">
                      Detail
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerDaftarGaji;

