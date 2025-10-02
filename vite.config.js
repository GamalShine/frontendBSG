import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  define: {
    // Wajib menggunakan environment variable tanpa fallback agar tidak ada IP hardcoded
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_BASE_URL),
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['dash.bosgilserver.cloud'],
    proxy: {
      '/api': {
        // Gunakan origin backend (tanpa /api). Jika VITE_API_BASE_URL tidak diset, fallback ke http://localhost:3000
        target: (process.env.VITE_API_BASE_URL || '').replace(/\/?api\/?$/, '') || 'http://localhost:3000',
        changeOrigin: true,
        // Pertahankan prefix /api agar sesuai dengan backend Express yang mount di app.use('/api', ...)
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
      // Proxy untuk file statis upload dari backend
      '/uploads': {
        target: (process.env.VITE_API_BASE_URL || '').replace(/\/?api\/?$/, '') || 'http://localhost:3000',
        changeOrigin: true,
        // Tidak perlu rewrite, biarkan path /uploads diteruskan apa adanya
      },
    },
  },
})
