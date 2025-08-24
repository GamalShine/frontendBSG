import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast.error('Username dan password harus diisi');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login({
        username: formData.username,
        password: formData.password
      });
      if (success) {
        toast.success('Login berhasil!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Username atau password salah');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-red-700">
      <div className="flex items-center justify-center p-4 min-h-screen">
        {/* Main White Card */}
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
          {/* Logo - Overlapping the card */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
            <img 
              src="http://192.168.30.49:3000/uploads/Logo.png" 
              alt="Bosgil Group Logo" 
              className="w-28 h-28 object-contain"
            />
          </div>

          {/* Card Content */}
          <div className="pt-20 pb-6 px-8">
            {/* Company Name */}
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900 uppercase mb-1">BOSGIL GROUP</h1>
              <p className="text-gray-500 font-semibold text-base tracking-wider">#KITAPASTIBISA</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-3">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Masukkan username"
                    className="block w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 text-gray-900 placeholder-gray-400 text-base"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-3">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Masukkan password"
                    className="block w-full pl-12 pr-14 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 text-gray-900 placeholder-gray-400 text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Note */}
              <p className="text-xs text-gray-500 text-left">
                *Jika lupa Username/Password hubungi HR
              </p>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 text-white py-1 px-6 rounded-lg font-semibold text-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? 'Memproses...' : 'MASUK'}
              </button>
            </form>

            {/* Second Slogan */}
            <div className="text-center mt-6 pb-3 border-b border-gray-300">
              <p className="text-gray-500 font-semibold text-lg">#BEKERJAADALAHIBADAH</p>
            </div>

            {/* 3 Important Points */}
            <div className="mt-6">
              <h3 className="text-base font-medium text-red-700 text-left mb-2">3 HAL PENTING</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-red-700">
                  <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
                  Sikap Mental
                </li>
                <li className="flex items-center text-red-700">
                  <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
                  Skill / Keahlian
                </li>
                <li className="flex items-center text-red-700">
                  <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
                  Spiritual / Kesadaran
                </li>
              </ul>
            </div>

            {/* Final Slogan */}
            <div className="text-center mt-4">
              <p className="text-gray-800 font-semibold text-base">CIPTAKAN KARYA BUKAN DRAMA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 