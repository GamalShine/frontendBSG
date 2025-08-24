import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Select, { 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/UI/Select';
import Table, { 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/UI/Table';
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
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Data Target Marketing - Owner View</h2>
            <Button onClick={handleExport} variant="outline">
              Export Data
            </Button>
          </div>
        </CardHeader>
        <CardBody>
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
              <SelectTrigger>
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua Kategori</SelectItem>
                <SelectItem value="CORPORATE">CORPORATE</SelectItem>
                <SelectItem value="UMKM">UMKM</SelectItem>
                <SelectItem value="INDIVIDU">INDIVIDU</SelectItem>
                <SelectItem value="GOVERNMENT">GOVERNMENT</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua Status</SelectItem>
                <SelectItem value="PROSPEK">PROSPEK</SelectItem>
                <SelectItem value="AKTIF">AKTIF</SelectItem>
                <SelectItem value="NONAKTIF">NONAKTIF</SelectItem>
                <SelectItem value="CLOSED">CLOSED</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.limit}
              onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="10 per halaman" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={10}>10 per halaman</SelectItem>
                <SelectItem value={25}>25 per halaman</SelectItem>
                <SelectItem value={50}>50 per halaman</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Target</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Nilai Target</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataTarget.map((target) => (
                <TableRow key={target.id}>
                  <TableCell className="font-medium">{target.nama_target}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{target.kategori}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{target.alamat}</TableCell>
                  <TableCell>{target.kontak}</TableCell>
                  <TableCell>
                    <Badge variant={
                      target.status === 'AKTIF' ? 'success' : 
                      target.status === 'PROSPEK' ? 'warning' : 'secondary'
                    }>
                      {target.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">
                    Rp {target.nilai_target?.toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
};

export default OwnerDataTarget;

