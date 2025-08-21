import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Select from '@/components/UI/Select';
import Table from '@/components/UI/Table';
import Badge from '@/components/UI/Badge';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

const OwnerDataTim = () => {
  const [dataTim, setDataTim] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    divisi: '',
    status: '',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchDataTim();
  }, [filters]);

  const fetchDataTim = async () => {
    try {
      setLoading(true);
      // Simulate API call
      const mockData = [
        {
          id: 1,
          nama: 'John Doe',
          email: 'john.doe@bosgil.com',
          divisi: 'KEUANGAN',
          jabatan: 'Manager Keuangan',
          status: 'AKTIF',
          join_date: '2020-01-15',
          training_status: 'COMPLETED'
        },
        {
          id: 2,
          nama: 'Jane Smith',
          email: 'jane.smith@bosgil.com',
          divisi: 'OPERASIONAL',
          jabatan: 'Supervisor Operasional',
          status: 'AKTIF',
          join_date: '2021-03-20',
          training_status: 'IN_PROGRESS'
        },
        {
          id: 3,
          nama: 'Bob Johnson',
          email: 'bob.johnson@bosgil.com',
          divisi: 'MARKETING',
          jabatan: 'Marketing Specialist',
          status: 'NONAKTIF',
          join_date: '2019-11-10',
          training_status: 'NOT_STARTED'
        }
      ];
      setDataTim(mockData);
    } catch (err) {
      setError('Gagal mengambil data tim');
      console.error('Error fetching data tim:', err);
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
    console.log('Exporting data tim...');
  };

  const getTrainingStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Selesai</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="warning">Sedang Berjalan</Badge>;
      case 'NOT_STARTED':
        return <Badge variant="secondary">Belum Dimulai</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Data Tim - Owner View</span>
            <Button onClick={handleExport} variant="outline">
              Export Data
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Input
              placeholder="Cari tim..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <Select
              value={filters.divisi}
              onValueChange={(value) => handleFilterChange('divisi', value)}
            >
              <option value="">Semua Divisi</option>
              <option value="KEUANGAN">KEUANGAN</option>
              <option value="OPERASIONAL">OPERASIONAL</option>
              <option value="MARKETING">MARKETING</option>
              <option value="SDM">SDM</option>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <option value="">Semua Status</option>
              <option value="AKTIF">AKTIF</option>
              <option value="NONAKTIF">NONAKTIF</option>
              <option value="CUTI">CUTI</option>
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
                <th>Nama</th>
                <th>Email</th>
                <th>Divisi</th>
                <th>Jabatan</th>
                <th>Status</th>
                <th>Join Date</th>
                <th>Training Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataTim.map((tim) => (
                <tr key={tim.id}>
                  <td className="font-medium">{tim.nama}</td>
                  <td>{tim.email}</td>
                  <td>
                    <Badge variant="outline">{tim.divisi}</Badge>
                  </td>
                  <td>{tim.jabatan}</td>
                  <td>
                    <Badge variant={tim.status === 'AKTIF' ? 'success' : 'secondary'}>
                      {tim.status}
                    </Badge>
                  </td>
                  <td>{new Date(tim.join_date).toLocaleDateString('id-ID')}</td>
                  <td>{getTrainingStatusBadge(tim.training_status)}</td>
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

export default OwnerDataTim;

