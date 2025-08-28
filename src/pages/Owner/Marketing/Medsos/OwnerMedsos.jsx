import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Badge from '@/components/UI/Badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/UI/Table';
import Select from '@/components/UI/Select';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Instagram,
  Youtube,
  Music,
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  Image,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ownerMedsosService } from '@/services/ownerMedsosService';
import { toast } from 'react-hot-toast';

const OwnerMedsos = () => {
  const [activeSection, setActiveSection] = useState({
    platform: true,
    kol: true,
    anggaran: true
  });
  const [activeMonth, setActiveMonth] = useState({
    platform: 'AGUSTUS',
    kol: 'AGUSTUS',
    anggaran: 'AGUSTUS'
  });

  // Data states
  const [platformData, setPlatformData] = useState([]);
  const [kolData, setKolData] = useState([]);
  const [anggaranData, setAnggaranData] = useState([]);
  const [platformCostsData, setPlatformCostsData] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState({
    platform: true,
    kol: true,
    anggaran: true,
    platformCosts: true
  });
  
  // Error states
  const [error, setError] = useState({
    platform: null,
    kol: null,
    anggaran: null,
    platformCosts: null
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchPlatformData(),
        fetchKolData(),
        fetchAnggaranData(),
        fetchPlatformCostsData()
      ]);
    } catch (error) {
      console.error('Error fetching all data:', error);
    }
  };

  const fetchPlatformData = async () => {
    try {
      setLoading(prev => ({ ...prev, platform: true }));
      setError(prev => ({ ...prev, platform: null }));
      
      const response = await ownerMedsosService.getAllPlatforms();
      setPlatformData(response.data || []);
    } catch (error) {
      console.error('Error fetching platform data:', error);
      setError(prev => ({ ...prev, platform: 'Gagal memuat data platform' }));
      toast.error('Gagal memuat data platform');
    } finally {
      setLoading(prev => ({ ...prev, platform: false }));
    }
  };

  const fetchKolData = async () => {
    try {
      setLoading(prev => ({ ...prev, kol: true }));
      setError(prev => ({ ...prev, kol: null }));
      
      const response = await ownerMedsosService.getAllKOL();
      setKolData(response.data || []);
    } catch (error) {
      console.error('Error fetching KOL data:', error);
      setError(prev => ({ ...prev, kol: 'Gagal memuat data KOL' }));
      toast.error('Gagal memuat data KOL');
    } finally {
      setLoading(prev => ({ ...prev, kol: false }));
    }
  };

  const fetchAnggaranData = async () => {
    try {
      setLoading(prev => ({ ...prev, anggaran: true }));
      setError(prev => ({ ...prev, anggaran: null }));
      
      const response = await ownerMedsosService.getAllAnggaran();
      setAnggaranData(response.data || []);
    } catch (error) {
      console.error('Error fetching anggaran data:', error);
      setError(prev => ({ ...prev, anggaran: 'Gagal memuat data anggaran' }));
      toast.error('Gagal memuat data anggaran');
    } finally {
      setLoading(prev => ({ ...prev, anggaran: false }));
    }
  };

  const fetchPlatformCostsData = async () => {
    try {
      setLoading(prev => ({ ...prev, platformCosts: true }));
      setError(prev => ({ ...prev, platformCosts: null }));
      
      const response = await ownerMedsosService.getAllPlatformCosts();
      setPlatformCostsData(response.data || []);
    } catch (error) {
      console.error('Error fetching platform costs data:', error);
      setError(prev => ({ ...prev, platformCosts: 'Gagal memuat data biaya platform' }));
      toast.error('Gagal memuat data biaya platform');
    } finally {
      setLoading(prev => ({ ...prev, platformCosts: false }));
    }
  };

  const toggleSection = (section) => {
    setActiveSection(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleMonth = (section, month) => {
    setActiveMonth(prev => ({
      ...prev,
      [section]: prev[section] === month ? null : month
    }));
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getPlatformIcon = (platform) => {
    switch (platform?.toUpperCase()) {
      case 'TIKTOK':
        return <Music className="w-5 h-5 text-black" />;
      case 'INSTAGRAM':
        return <Instagram className="w-5 h-5 text-pink-600" />;
      case 'YOUTUBE':
        return <Youtube className="w-5 h-5 text-red-600" />;
      default:
        return <Music className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform?.toUpperCase()) {
      case 'TIKTOK':
        return 'text-black';
      case 'INSTAGRAM':
        return 'text-pink-600';
      case 'YOUTUBE':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const renderPlatformData = () => {
    if (loading.platform) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-red-600" />
          <span className="ml-2 text-gray-600">Memuat data platform...</span>
        </div>
      );
    }

    if (error.platform) {
      return (
        <div className="text-center p-8 text-red-600">
          <p>{error.platform}</p>
          <Button 
            onClick={fetchPlatformData}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white"
          >
            Coba Lagi
          </Button>
        </div>
      );
    }

    if (platformData.length === 0) {
      return (
        <div className="text-center p-8 text-gray-500">
          <p>Belum ada data platform</p>
        </div>
      );
    }

    return platformData.map((platform) => (
      <div key={platform.id} className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold flex items-center ${getPlatformColor(platform.platform)}`}>
            {getPlatformIcon(platform.platform)}
            <span className="ml-2">{platform.platform}</span>
          </h3>
          <div className="flex space-x-2">
            <Link to={`/owner/marketing/medsos/edit/${platform.id}`} className="text-blue-600 hover:text-blue-800">
              <Edit className="w-5 h-5" />
            </Link>
            <button className="text-red-600 hover:text-red-800">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">FOLLOWER SAAT INI</p>
            <p className="text-xl font-bold text-gray-800">{formatNumber(platform.follower_saat_ini || 0)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">KONTEN TERUPLOAD</p>
            <p className="text-xl font-bold text-gray-800">{platform.konten_terupload || 0}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">FOLLOWER BULAN LALU</p>
            <p className="text-xl font-bold text-gray-800">{formatNumber(platform.follower_bulan_lalu || 0)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">STORY TERUPLOAD</p>
            <p className="text-xl font-bold text-gray-800">{platform.story_terupload || 0}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-medium">KONTEN TERBAIK</span>
          {platform.konten_terbaik_link ? (
            <Button 
              onClick={() => window.open(platform.konten_terbaik_link, '_blank')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>BUKA LINK</span>
            </Button>
          ) : (
            <span className="text-gray-400 text-sm">Tidak ada link</span>
          )}
        </div>
      </div>
    ));
  };

  const renderKolData = () => {
    if (loading.kol) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-red-600" />
          <span className="ml-2 text-gray-600">Memuat data KOL...</span>
        </div>
      );
    }

    if (error.kol) {
      return (
        <div className="text-center p-8 text-red-600">
          <p>{error.kol}</p>
          <Button 
            onClick={fetchKolData}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white"
          >
            Coba Lagi
          </Button>
        </div>
      );
    }

    if (kolData.length === 0) {
      return (
        <div className="text-center p-8 text-gray-500">
          <p>Belum ada data KOL</p>
        </div>
      );
    }

    return (
      <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">NO</TableHead>
              <TableHead>AKUN</TableHead>
              <TableHead>FOLLOWER</TableHead>
              <TableHead>RATECARD</TableHead>
              <TableHead className="w-24">AKSI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kolData.map((kol, index) => (
              <TableRow key={kol.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{kol.nama_akun}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Instagram className="w-4 h-4 text-pink-600" />
                      <span className="text-sm">{formatNumber(kol.follower_ig || 0)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Music className="w-4 h-4 text-black" />
                      <span className="text-sm">{formatNumber(kol.follower_tiktok || 0)}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-green-600">
                  {formatCurrency(kol.ratecard)}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Link to={`/owner/marketing/medsos/kol/edit/${kol.id}`} className="text-blue-600 hover:text-blue-800">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-4">
          <Link to="/owner/marketing/medsos/kol/form" className="inline-flex items-center space-x-2 bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium">
            <Plus className="w-4 h-4" />
            <span>TAMBAH DATA KOL</span>
          </Link>
        </div>
      </>
    );
  };

  const renderAnggaranData = () => {
    if (loading.anggaran) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-red-600" />
          <span className="ml-2 text-gray-600">Memuat data anggaran...</span>
        </div>
      );
    }

    if (error.anggaran) {
      return (
        <div className="text-center p-8 text-red-600">
          <p>{error.anggaran}</p>
          <Button 
            onClick={fetchAnggaranData}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white"
          >
            Coba Lagi
          </Button>
        </div>
      );
    }

    if (anggaranData.length === 0) {
      return (
        <div className="text-center p-8 text-gray-500">
          <p>Belum ada data anggaran</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Account-based Table */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Berdasarkan Akun</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">NO</TableHead>
                <TableHead>NAMA AKUN</TableHead>
                <TableHead>FOLLOWER</TableHead>
                <TableHead>RATECARD</TableHead>
                <TableHead className="w-24">AKSI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {anggaranData.map((anggaran, index) => (
                <TableRow key={anggaran.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{anggaran.nama_akun}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Instagram className="w-4 h-4 text-pink-600" />
                        <span className="text-sm">{formatNumber(anggaran.follower_ig || 0)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Music className="w-4 h-4 text-black" />
                        <span className="text-sm">{formatNumber(anggaran.follower_tiktok || 0)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    {formatCurrency(anggaran.ratecard)}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link to={`/owner/marketing/medsos/anggaran/edit/${anggaran.id}`} className="text-blue-600 hover:text-blue-800">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Platform-based Table */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Berdasarkan Platform</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">NO</TableHead>
                <TableHead>PLATFORM</TableHead>
                <TableHead>BIAYA</TableHead>
                <TableHead className="w-24">AKSI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {platformCostsData.map((cost, index) => (
                <TableRow key={cost.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getPlatformIcon(cost.platform)}
                      <span className="font-medium">{cost.platform}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    {formatCurrency(cost.biaya)}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link to={`/owner/marketing/medsos/platform-costs/edit/${cost.id}`} className="text-blue-600 hover:text-blue-800">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-800 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/owner/marketing" className="text-white hover:text-gray-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">MEDSOS</h1>
              <p className="text-sm opacity-90">Marketing - Medsos</p>
            </div>
          </div>
          <button className="text-white hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Last Updated Info */}
      <div className="bg-gray-200 px-4 py-2 text-sm text-gray-600">
        Data terakhir diupdate: {format(new Date(), 'dd MMMM yyyy \'pukul\' HH:mm', { locale: id })}
      </div>

      <div className="container mx-auto p-4 space-y-6">
        {/* PLATFORM Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader 
            className="bg-red-800 text-white cursor-pointer"
            onClick={() => toggleSection('platform')}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">PLATFORM</h2>
              {activeSection.platform ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
          
          {activeSection.platform && (
            <CardBody className="p-0">
              {/* AGUSTUS Month */}
              <div className="border-b border-gray-200">
                <div 
                  className="bg-red-100 px-4 py-3 cursor-pointer flex items-center justify-between"
                  onClick={() => toggleMonth('platform', 'AGUSTUS')}
                >
                  <span className="font-medium text-gray-800">AGUSTUS</span>
                  {activeMonth.platform === 'AGUSTUS' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
                
                {activeMonth.platform === 'AGUSTUS' && (
                  <div className="p-4 space-y-6">
                    {renderPlatformData()}
                  </div>
                )}
              </div>
            </CardBody>
          )}
        </Card>

        {/* DATA BASE KOL Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader 
            className="bg-red-800 text-white cursor-pointer"
            onClick={() => toggleSection('kol')}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">DATA BASE KOL</h2>
              {activeSection.kol ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
          
          {activeSection.kol && (
            <CardBody className="p-0">
              {/* AGUSTUS Month */}
              <div className="border-b border-gray-200">
                <div 
                  className="bg-red-100 px-4 py-3 cursor-pointer flex items-center justify-between"
                  onClick={() => toggleMonth('kol', 'AGUSTUS')}
                >
                  <span className="font-medium text-gray-800">AGUSTUS</span>
                  {activeMonth.kol === 'AGUSTUS' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
                
                {activeMonth.kol === 'AGUSTUS' && (
                  <div className="p-4">
                    {renderKolData()}
                  </div>
                )}
              </div>
            </CardBody>
          )}
        </Card>

        {/* ANGGARAN MARKETING Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader 
            className="bg-red-800 text-white cursor-pointer"
            onClick={() => toggleSection('anggaran')}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">ANGGARAN MARKETING</h2>
              {activeSection.anggaran ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
          
          {activeSection.anggaran && (
            <CardBody className="p-0">
              {/* JULI Month */}
              <div className="border-b border-gray-200">
                <div 
                  className="bg-red-100 px-4 py-3 cursor-pointer flex items-center justify-between"
                  onClick={() => toggleMonth('anggaran', 'JULI')}
                >
                  <span className="font-medium text-gray-800">JULI</span>
                  {activeMonth.anggaran === 'JULI' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
                
                {activeMonth.anggaran === 'JULI' && (
                  <div className="p-4">
                    {renderAnggaranData()}
                  </div>
                )}
              </div>
            </CardBody>
          )}
        </Card>
      </div>
    </div>
  );
};

export default OwnerMedsos;
