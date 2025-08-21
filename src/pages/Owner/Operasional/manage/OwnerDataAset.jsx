import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Badge from '@/components/UI/Badge';
import Select from '@/components/UI/Select';
import Table from '@/components/UI/Table';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

const OwnerDataAset = () => {
  const [dataAset, setDataAset] = useState([]);
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
    fetchDataAset();
  }, [filters]);

  const fetchDataAset = async () => {
    try {
      setLoading(true);
      // Simulate API call
      const mockData = [
        {
          id: 1,
          nama_aset: 'TANAH KAVLING',
          kategori: 'PROPERTI',
          no_sertifikat: '0205',
          lokasi: 'JL KAV. PERKEBUNAN NO. 1 BENCONGAN KELAPA DUA KAB. TANGERANG',
          atas_nama: 'N.A. RAMADHAN',
          data_pembelian: '2010',
          status: 'DIJAMINKAN DI PANIN BANK CAB. TANGERANG',
          data_pbb: 'TERBAYAR, 2025'
        },
        {
          id: 2,
          nama_aset: 'TOYOTA AVANZA',
          kategori: 'KENDARAAN_OPERASIONAL',
          no_sertifikat: '',
          lokasi: 'GARASI UTAMA',
          atas_nama: 'PT. BOSGIL GROUP',
          data_pembelian: '2022',
          status: 'AKTIF',
          data_pbb: 'TERBAYAR, 2025'
        }
      ];
      setDataAset(mockData);
    } catch (err) {
      setError('Gagal mengambil data aset');
      console.error('Error fetching data aset:', err);
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
    console.log('Exporting data aset...');
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Data Aset - Owner View</span>
            <Button onClick={handleExport} variant="outline">
              Export Data
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Input
              placeholder="Cari aset..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <Select
              value={filters.kategori}
              onValueChange={(value) => handleFilterChange('kategori', value)}
            >
              <option value="">Semua Kategori</option>
              <option value="PROPERTI">PROPERTI</option>
              <option value="KENDARAAN_PRIBADI">KENDARAAN PRIBADI</option>
              <option value="KENDARAAN_OPERASIONAL">KENDARAAN OPERASIONAL</option>
              <option value="KENDARAAN_DISTRIBUSI">KENDARAAN DISTRIBUSI</option>
              <option value="ELEKTRONIK">ELEKTRONIK</option>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <option value="">Semua Status</option>
              <option value="AKTIF">AKTIF</option>
              <option value="NONAKTIF">NONAKTIF</option>
              <option value="DIJAMINKAN">DIJAMINKAN</option>
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
                <th>Nama Aset</th>
                <th>Kategori</th>
                <th>No Sertifikat</th>
                <th>Lokasi</th>
                <th>Atas Nama</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataAset.map((aset) => (
                <tr key={aset.id}>
                  <td className="font-medium">{aset.nama_aset}</td>
                  <td>
                    <Badge variant="outline">{aset.kategori}</Badge>
                  </td>
                  <td>{aset.no_sertifikat || '-'}</td>
                  <td className="max-w-xs truncate">{aset.lokasi}</td>
                  <td>{aset.atas_nama}</td>
                  <td>
                    <Badge variant={aset.status === 'AKTIF' ? 'success' : 'secondary'}>
                      {aset.status}
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

export default OwnerDataAset;

