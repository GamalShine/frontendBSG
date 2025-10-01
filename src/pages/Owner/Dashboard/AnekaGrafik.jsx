import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  LineChart,
  Calendar,
  Filter,
  Download,
  Eye,
  BarChart,
  Activity,
  Target,
  DollarSign,
  Users,
  ShoppingCart,
  TrendingDown
} from 'lucide-react';

const AnekaGrafik = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedChart, setSelectedChart] = useState('sales');

  const chartData = {
    sales: {
      title: 'Grafik Penjualan',
      data: [
        { month: 'Jan', target: 1000000, actual: 950000 },
        { month: 'Feb', target: 1200000, actual: 1100000 },
        { month: 'Mar', target: 1100000, actual: 1050000 },
        { month: 'Apr', target: 1300000, actual: 1250000 },
        { month: 'Mei', target: 1400000, actual: 1350000 },
        { month: 'Jun', target: 1500000, actual: 1450000 }
      ]
    },
    revenue: {
      title: 'Grafik Pendapatan',
      data: [
        { month: 'Jan', revenue: 850000 },
        { month: 'Feb', revenue: 920000 },
        { month: 'Mar', revenue: 880000 },
        { month: 'Apr', revenue: 1050000 },
        { month: 'Mei', revenue: 1150000 },
        { month: 'Jun', revenue: 1250000 }
      ]
    },
    customers: {
      title: 'Grafik Pelanggan',
      data: [
        { month: 'Jan', new: 150, returning: 300 },
        { month: 'Feb', new: 180, returning: 320 },
        { month: 'Mar', new: 160, returning: 310 },
        { month: 'Apr', new: 200, returning: 350 },
        { month: 'Mei', new: 220, returning: 380 },
        { month: 'Jun', new: 250, returning: 400 }
      ]
    },
    products: {
      title: 'Grafik Produk Terjual',
      data: [
        { month: 'Jan', productA: 500, productB: 300, productC: 200 },
        { month: 'Feb', productA: 550, productB: 320, productC: 220 },
        { month: 'Mar', productA: 520, productB: 310, productC: 210 },
        { month: 'Apr', productA: 600, productB: 350, productC: 250 },
        { month: 'Mei', productA: 650, productB: 380, productC: 280 },
        { month: 'Jun', productA: 700, productB: 400, productC: 300 }
      ]
    }
  };

  const currentChart = chartData[selectedChart];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Aneka Grafik</h1>
                <p className="text-sm text-gray-600">Analisis data dan performa bisnis</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Periode:</span>
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="daily">Harian</option>
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
              <option value="yearly">Tahunan</option>
            </select>

            <div className="flex items-center space-x-2 ml-6">
              <BarChart3 className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Jenis Grafik:</span>
            </div>
            <select
              value={selectedChart}
              onChange={(e) => setSelectedChart(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="sales">Penjualan</option>
              <option value="revenue">Pendapatan</option>
              <option value="customers">Pelanggan</option>
              <option value="products">Produk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Summary Cards */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Penjualan</p>
                <p className="text-2xl font-bold text-gray-900">Rp 7.2M</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12.5% dari bulan lalu
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
                <p className="text-2xl font-bold text-gray-900">Rp 6.8M</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +8.3% dari bulan lalu
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pelanggan</p>
                <p className="text-2xl font-bold text-gray-900">1,260</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +15.2% dari bulan lalu
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{currentChart.title}</h2>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <BarChart className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <LineChart className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <PieChart className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Grafik {currentChart.title}</h3>
            <p className="text-sm text-gray-500">
              Data untuk periode {selectedPeriod === 'monthly' ? 'bulanan' : selectedPeriod === 'weekly' ? 'mingguan' : selectedPeriod === 'daily' ? 'harian' : 'tahunan'}
            </p>
            
            {/* Simple Chart Representation */}
            <div className="mt-6 flex items-end justify-center space-x-2 h-32">
              {currentChart.data.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  {selectedChart === 'sales' && (
                    <>
                      <div className="w-8 bg-blue-500 rounded-t mb-1" style={{ height: `${(item.actual / 1500000) * 80}px` }}></div>
                      <div className="w-8 bg-green-500 rounded-t" style={{ height: `${(item.target / 1500000) * 80}px` }}></div>
                    </>
                  )}
                  {selectedChart === 'revenue' && (
                    <div className="w-8 bg-green-500 rounded-t" style={{ height: `${(item.revenue / 1250000) * 80}px` }}></div>
                  )}
                  {selectedChart === 'customers' && (
                    <>
                      <div className="w-8 bg-purple-500 rounded-t mb-1" style={{ height: `${(item.returning / 400) * 80}px` }}></div>
                      <div className="w-8 bg-blue-500 rounded-t" style={{ height: `${(item.new / 250) * 80}px` }}></div>
                    </>
                  )}
                  {selectedChart === 'products' && (
                    <>
                      <div className="w-8 bg-blue-500 rounded-t mb-1" style={{ height: `${(item.productA / 700) * 80}px` }}></div>
                      <div className="w-8 bg-green-500 rounded-t mb-1" style={{ height: `${(item.productB / 400) * 80}px` }}></div>
                      <div className="w-8 bg-orange-500 rounded-t" style={{ height: `${(item.productC / 300) * 80}px` }}></div>
                    </>
                  )}
                  <span className="text-xs text-gray-600 mt-2">{item.month}</span>
                </div>
              ))}
            </div>

            {/* Chart Legend */}
            <div className="mt-4 flex items-center justify-center space-x-4">
              {selectedChart === 'sales' && (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-sm text-gray-600">Target</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-sm text-gray-600">Aktual</span>
                  </div>
                </>
              )}
              {selectedChart === 'customers' && (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span className="text-sm text-gray-600">Pelanggan Lama</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-sm text-gray-600">Pelanggan Baru</span>
                  </div>
                </>
              )}
              {selectedChart === 'products' && (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-sm text-gray-600">Produk A</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-sm text-gray-600">Produk B</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded"></div>
                    <span className="text-sm text-gray-600">Produk C</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metrik Kunci</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className="text-sm font-medium text-gray-900">3.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Order Value</span>
                <span className="text-sm font-medium text-gray-900">Rp 125,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Customer Retention</span>
                <span className="text-sm font-medium text-gray-900">78%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Performa</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Penjualan</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-green-600">+12.5%</span>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pendapatan</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-green-600">+8.3%</span>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pelanggan</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-green-600">+15.2%</span>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnekaGrafik;
