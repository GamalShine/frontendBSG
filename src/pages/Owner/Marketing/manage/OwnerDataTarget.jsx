import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Select from '@/components/UI/Select';
import Table from '@/components/UI/Table';
import Badge from '@/components/UI/Badge';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

const OwnerDataTarget = () => {
  const [dataTarget, setDataTarget] = useState([]);
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
    fetchDataTarget();
  }, [filters]);

  const fetchDataTarget = async () => {
    try {
      setLoading(true);
      // Simulate API call
      const mockData = [
        {
          id: 1,
          nama_target: 'PT. ABC Corporation',
          kategori: 'CORPORATE',
          alamat: 'Jl. Sudirman No. 123, Jakarta',
          kontak: '021-1234567',
          email: 'info@abc.com',
          status: 'PROSPEK',
          nilai_target: 500000000
        },
        {
          id: 2,
          nama_target: 'CV. XYZ Trading',
          kategori: 'UMKM',
          alamat: 'Jl. Gatot Subroto No. 45, Bandung',
          kontak: '022-9876543',
          email: 'contact@xyz.com',
          status: 'AKTIF',
          nilai_target: 150000000
        }
      ];
      setDataTarget(mockData);
    } catch (err) {
      setError('Gagal mengambil data target');
      console.error('Error fetching data target:', err);
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
    console.log('Exporting data target...');
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Data Target Marketing - Owner View</span>
            <Button onClick={handleExport} variant="outline">
              Export Data
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Input
              placeholder="Cari target..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <Select
              value={filters.kategori}
              onValueChange={(value) => handleFilterChange('kategori', value)}
            >
              <option value="">Semua Kategori</option>
              <option value="CORPORATE">CORPORATE</option>
              <option value="UMKM">UMKM</option>
              <option value="INDIVIDU">INDIVIDU</option>
              <option value="GOVERNMENT">GOVERNMENT</option>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <option value="">Semua Status</option>
              <option value="PROSPEK">PROSPEK</option>
              <option value="AKTIF">AKTIF</option>
              <option value="NONAKTIF">NONAKTIF</option>
              <option value="CLOSED">CLOSED</option>
            </Select>
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
                <th>Nama Target</th>
                <th>Kategori</th>
                <th>Alamat</th>
                <th>Kontak</th>
                <th>Status</th>
                <th>Nilai Target</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataTarget.map((target) => (
                <tr key={target.id}>
                  <td className="font-medium">{target.nama_target}</td>
                  <td>
                    <Badge variant="outline">{target.kategori}</Badge>
                  </td>
                  <td className="max-w-xs truncate">{target.alamat}</td>
                  <td>{target.kontak}</td>
                  <td>
                    <Badge variant={
                      target.status === 'AKTIF' ? 'success' : 
                      target.status === 'PROSPEK' ? 'warning' : 'secondary'
                    }>
                      {target.status}
                    </Badge>
                  </td>
                  <td className="font-mono">
                    Rp {target.nilai_target?.toLocaleString('id-ID')}
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

export default OwnerDataTarget;

