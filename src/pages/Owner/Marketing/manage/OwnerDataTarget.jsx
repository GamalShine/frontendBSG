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
import { dataTargetService } from '@/services/dataTargetService';

const OwnerDataTarget = () => {
  const [dataTarget, setDataTarget] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    page: 1,
    limit: 10
  });
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchDataTarget();
  }, [filters]);

  const fetchDataTarget = async () => {
    try {
      setLoading(true);
      const response = await dataTargetService.owner.getAll({
        search: filters.search,
        page: filters.page,
        limit: filters.limit
      });
      // shape: { success, data: { items, pagination, statistics } }
      setDataTarget(response?.data?.items || []);
      setStats(response?.data?.statistics || {});
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
    // Open PDF export in new tab
    window.open('/api/owner/data-target/export/pdf', '_blank');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
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
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
            />
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
                <TableHead>Target Nominal</TableHead>
                <TableHead>Dibuat Pada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataTarget.map((target) => (
                <TableRow key={target.id}>
                  <TableCell className="font-medium">{target.nama_target}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(target.target_nominal)}</TableCell>
                  <TableCell>{target.created_at ? new Date(target.created_at).toLocaleDateString('id-ID') : '-'}</TableCell>
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

