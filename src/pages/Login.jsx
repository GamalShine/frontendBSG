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
    <div className="min-h-screen bg-red-700 flex flex-col">
      {/* Top brand section (di area merah) */}
      <div className="flex flex-col items-center justify-end pt-6 pb-4">
        {/* Logo bergaya app icon */}
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/90 ring-1 ring-white/70 shadow-lg flex items-center justify-center">
          <div className="w-[82%] h-[82%] rounded-2xl bg-white flex items-center justify-center overflow-hidden">
            <img
              src="/Logo.png"
              alt="Bosgil Group Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        <h1 className="mt-3 text-white text-lg md:text-xl font-extrabold tracking-wide uppercase">BOSGIL GROUP</h1>
        <p className="text-white/90 text-sm md:text-base font-semibold mt-1">#KITAPASTIBISA</p>
      </div>

      {/* Wrapper untuk card + bottom content */}
      <div className="flex-1 flex flex-col items-center px-4 pb-6">
        {/* Card Form Login */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-red-100/40">
          <div className="px-6 sm:px-8 pt-6 pb-4">
            {/* Title card */}
            <div className="text-center mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Masuk</h2>
              <p className="text-gray-500 text-sm md:text-base mt-1">Masuk ke akun Anda untuk melanjutkan</p>
            </div>

            {/* Field Username */}
            <label className="block text-xs font-medium text-gray-600 mb-2">Username</label>
            <div className="w-full rounded-xl bg-gray-100/90 border border-gray-200 px-3 md:px-4 h-10 md:h-12 grid grid-cols-[auto,1fr,auto] items-center gap-2 md:gap-3">
              <User className="h-4 w-4 md:h-5 md:w-5 text-red-400" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="flex-1 h-full bg-transparent outline-none text-gray-900 placeholder-gray-400 text-[15px] md:text-base"
                required
              />
              {/* spacer agar kolom aksi setara dengan tombol mata di Password */}
              <span className="justify-self-end inline-block w-6 h-6" aria-hidden="true" />
            </div>

            {/* Field Password */}
            <label className="block text-xs font-medium text-gray-600 mt-4 mb-2">Password</label>
            <div className="w-full rounded-xl bg-gray-100/90 border border-gray-200 px-3 md:px-4 h-10 md:h-12 grid grid-cols-[auto,1fr,auto] items-center gap-2 md:gap-3">
              <Lock className="h-4 w-4 md:h-5 md:w-5 text-red-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="flex-1 h-full bg-transparent outline-none text-gray-900 placeholder-gray-400 text-[15px] md:text-base"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="justify-self-end w-6 h-6 flex items-center justify-center rounded-md text-red-400 hover:text-red-600"
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
        <div className="w-full max-w-md mt-6 text-white">
          {/* Kotak gelap semi-transparan (selebar card di atasnya) */}
          <div className="w-full bg-black/10 rounded-md px-4 py-3">
            <h3 className="text-sm md:text-base font-semibold">3 Hal Penting</h3>
            <ul className="mt-2 space-y-1.5 text-sm md:text-base leading-relaxed">
              <li>- Sikap Mental</li>
              <li>- Skill/Keahlian</li>
              <li>- Spiritual / Kesadaran</li>
            </ul>
          </div>

          <p className="mt-6 text-center text-sm md:text-base font-semibold">CIPTAKAN KARYA BUKAN DRAMA</p>
        </div>
      </div>

      {/* Footer copyright di paling bawah */}
      <footer className="text-center text-white/90 text-[11px] md:text-xs py-2">
        © 2025 Bosgil Group
      </footer>
    </div>
  );
};

export default Login; 