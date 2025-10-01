import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Select from '@/components/UI/Select';
import Table from '@/components/UI/Table';
import Badge from '@/components/UI/Badge';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { anekaGrafikService } from '@/services/anekaGrafikService';

const OwnerAnekaGrafik = () => {
  const [anekaGrafik, setAnekaGrafik] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    date: '',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchAnekaGrafik();
  }, [filters]);

  const fetchAnekaGrafik = async () => {
    try {
      setLoading(true);
      const response = await anekaGrafikService.getAll(filters);
      if (response.success) {
        setAnekaGrafik(response.data);
      }
    } catch (err) {
      setError('Gagal mengambil data aneka grafik');
      console.error('Error fetching aneka grafik:', err);
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

  const handleCreate = () => {
    // Navigate to create form
    console.log('Navigate to create aneka grafik...');
  };

  const handleExport = () => {
    // Export functionality for owner
    console.log('Exporting aneka grafik...');
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold flex items-center justify-between">
            <span>Aneka Grafik - Owner View</span>
            <div className="flex gap-2">
              <Button onClick={handleCreate} variant="default">
                Buat Grafik
              </Button>
              <Button onClick={handleExport} variant="outline">
                Export Data
              </Button>
            </div>
          </h3>
        </CardHeader>
        <CardBody>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Input
              placeholder="Cari grafik..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <Input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
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
                <th>Tanggal</th>
                <th>Judul</th>
                <th>Kategori</th>
                <th>Nilai</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {anekaGrafik.map((grafik) => (
                <tr key={grafik.id}>
                  <td>{new Date(grafik.tanggal).toLocaleDateString('id-ID')}</td>
                  <td>{grafik.judul}</td>
                  <td>{grafik.kategori}</td>
                  <td className="font-mono">
                    Rp {grafik.nilai?.toLocaleString('id-ID')}
                  </td>
                  <td>
                    <Badge variant={grafik.status === 'aktif' ? 'success' : 'secondary'}>
                      {grafik.status}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Detail
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
};

export default OwnerAnekaGrafik;

