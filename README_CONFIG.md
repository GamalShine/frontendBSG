# Sistem Konfigurasi Base URL Terpusat

## Overview
Sistem ini memungkinkan Anda mengatur semua base URL dan konfigurasi API dalam satu tempat yang terpusat.

## File Konfigurasi Utama

### 1. `src/config/constants.js`
File utama yang berisi semua konfigurasi terpusat:
- Base URLs (API, WebSocket, Frontend)
- API Endpoints
- Timeout settings
- Pagination defaults
- Helper functions

### 2. Environment Variables
Buat file `.env` di root frontend:
```env
VITE_API_BASE_URL=http://192.168.38.162:3000/api
VITE_WS_URL=ws://192.168.38.162:3000
VITE_FRONTEND_URL=http://192.168.38.223:5173
```

## Cara Penggunaan

### 1. Import Konfigurasi
```javascript
import { API_CONFIG, API_ENDPOINTS, getApiUrl, getWsUrl } from '../config/constants'
```

### 2. Menggunakan Base URL
```javascript
// Untuk API calls
const apiUrl = API_CONFIG.BASE_URL
const fullUrl = getApiUrl('/auth/login')

// Untuk WebSocket
const wsUrl = getWsUrl()
```

### 3. Menggunakan API Endpoints
```javascript
// Authentication
const loginUrl = API_ENDPOINTS.AUTH.LOGIN

// Poskas
const poskasUrl = API_ENDPOINTS.POSKAS.LIST
const poskasById = API_ENDPOINTS.POSKAS.BY_ID(123)

// Chat
const chatRooms = API_ENDPOINTS.CHAT.ROOMS
const roomMessages = API_ENDPOINTS.CHAT.ROOM_MESSAGES('room123')
```

### 4. Menggunakan Timeout Settings
```javascript
const requestTimeout = API_CONFIG.TIMEOUT.REQUEST  // 10 seconds
const uploadTimeout = API_CONFIG.TIMEOUT.UPLOAD    // 30 seconds
```

## Environment Detection

```javascript
import { isDevelopment, isProduction, isStaging } from '../config/constants'

if (isDevelopment()) {
    // Development specific code
}

if (isProduction()) {
    // Production specific code
}
```

## File yang Sudah Diupdate

### Frontend Files:
- ✅ `src/config/constants.js` - File konfigurasi utama
- ✅ `src/services/api.js` - Menggunakan API_CONFIG
- ✅ `src/services/websocketService.js` - Menggunakan getWsUrl()
- ✅ `src/hooks/useSocket.js` - Menggunakan API_CONFIG
- ✅ `src/services/authService.js` - Menggunakan API_ENDPOINTS
- ✅ `src/services/uploadService.js` - Menggunakan API_ENDPOINTS
- ✅ `src/utils/testApiConnection.js` - Menggunakan API_ENDPOINTS
- ✅ `src/components/LoginTest.jsx` - Menggunakan API_ENDPOINTS
- ✅ `src/pages/Poskas/PoskasList.jsx` - Menggunakan API_CONFIG
- ✅ `src/config/api.js` - Updated untuk backward compatibility
- ✅ `src/config/environment.js` - Updated untuk backward compatibility
- ✅ `vite.config.js` - Menggunakan environment variables

### Backend Files:
- ✅ `config/constants.js` - File konfigurasi backend
- ✅ `server.js` - Menggunakan API_CONFIG

## Keuntungan Sistem Ini

1. **Single Source of Truth**: Semua URL diatur di satu tempat
2. **Environment-based**: Mudah switch antara development, staging, production
3. **Type Safety**: Bisa ditambahkan TypeScript untuk validasi
4. **Maintainability**: Perubahan URL cukup di satu file
5. **Flexibility**: Bisa override per environment
6. **Backward Compatibility**: File lama masih bisa digunakan

## Cara Mengubah Base URL

### Untuk Development:
1. Edit file `.env`:
```env
VITE_API_BASE_URL=http://192.168.38.223:3000/api
VITE_WS_URL=ws://192.168.38.223:3000
```

### Untuk Production:
1. Buat file `.env.production`:
```env
VITE_API_BASE_URL=https://your-production-domain.com/api
VITE_WS_URL=wss://your-production-domain.com
```

### Untuk Staging:
1. Buat file `.env.staging`:
```env
VITE_API_BASE_URL=https://your-staging-domain.com/api
VITE_WS_URL=wss://your-staging-domain.com
```

## Testing

Untuk memastikan konfigurasi berfungsi:

```javascript
import { testApiConnection } from '../utils/testApiConnection'

// Test koneksi API
const result = await testApiConnection()
console.log('API Test Result:', result)
```

## Troubleshooting

### 1. Environment Variables Tidak Terbaca
- Pastikan file `.env` ada di root frontend
- Restart development server
- Periksa nama variable (harus dimulai dengan `VITE_`)

### 2. API Calls Gagal
- Periksa `API_CONFIG.BASE_URL` di console
- Pastikan backend server berjalan
- Periksa CORS configuration di backend

### 3. WebSocket Tidak Terhubung
- Periksa `API_CONFIG.WS_URL` di console
- Pastikan WebSocket server berjalan
- Periksa firewall settings 