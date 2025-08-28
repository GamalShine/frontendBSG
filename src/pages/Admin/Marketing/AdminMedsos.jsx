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
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter, useDialog } from '@/components/UI/Dialog';
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
import { medsosService } from '@/services/medsosService';
import { toast } from 'react-hot-toast';

const AdminMedsos = () => {
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
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');

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

  // Fetch data when search or filter changes
  useEffect(() => {
    if (searchTerm || platformFilter !== 'all') {
      fetchFilteredData();
    } else {
      fetchAllData();
    }
  }, [searchTerm, platformFilter]);

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

  const fetchFilteredData = async () => {
    try {
      if (platformFilter !== 'all') {
        await fetchPlatformData();
      }
      if (searchTerm) {
        await fetchSearchResults();
      }
    } catch (error) {
      console.error('Error fetching filtered data:', error);
    }
  };

  const fetchSearchResults = async () => {
    try {
      const response = await medsosService.searchAll(searchTerm);
      // Handle search results based on response structure
      if (response.platforms) setPlatformData(response.platforms);
      if (response.kol) setKolData(response.kol);
      if (response.anggaran) setAnggaranData(response.anggaran);
      if (response.platformCosts) setPlatformCostsData(response.platformCosts);
    } catch (error) {
      console.error('Error searching:', error);
      toast.error('Gagal melakukan pencarian');
    }
  };

  const fetchPlatformData = async () => {
    try {
      setLoading(prev => ({ ...prev, platform: true }));
      setError(prev => ({ ...prev, platform: null }));
      
      let params = {};
      if (platformFilter !== 'all') {
        params.platform = platformFilter;
      }

      const response = await medsosService.getAllPlatforms(params);
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
      
      const response = await medsosService.getAllKOL();
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
      
      const response = await medsosService.getAllAnggaran();
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
      
      const response = await medsosService.getAllPlatformCosts();
      setPlatformCostsData(response.data || []);
    } catch (error) {
      console.error('Error fetching platform costs data:', error);
      setError(prev => ({ ...prev, platformCosts: 'Gagal memuat data biaya platform' }));
      toast.error('Gagal memuat data biaya platform');
    } finally {
      setLoading(prev => ({ ...prev, platformCosts: false }));
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      return;
    }

    try {
      let response;
      switch (type) {
        case 'platform':
          response = await medsosService.deletePlatform(id);
          break;
        case 'kol':
          response = await medsosService.deleteKOL(id);
          break;
        case 'anggaran':
          response = await medsosService.deleteAnggaran(id);
          break;
        case 'platformCosts':
          response = await medsosService.deletePlatformCosts(id);
          break;
      default:
          throw new Error('Invalid type');
      }

      if (response.success) {
        toast.success('Data berhasil dihapus');
        // Refresh data
        fetchAllData();
      } else {
        toast.error('Gagal menghapus data');
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      toast.error('Gagal menghapus data');
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

  // Inline modal form components
  const PlatformCreateModal = ({ onSuccess }) => {
    const { handleOpenChange } = useDialog();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
      platform: '',
      follower_saat_ini: '',
      follower_bulan_lalu: '',
      konten_terupload: '',
      story_terupload: '',
      konten_terbaik_link: ''
    });

    const submit = async (e) => {
      e.preventDefault();
      if (!form.platform || form.follower_saat_ini === '' || form.follower_bulan_lalu === '' || form.konten_terupload === '' || form.story_terupload === '') {
        toast.error('Semua field wajib diisi (kecuali link)');
        return;
      }
      try {
        setSaving(true);
        await medsosService.createPlatform({
          platform: form.platform,
          follower_saat_ini: parseInt(form.follower_saat_ini, 10),
          follower_bulan_lalu: parseInt(form.follower_bulan_lalu, 10),
          konten_terupload: parseInt(form.konten_terupload, 10),
          story_terupload: parseInt(form.story_terupload, 10),
          konten_terbaik_link: form.konten_terbaik_link || null
        });
        toast.success('Data platform berhasil ditambahkan');
        onSuccess?.();
        handleOpenChange(false);
      } catch (err) {
        console.error(err);
        toast.error('Gagal menambahkan data platform');
      } finally {
        setSaving(false);
      }
    };

    return (
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Tambah Data Platform</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
              <Select value={form.platform} onValueChange={(v)=>setForm(prev=>({...prev, platform:v}))} placeholder="Pilih platform" options={[{value:'TIKTOK',label:'TikTok'},{value:'INSTAGRAM',label:'Instagram'},{value:'YOUTUBE',label:'YouTube'}]} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follower Saat Ini</label>
                <Input type="number" min="0" value={form.follower_saat_ini} onChange={(e)=>setForm(prev=>({...prev, follower_saat_ini:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follower Bulan Lalu</label>
                <Input type="number" min="0" value={form.follower_bulan_lalu} onChange={(e)=>setForm(prev=>({...prev, follower_bulan_lalu:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konten Terupload</label>
                <Input type="number" min="0" value={form.konten_terupload} onChange={(e)=>setForm(prev=>({...prev, konten_terupload:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Story Terupload</label>
                <Input type="number" min="0" value={form.story_terupload} onChange={(e)=>setForm(prev=>({...prev, story_terupload:e.target.value}))} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Konten Terbaik (opsional)</label>
                <Input type="url" placeholder="https://..." value={form.konten_terbaik_link} onChange={(e)=>setForm(prev=>({...prev, konten_terbaik_link:e.target.value}))} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={()=>handleOpenChange(false)}>Batal</Button>
              <Button type="submit" disabled={saving}>{saving?'Menyimpan...':'Simpan'}</Button>
            </DialogFooter>
          </form>
        </DialogBody>
      </DialogContent>
    );
  };

  // Edit modal components
  const PlatformEditModal = ({ item, onSuccess }) => {
    const { handleOpenChange } = useDialog();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
      platform: item?.platform || '',
      follower_saat_ini: item?.follower_saat_ini ?? '',
      follower_bulan_lalu: item?.follower_bulan_lalu ?? '',
      konten_terupload: item?.konten_terupload ?? '',
      story_terupload: item?.story_terupload ?? '',
      konten_terbaik_link: item?.konten_terbaik_link || ''
    });

    const submit = async (e) => {
      e.preventDefault();
      if (!form.platform || form.follower_saat_ini === '' || form.follower_bulan_lalu === '' || form.konten_terupload === '' || form.story_terupload === '') {
        toast.error('Semua field wajib diisi (kecuali link)');
        return;
      }
      try {
        setSaving(true);
        await medsosService.updatePlatform(item.id, {
          platform: form.platform,
          follower_saat_ini: parseInt(form.follower_saat_ini, 10),
          follower_bulan_lalu: parseInt(form.follower_bulan_lalu, 10),
          konten_terupload: parseInt(form.konten_terupload, 10),
          story_terupload: parseInt(form.story_terupload, 10),
          konten_terbaik_link: form.konten_terbaik_link || null
        });
        toast.success('Data platform berhasil diperbarui');
        onSuccess?.();
        handleOpenChange(false);
      } catch (err) {
        console.error(err);
        toast.error('Gagal memperbarui data platform');
      } finally {
        setSaving(false);
      }
    };

    return (
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Data Platform</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
              <Select value={form.platform} onValueChange={(v)=>setForm(prev=>({...prev, platform:v}))} placeholder="Pilih platform" options={[{value:'TIKTOK',label:'TikTok'},{value:'INSTAGRAM',label:'Instagram'},{value:'YOUTUBE',label:'YouTube'}]} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follower Saat Ini</label>
                <Input type="number" min="0" value={form.follower_saat_ini} onChange={(e)=>setForm(prev=>({...prev, follower_saat_ini:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follower Bulan Lalu</label>
                <Input type="number" min="0" value={form.follower_bulan_lalu} onChange={(e)=>setForm(prev=>({...prev, follower_bulan_lalu:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konten Terupload</label>
                <Input type="number" min="0" value={form.konten_terupload} onChange={(e)=>setForm(prev=>({...prev, konten_terupload:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Story Terupload</label>
                <Input type="number" min="0" value={form.story_terupload} onChange={(e)=>setForm(prev=>({...prev, story_terupload:e.target.value}))} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Konten Terbaik (opsional)</label>
                <Input type="url" placeholder="https://..." value={form.konten_terbaik_link} onChange={(e)=>setForm(prev=>({...prev, konten_terbaik_link:e.target.value}))} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={()=>handleOpenChange(false)}>Batal</Button>
              <Button type="submit" disabled={saving}>{saving?'Menyimpan...':'Simpan Perubahan'}</Button>
            </DialogFooter>
          </form>
        </DialogBody>
      </DialogContent>
    );
  };

  const KOLEditModal = ({ item, onSuccess }) => {
    const { handleOpenChange } = useDialog();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
      nama_akun: item?.nama_akun || '',
      follower_ig: item?.follower_ig ?? '',
      follower_tiktok: item?.follower_tiktok ?? '',
      ratecard: item?.ratecard ?? ''
    });

    const submit = async (e) => {
      e.preventDefault();
      if (!form.nama_akun || form.ratecard === '') { toast.error('Nama akun dan ratecard wajib diisi'); return; }
      try {
        setSaving(true);
        await medsosService.updateKOL(item.id, {
          nama_akun: form.nama_akun,
          follower_ig: parseInt(form.follower_ig||'0',10),
          follower_tiktok: parseInt(form.follower_tiktok||'0',10),
          ratecard: parseFloat(form.ratecard)
        });
        toast.success('Data KOL berhasil diperbarui');
        onSuccess?.();
        handleOpenChange(false);
      } catch (err) {
        console.error(err); toast.error('Gagal memperbarui KOL');
      } finally { setSaving(false); }
    };

    return (
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Edit Data KOL</DialogTitle></DialogHeader>
        <DialogBody>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Akun</label>
                <Input value={form.nama_akun} onChange={(e)=>setForm(prev=>({...prev, nama_akun:e.target.value}))} placeholder="@akun" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follower Instagram</label>
                <Input type="number" min="0" value={form.follower_ig} onChange={(e)=>setForm(prev=>({...prev, follower_ig:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follower TikTok</label>
                <Input type="number" min="0" value={form.follower_tiktok} onChange={(e)=>setForm(prev=>({...prev, follower_tiktok:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ratecard (IDR)</label>
                <Input type="number" min="0" step="1000" value={form.ratecard} onChange={(e)=>setForm(prev=>({...prev, ratecard:e.target.value}))} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={()=>handleOpenChange(false)}>Batal</Button>
              <Button type="submit" disabled={saving}>{saving?'Menyimpan...':'Simpan Perubahan'}</Button>
            </DialogFooter>
          </form>
        </DialogBody>
      </DialogContent>
    );
  };

  const AnggaranEditModal = ({ item, onSuccess }) => {
    const { handleOpenChange } = useDialog();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ nama_akun: item?.nama_akun || '', follower_ig: item?.follower_ig ?? '', follower_tiktok: item?.follower_tiktok ?? '', ratecard: item?.ratecard ?? '' });
    const submit = async (e)=>{
      e.preventDefault();
      if(!form.nama_akun || form.ratecard===''){ toast.error('Nama akun dan ratecard wajib diisi'); return; }
      try{
        setSaving(true);
        await medsosService.updateAnggaran(item.id, { nama_akun: form.nama_akun, follower_ig: parseInt(form.follower_ig||'0',10), follower_tiktok: parseInt(form.follower_tiktok||'0',10), ratecard: parseFloat(form.ratecard) });
        toast.success('Data anggaran berhasil diperbarui');
        onSuccess?.();
        handleOpenChange(false);
      }catch(err){ console.error(err); toast.error('Gagal memperbarui anggaran'); }
      finally{ setSaving(false); }
    };
    return (
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Edit Anggaran</DialogTitle></DialogHeader>
        <DialogBody>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Akun</label>
                <Input value={form.nama_akun} onChange={(e)=>setForm(prev=>({...prev, nama_akun:e.target.value}))} placeholder="@akun" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follower Instagram</label>
                <Input type="number" min="0" value={form.follower_ig} onChange={(e)=>setForm(prev=>({...prev, follower_ig:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follower TikTok</label>
                <Input type="number" min="0" value={form.follower_tiktok} onChange={(e)=>setForm(prev=>({...prev, follower_tiktok:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ratecard (IDR)</label>
                <Input type="number" min="0" step="1000" value={form.ratecard} onChange={(e)=>setForm(prev=>({...prev, ratecard:e.target.value}))} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={()=>handleOpenChange(false)}>Batal</Button>
              <Button type="submit" disabled={saving}>{saving?'Menyimpan...':'Simpan Perubahan'}</Button>
            </DialogFooter>
          </form>
        </DialogBody>
      </DialogContent>
    );
  };

  const PlatformCostsEditModal = ({ item, onSuccess }) => {
    const { handleOpenChange } = useDialog();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ platform: item?.platform || '', biaya: item?.biaya ?? '' });
    const submit = async (e)=>{
      e.preventDefault();
      if(!form.platform || form.biaya===''){ toast.error('Platform dan biaya wajib diisi'); return; }
      try{
        setSaving(true);
        await medsosService.updatePlatformCosts(item.id, { platform: form.platform, biaya: parseFloat(form.biaya) });
        toast.success('Biaya platform berhasil diperbarui');
        onSuccess?.();
        handleOpenChange(false);
      }catch(err){ console.error(err); toast.error('Gagal memperbarui biaya platform'); }
      finally{ setSaving(false); }
    };
    return (
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Edit Biaya Platform</DialogTitle></DialogHeader>
        <DialogBody>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <Select value={form.platform} onValueChange={(v)=>setForm(prev=>({...prev, platform:v}))} placeholder="Pilih platform" options={[{value:'TIKTOK',label:'TikTok'},{value:'INSTAGRAM',label:'Instagram'},{value:'YOUTUBE',label:'YouTube'}]} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biaya (IDR)</label>
                <Input type="number" min="0" step="1000" value={form.biaya} onChange={(e)=>setForm(prev=>({...prev, biaya:e.target.value}))} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={()=>handleOpenChange(false)}>Batal</Button>
              <Button type="submit" disabled={saving}>{saving?'Menyimpan...':'Simpan Perubahan'}</Button>
            </DialogFooter>
          </form>
        </DialogBody>
      </DialogContent>
    );
  };

  const KOLCreateModal = ({ onSuccess }) => {
    const { handleOpenChange } = useDialog();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ nama_akun:'', follower_ig:'', follower_tiktok:'', ratecard:'' });
    const submit = async (e)=>{
      e.preventDefault();
      if(!form.nama_akun || !form.ratecard){ toast.error('Nama akun dan ratecard wajib diisi'); return; }
      try{
        setSaving(true);
        await medsosService.createKOL({
          nama_akun: form.nama_akun,
          follower_ig: parseInt(form.follower_ig||'0',10),
          follower_tiktok: parseInt(form.follower_tiktok||'0',10),
          ratecard: parseFloat(form.ratecard)
        });
        toast.success('Data KOL berhasil ditambahkan');
        onSuccess?.();
        handleOpenChange(false);
      }catch(err){
        console.error(err); toast.error('Gagal menambahkan KOL');
      }finally{ setSaving(false); }
    };
    return (
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Tambah Data KOL</DialogTitle></DialogHeader>
        <DialogBody>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Akun</label>
                <Input value={form.nama_akun} onChange={(e)=>setForm(prev=>({...prev, nama_akun:e.target.value}))} placeholder="@akun" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follower Instagram</label>
                <Input type="number" min="0" value={form.follower_ig} onChange={(e)=>setForm(prev=>({...prev, follower_ig:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follower TikTok</label>
                <Input type="number" min="0" value={form.follower_tiktok} onChange={(e)=>setForm(prev=>({...prev, follower_tiktok:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ratecard (IDR)</label>
                <Input type="number" min="0" step="1000" value={form.ratecard} onChange={(e)=>setForm(prev=>({...prev, ratecard:e.target.value}))} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={()=>handleOpenChange(false)}>Batal</Button>
              <Button type="submit" disabled={saving}>{saving?'Menyimpan...':'Simpan'}</Button>
            </DialogFooter>
          </form>
        </DialogBody>
      </DialogContent>
    );
  };

  const AnggaranCreateModal = ({ onSuccess }) => {
    const { handleOpenChange } = useDialog();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ nama_akun:'', follower_ig:'', follower_tiktok:'', ratecard:'' });
    const submit = async (e)=>{
      e.preventDefault();
      if(!form.nama_akun || !form.ratecard){ toast.error('Nama akun dan ratecard wajib diisi'); return; }
      try{
        setSaving(true);
        await medsosService.createAnggaran({
          nama_akun: form.nama_akun,
          follower_ig: parseInt(form.follower_ig||'0',10),
          follower_tiktok: parseInt(form.follower_tiktok||'0',10),
          ratecard: parseFloat(form.ratecard)
        });
        toast.success('Data anggaran berhasil ditambahkan');
        onSuccess?.();
        handleOpenChange(false);
      }catch(err){ console.error(err); toast.error('Gagal menambahkan anggaran'); }
      finally{ setSaving(false); }
    };
    return (
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Tambah Anggaran</DialogTitle></DialogHeader>
        <DialogBody>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Akun</label>
                <Input value={form.nama_akun} onChange={(e)=>setForm(prev=>({...prev, nama_akun:e.target.value}))} placeholder="@akun" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follower Instagram</label>
                <Input type="number" min="0" value={form.follower_ig} onChange={(e)=>setForm(prev=>({...prev, follower_ig:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follower TikTok</label>
                <Input type="number" min="0" value={form.follower_tiktok} onChange={(e)=>setForm(prev=>({...prev, follower_tiktok:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ratecard (IDR)</label>
                <Input type="number" min="0" step="1000" value={form.ratecard} onChange={(e)=>setForm(prev=>({...prev, ratecard:e.target.value}))} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={()=>handleOpenChange(false)}>Batal</Button>
              <Button type="submit" disabled={saving}>{saving?'Menyimpan...':'Simpan'}</Button>
            </DialogFooter>
          </form>
        </DialogBody>
      </DialogContent>
    );
  };

  const PlatformCostsCreateModal = ({ onSuccess }) => {
    const { handleOpenChange } = useDialog();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ platform:'', biaya:'' });
    const submit = async (e)=>{
      e.preventDefault();
      if(!form.platform || !form.biaya){ toast.error('Platform dan biaya wajib diisi'); return; }
      try{
        setSaving(true);
        await medsosService.createPlatformCosts({ platform: form.platform, biaya: parseFloat(form.biaya) });
        toast.success('Biaya platform berhasil ditambahkan');
        onSuccess?.();
        handleOpenChange(false);
      }catch(err){ console.error(err); toast.error('Gagal menambahkan biaya platform'); }
      finally{ setSaving(false); }
    };
    return (
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Tambah Biaya Platform</DialogTitle></DialogHeader>
        <DialogBody>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <Select value={form.platform} onValueChange={(v)=>setForm(prev=>({...prev, platform:v}))} placeholder="Pilih platform" options={[{value:'TIKTOK',label:'TikTok'},{value:'INSTAGRAM',label:'Instagram'},{value:'YOUTUBE',label:'YouTube'}]} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biaya (IDR)</label>
                <Input type="number" min="0" step="1000" value={form.biaya} onChange={(e)=>setForm(prev=>({...prev, biaya:e.target.value}))} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={()=>handleOpenChange(false)}>Batal</Button>
              <Button type="submit" disabled={saving}>{saving?'Menyimpan...':'Simpan'}</Button>
            </DialogFooter>
          </form>
        </DialogBody>
      </DialogContent>
    );
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
            <Dialog>
              <DialogTrigger asChild>
                <button className="text-blue-600 hover:text-blue-800">
                  <Edit className="w-5 h-5" />
                </button>
              </DialogTrigger>
              <PlatformEditModal item={platform} onSuccess={fetchPlatformData} />
            </Dialog>
            <button 
              onClick={() => handleDelete('platform', platform.id)}
              className="text-red-600 hover:text-red-800"
            >
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
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit className="w-4 h-4" />
                        </button>
                      </DialogTrigger>
                      <KOLEditModal item={kol} onSuccess={fetchKolData} />
                    </Dialog>
                    <button 
                      onClick={() => handleDelete('kol', kol.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
      </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-4">
          <Dialog>
            <DialogTrigger asChild>
              <button className="inline-flex items-center space-x-2 bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium">
                <Plus className="w-4 h-4" />
                <span>TAMBAH DATA KOL</span>
              </button>
            </DialogTrigger>
            <KOLCreateModal onSuccess={fetchKolData} />
          </Dialog>
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
                <TableHead className="w-16 whitespace-nowrap px-4 md:px-6">NO</TableHead>
                <TableHead className="w-4/12 whitespace-nowrap px-4 md:px-6">NAMA AKUN</TableHead>
                <TableHead className="w-4/12 whitespace-nowrap px-4 md:px-6">FOLLOWER</TableHead>
                <TableHead className="w-3/12 whitespace-nowrap text-right px-4 md:px-6">RATECARD</TableHead>
                <TableHead className="w-24 whitespace-nowrap text-center px-4 md:px-6">AKSI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
              {anggaranData.map((anggaran, index) => (
                <TableRow key={anggaran.id}>
                  <TableCell className="px-4 md:px-6">{index + 1}</TableCell>
                  <TableCell className="font-medium px-4 md:px-6">{anggaran.nama_akun}</TableCell>
                      <TableCell className="px-4 md:px-6">
                    <div className="space-y-1 text-left">
                      <div className="flex items-center space-x-2 whitespace-nowrap">
                        <Instagram className="w-4 h-4 text-pink-600" />
                        <span className="text-sm tabular-nums">{formatNumber(anggaran.follower_ig || 0)}</span>
                      </div>
                      <div className="flex items-center space-x-2 whitespace-nowrap">
                        <Music className="w-4 h-4 text-black" />
                        <span className="text-sm tabular-nums">{formatNumber(anggaran.follower_tiktok || 0)}</span>
                        </div>
                      </div>
                      </TableCell>
                  <TableCell className="font-semibold text-green-600 text-right tabular-nums px-4 md:px-6">
                    {formatCurrency(anggaran.ratecard)}
                      </TableCell>
                      <TableCell className="px-4 md:px-6 text-center">
                    <div className="inline-flex space-x-2 justify-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="text-blue-600 hover:text-blue-800">
                            <Edit className="w-4 h-4" />
                          </button>
                        </DialogTrigger>
                        <AnggaranEditModal item={anggaran} onSuccess={fetchAnggaranData} />
                      </Dialog>
                      <button 
                        onClick={() => handleDelete('anggaran', anggaran.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                        </div>
                      </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4">
            <Dialog>
              <DialogTrigger asChild>
                <button className="inline-flex items-center space-x-2 bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium">
                  <Plus className="w-4 h-4" />
                  <span>TAMBAH ANGGARAN</span>
                </button>
              </DialogTrigger>
              <AnggaranCreateModal onSuccess={fetchAnggaranData} />
            </Dialog>
          </div>
        </div>

        {/* Platform-based Table */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Berdasarkan Platform</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 whitespace-nowrap px-4 md:px-6">NO</TableHead>
                <TableHead className="w-7/12 whitespace-nowrap px-4 md:px-6">PLATFORM</TableHead>
                <TableHead className="w-3/12 whitespace-nowrap text-right px-4 md:px-6">BIAYA</TableHead>
                <TableHead className="w-24 whitespace-nowrap text-center px-4 md:px-6">AKSI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {platformCostsData.map((cost, index) => (
                <TableRow key={cost.id}>
                  <TableCell className="px-4 md:px-6">{index + 1}</TableCell>
                      <TableCell className="px-4 md:px-6">
                    <div className="flex items-center space-x-2">
                      {getPlatformIcon(cost.platform)}
                      <span className="font-medium">{cost.platform}</span>
                        </div>
                      </TableCell>
                  <TableCell className="font-semibold text-green-600 text-right tabular-nums px-4 md:px-6">
                    {formatCurrency(cost.biaya)}
                      </TableCell>
                      <TableCell className="px-4 md:px-6 text-center">
                    <div className="inline-flex space-x-2 justify-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="text-blue-600 hover:text-blue-800">
                            <Edit className="w-4 h-4" />
                          </button>
                        </DialogTrigger>
                        <PlatformCostsEditModal item={cost} onSuccess={fetchPlatformCostsData} />
                      </Dialog>
                      <button 
                        onClick={() => handleDelete('platformCosts', cost.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="inline-flex items-center space-x-2 bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium">
                      <Plus className="w-4 h-4" />
                      <span>TAMBAH BIAYA PLATFORM</span>
                    </button>
                  </DialogTrigger>
                  <PlatformCostsCreateModal onSuccess={fetchPlatformCostsData} />
                </Dialog>
              </div>
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
            <Link to="/admin/marketing" className="text-white hover:text-gray-200">
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

      {/* Search and Filter */}
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Cari data medsos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="w-full"
              >
                <option value="all">Semua Platform</option>
                <option value="TIKTOK">TikTok</option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="YOUTUBE">YouTube</option>
              </Select>
            </div>
          </div>
        </div>
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
                    <div className="mt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="inline-flex items-center space-x-2 bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium">
                            <Plus className="w-4 h-4" />
                            <span>TAMBAH DATA PLATFORM</span>
                          </button>
                        </DialogTrigger>
                        <PlatformCreateModal onSuccess={fetchPlatformData} />
                      </Dialog>
                    </div>
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

export default AdminMedsos;





