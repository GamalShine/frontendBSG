import React, { useEffect, useState } from 'react';
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

  // Paksa background halaman menjadi merah khusus halaman login
  useEffect(() => {
    try {
      document.body.classList.add('login-bg')
      document.documentElement.classList.add('login-bg')
    } catch {}
    return () => {
      try {
        document.body.classList.remove('login-bg')
        document.documentElement.classList.remove('login-bg')
      } catch {}
    }
  }, [])

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
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error?.code === 'ONLY_ADMIN_ALLOWED' || (typeof error?.message === 'string' && error.message.includes('ONLY_ADMIN_ALLOWED'))) {
        toast.error('Hanya Admin yang diizinkan login.');
      } else {
        toast.error('Username atau password salah');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100lvh] bg-red-700 flex flex-col overflow-hidden md:overflow-auto">
      {/* Top brand section (di area merah) */}
      <div className="flex flex-col items-center justify-end pt-6 pb-4">
        {/* Logo bergaya app icon */}
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/90 ring-1 ring-white/70 shadow-lg flex items-center justify-center">
          <div className="w-[78%] h-[78%] rounded-2xl bg-white flex items-center justify-center overflow-hidden">
            <img
              src="/Logo.png"
              alt="Bosgil Grup Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        <h1 className="mt-3 text-white text-lg md:text-xl font-extrabold tracking-wide uppercase">LOGIN BOSGIL GRUP</h1>
        <p className="text-white/90 text-sm md:text-base mt-1">#KITAPASTIBISA</p>
      </div>

      {/* Wrapper untuk card + bottom content */}
      <div className="flex-1 flex flex-col items-center px-4 pb-3 md:pb-6">
        {/* Card Form Login */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-red-100/40">
          <div className="px-6 sm:px-8 pt-6 pb-4">
            {/* Title card removed per request */}

            {/* Field Username */}
            <label className="block text-xs font-medium text-gray-600 mb-2">Usernam atau email*</label>
            <div className="w-full rounded-xl bg-gray-100/90 border border-gray-200 pl-3 md:pl-4 pr-3 md:pr-4 h-10 md:h-12 flex items-center gap-2 md:gap-3">
              <User className="h-5 w-5 text-red-600 shrink-0" aria-hidden="true" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="flex-1 h-full bg-transparent outline-none text-gray-900 placeholder-gray-400 text-[15px] md:text-base leading-none py-0"
                required
              />
              {/* spacer agar kolom aksi setara dengan tombol mata di Password */}
              <span className="inline-block w-6 h-6" aria-hidden="true" />
            </div>

            {/* Field Password */}
            <label className="block text-xs font-medium text-gray-600 mt-4 mb-2">Password*</label>
            <div className="w-full relative rounded-xl bg-gray-100/90 border border-gray-200 pl-3 md:pl-4 pr-10 md:pr-12 h-10 md:h-12 flex items-center gap-2 md:gap-3">
              <Lock className="h-5 w-5 text-red-600 shrink-0" aria-hidden="true" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="flex-1 h-full bg-transparent outline-none text-gray-900 placeholder-gray-400 text-[15px] md:text-base leading-none py-0"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 md:right-4 w-6 h-6 flex items-center justify-center rounded-md text-red-400 hover:text-red-600"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 md:h-5 md:w-5" />
                ) : (
                  <Eye className="h-4 w-4 md:h-5 md:w-5" />
                )}
              </button>
            </div>

            {/* Note */}
            <p className="mt-3 text-xs text-gray-500">*Jika lupa Username/Password hubungi HR</p>

            {/* Button Masuk */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="mt-5 w-full h-12 rounded-xl bg-red-600 text-white text-base md:text-lg font-semibold shadow hover:bg-red-700 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>

            {/* Hashtag */}
            <p className="mt-4 text-center text-xs text-red-600 font-medium">#BEKERJAADALAHIBADAH</p>
          </div>
        </div>

        {/* Bottom content di area merah */}
        <div className="w-full max-w-md mt-4 md:mt-6 text-white">
          {/* Kotak gelap semi-transparan (selebar card di atasnya) */}
          <div className="w-full bg-black/10 rounded-md px-4 py-3">
            <h3 className="text-sm md:text-base font-semibold">3 Hal Penting</h3>
            <ul className="mt-2 space-y-1.5 text-sm md:text-base leading-relaxed">
              <li>- Sikap Mental</li>
              <li>- Skill/Keahlian</li>
              <li>- Spiritual / Kesadaran</li>
            </ul>
          </div>

          <p className="mt-6 text-center text-sm md:text-base">CIPTAKAN KARYA BUKAN DRAMA</p>
        </div>
      </div>

      {/* Footer removed per request */}
    </div>
  );
};

export default Login; 