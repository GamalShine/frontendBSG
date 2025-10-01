import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import {
  Award,
  BarChart3,
  Users,
  Target,
  X
} from 'lucide-react';

const AdminKPIDetail = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('divisi');
  const [selectedMonth, setSelectedMonth] = useState('April 2025');
  const [selectedItem, setSelectedItem] = useState(null);

  // Debug: Log ketika komponen mount
  useEffect(() => {
    console.log('🚀 Admin KPI Detail Component Mounted');
    console.log('👤 Current User:', user);
  }, [user]);

  // Data KPI Divisi sesuai foto
  const kpiDivisiData = [
    'KPI DIVISI TEPUNG BOSGIL',
    'KPI DIVISI PRODUKSI',
    'KPI DIVISI KEUANGAN',
    'KPI DIVISI HR',
    'KPI DIVISI BRANDING & MARKETING',
    'KPI DIVISI DIGITAL MARKETING',
    'KPI DIVISI SUPPORT SYSTEM',
    'KPI DIVISI TEKHNISI & UMUM',
    'KPI DIVISI OUTLET BSG KARAWACI',
    'KPI DIVISI OUTLET BSG BSD',
    'KPI DIVISI OUTLET BSG BINTARO',
    'KPI DIVISI OUTLET BSG CONDET',
    'KPI DIVISI OUTLET BSG BANDUNG KOTA',
    'KPI DIVISI OUTLET BSG BUAH BATU',
    'KPI DIVISI OUTLET BSG PAGESANGAN',
    'KPI DIVISI OUTLET BSG AMPEL',
    'KPI DIVISI OUTLET BSG MALANG',
    'KPI DIVISI OUTLET BSG MALAYSIA',
    'KPI DIVISI OUTLET BSG SIDOARJO',
    'KPI DIVISI SGL KARANG',
    'KPI DIVISI OUTLET JGL PERMATA'
  ];

  // Data KPI Leader sesuai foto
  const kpiLeaderData = [
    'KPI LEADER TEPUNG BOSGIL',
    'KPI LEADER PRODUKSI',
    'KPI LEADER KEUANGAN',
    'KPI LEADER HR',
    'KPI LEADER BRANDING & MARKETING',
    'KPI LEADER DIGITAL MARKETING',
    'KPI LEADER SUPPORT SYSTEM',
    'KPI LEADER TEKHNISI & UMUM',
    'KPI LEADER OUTLET BSG KARAWACI',
    'KPI LEADER OUTLET BSG BSD',
    'KPI LEADER OUTLET BSG BINTARO',
    'KPI LEADER OUTLET BSG CONDET',
    'KPI LEADER OUTLET BSG BANDUNG KOTA',
    'KPI LEADER OUTLET BSG BUAH BATU',
    'KPI LEADER OUTLET BSG PAGESANGAN',
    'KPI LEADER OUTLET BSG AMPEL',
    'KPI LEADER OUTLET BSG MALANG',
    'KPI LEADER OUTLET BSG MALAYSIA',
    'KPI LEADER OUTLET BSG SIDOARJO',
    'KPI LEADER SGL KARANG',
    'KPI LEADER OUTLET JGL PERMATA'
  ];

  // Data KPI Individu sesuai foto
  const kpiIndividuData = [
    'KPI TIM TEPUNG BOSGIL',
    'KPI TIM PRODUKSI',
    'KPI TIM KEUANGAN',
    'KPI TIM HR',
    'KPI TIM BRANDING & MARKETING',
    'KPI TIM DIGITAL MARKETING',
    'KPI TIM SUPPORT SYSTEM',
    'KPI TIM TEKHNISI & UMUM',
    'KPI TIM OUTLET BSG KARAWACI',
    'KPI TIM OUTLET BSG BSD',
    'KPI TIM OUTLET BSG BINTARO',
    'KPI TIM OUTLET BSG CONDET',
    'KPI TIM OUTLET BSG BANDUNG KOTA',
    'KPI TIM OUTLET BSG BUAH BATU',
    'KPI TIM OUTLET BSG PAGESANGAN',
    'KPI TIM OUTLET BSG AMPEL',
    'KPI TIM OUTLET BSG MALANG',
    'KPI TIM OUTLET BSG MALAYSIA',
    'KPI TIM OUTLET BSG SIDOARJO',
    'KPI TIM SGL KARANG',
    'KPI TIM OUTLET JGI PERMATA'
  ];

  const handleItemClick = (itemName) => {
    // Set selected item untuk menampilkan foto
    setSelectedItem({ nama: itemName });
  };

  const clearSelection = () => {
    setSelectedItem(null);
  };

  // Data foto untuk setiap item KPI
  const getItemPhoto = (itemName, tabType) => {
    // Mapping nama item ke URL foto dari internet
    const photoMap = {
      // KPI DIVISI
      'KPI DIVISI TEPUNG BOSGIL': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop',
      'KPI DIVISI PRODUKSI': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop',
      'KPI DIVISI KEUANGAN': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop',
      'KPI DIVISI HR': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
      'KPI DIVISI BRANDING & MARKETING': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
      'KPI DIVISI DIGITAL MARKETING': 'https://images.unsplash.com/photo-1557838923-2985c318be48?w=600&h=400&fit=crop',
      'KPI DIVISI SUPPORT SYSTEM': 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&h=400&fit=crop',
      'KPI DIVISI TEKHNISI & UMUM': 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=400&fit=crop',
      'KPI DIVISI OUTLET BSG KARAWACI': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop',
      'KPI DIVISI OUTLET BSG BSD': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop',
      'KPI DIVISI OUTLET BSG BINTARO': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop',
      'KPI DIVISI OUTLET BSG CONDET': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop',
      'KPI DIVISI OUTLET BSG BANDUNG KOTA': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop',
      'KPI DIVISI OUTLET BSG BUAH BATU': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop',
      'KPI DIVISI OUTLET BSG PAGESANGAN': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop',
      'KPI DIVISI OUTLET BSG AMPEL': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop',
      'KPI DIVISI OUTLET BSG MALANG': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop',
      'KPI DIVISI OUTLET BSG MALAYSIA': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop',
      'KPI DIVISI OUTLET BSG SIDOARJO': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop',
      'KPI DIVISI SGL KARANG': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop',
      'KPI DIVISI OUTLET JGL PERMATA': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop',
      
      // KPI LEADER
      'KPI LEADER TEPUNG BOSGIL': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
      'KPI LEADER PRODUKSI': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
      'KPI LEADER KEUANGAN': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
      'KPI LEADER HR': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
      'KPI LEADER BRANDING & MARKETING': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
      'KPI LEADER DIGITAL MARKETING': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
      'KPI LEADER SUPPORT SYSTEM': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
      'KPI LEADER TEKHNISI & UMUM': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
      'KPI LEADER OUTLET BSG KARAWACI': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
      'KPI LEADER OUTLET BSG BSD': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
      'KPI LEADER OUTLET BSG BINTARO': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
      'KPI LEADER OUTLET BSG CONDET': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
      'KPI LEADER OUTLET BSG BANDUNG KOTA': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
      'KPI LEADER OUTLET BSG BUAH BATU': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
      'KPI LEADER OUTLET BSG PAGESANGAN': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
      'KPI LEADER OUTLET BSG AMPEL': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
      'KPI LEADER OUTLET BSG MALANG': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
      'KPI LEADER OUTLET BSG MALAYSIA': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
      'KPI LEADER OUTLET BSG SIDOARJO': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
      'KPI LEADER SGL KARANG': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
      'KPI LEADER OUTLET JGL PERMATA': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
      
      // KPI INDIVIDU
      'KPI TIM TEPUNG BOSGIL': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
      'KPI TIM PRODUKSI': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
      'KPI TIM KEUANGAN': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
      'KPI TIM HR': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
      'KPI TIM BRANDING & MARKETING': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
      'KPI TIM DIGITAL MARKETING': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
      'KPI TIM SUPPORT SYSTEM': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
      'KPI TIM TEKHNISI & UMUM': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
      'KPI TIM OUTLET BSG KARAWACI': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
      'KPI TIM OUTLET BSG BSD': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
      'KPI TIM OUTLET BSG BINTARO': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
      'KPI TIM OUTLET BSG CONDET': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
      'KPI TIM OUTLET BSG BANDUNG KOTA': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
      'KPI TIM OUTLET BSG BUAH BATU': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
      'KPI TIM OUTLET BSG PAGESANGAN': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
      'KPI TIM OUTLET BSG AMPEL': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
      'KPI TIM OUTLET BSG MALANG': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
      'KPI TIM OUTLET BSG MALAYSIA': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
      'KPI TIM OUTLET BSG SIDOARJO': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
      'KPI TIM SGL KARANG': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
      'KPI TIM OUTLET JGI PERMATA': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop'
    };
    
    return photoMap[itemName] || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop';
  };

  const renderItemPhoto = () => {
    if (!selectedItem) return null;

    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-medium text-gray-900 truncate">{selectedItem.nama}</h2>
            <button
              onClick={clearSelection}
              className="p-1.5 hover:bg-gray-200 rounded transition-colors duration-200"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Photo */}
        <div className="p-4">
          <img
            src={getItemPhoto(selectedItem.nama, activeTab)}
            alt={selectedItem.nama}
            className="w-full h-auto rounded-lg shadow-sm"
          />
        </div>
      </div>
    );
  };

  const renderDivisiContent = () => (
    <div className="flex">
      <div className="w-1/2 pr-3">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Daftar KPI Divisi</h3>
              <div className="p-1.5 bg-blue-100 rounded">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-2 max-h-[512px] overflow-y-auto">
              {kpiDivisiData.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleItemClick(item)}
                  className={`w-full text-left px-3 py-2.5 rounded-md transition-all duration-200 ${
                    selectedItem && selectedItem.nama === item
                      ? 'bg-blue-50 border border-blue-200 text-blue-900'
                      : 'text-gray-700 hover:bg-gray-50 hover:border-gray-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item}</span>
                    {selectedItem && selectedItem.nama === item && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Photo/Form Detail */}
      <div className="w-1/2 pl-3">
        {selectedItem ? (
          renderItemPhoto()
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-900">Pilih item untuk melihat detail</h3>
            </div>
            <div className="p-4">
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">Silakan pilih item dari daftar</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderLeaderContent = () => (
    <div className="flex">
      <div className="w-1/2 pr-3">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Daftar KPI Leader</h3>
              <div className="p-1.5 bg-blue-100 rounded">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-2 max-h-[512px] overflow-y-auto">
              {kpiLeaderData.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleItemClick(item)}
                  className={`w-full text-left px-3 py-2.5 rounded-md transition-all duration-200 ${
                    selectedItem && selectedItem.nama === item
                      ? 'bg-blue-50 border border-blue-200 text-blue-900'
                      : 'text-gray-700 hover:bg-gray-50 hover:border-gray-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item}</span>
                    {selectedItem && selectedItem.nama === item && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Photo/Form Detail */}
      <div className="w-1/2 pl-3">
        {selectedItem ? (
          renderItemPhoto()
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-900">Pilih item untuk melihat detail</h3>
            </div>
            <div className="p-4">
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">Silakan pilih item dari daftar</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderIndividuContent = () => (
    <div className="flex">
      <div className="w-1/2 pr-3">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Daftar KPI Individu</h3>
              <div className="p-1.5 bg-blue-100 rounded">
                <Target className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-2 max-h-[512px] overflow-y-auto">
              {kpiIndividuData.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleItemClick(item)}
                  className={`w-full text-left px-3 py-2.5 rounded-md transition-all duration-200 ${
                    selectedItem && selectedItem.nama === item
                      ? 'bg-blue-50 border border-blue-200 text-blue-900'
                      : 'text-gray-700 hover:bg-gray-50 hover:border-gray-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item}</span>
                    {selectedItem && selectedItem.nama === item && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Photo/Form Detail */}
      <div className="w-1/2 pl-3">
        {selectedItem ? (
          renderItemPhoto()
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-900">Pilih item untuk melihat detail</h3>
            </div>
            <div className="p-4">
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">Silakan pilih item dari daftar</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header yang clean */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">KPI Dashboard</h1>
                <p className="text-sm text-gray-500">Key Performance Indicators</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Periode</div>
              <div className="text-lg font-medium text-gray-900">{selectedMonth}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs dengan style Circle */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-3">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('divisi')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'divisi'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>KPI DIVISI</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('leader')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'leader'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>KPI LEADER</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('individu')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'individu'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>KPI INDIVIDU</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content dengan style Circle */}
      <div className="p-6">
        {activeTab === 'divisi' && renderDivisiContent()}
        {activeTab === 'leader' && renderLeaderContent()}
        {activeTab === 'individu' && renderIndividuContent()}
      </div>
    </div>
  );
};

export default AdminKPIDetail;