import { API_CONFIG } from '../config/constants';

// Mengembalikan origin BASE_URL tanpa trailing /api
const getBaseOrigin = () => {
  try {
    const base = API_CONFIG?.BASE_URL || '';
    return base.replace(/\/?api\/?$/, '');
  } catch (_) {
    return '';
  }
};

const stripDoubleScheme = (url) => {
  if (typeof url !== 'string') return url;
  return url
    .replace(/^http:\/\/http:\/\//, 'http://')
    .replace(/^https:\/\/https:\/\//, 'https://');
};

// Ganti origin lama (localhost/IP) menjadi origin dari env
const replaceLegacyOrigin = (url, baseOrigin) => {
  if (typeof url !== 'string') return url;
  // Jika absolute URL, ganti host di depan
  return url.replace(/^https?:\/\/[^/]+/i, (match) => {
    // Jika sudah sama dengan baseOrigin, biarkan
    if (baseOrigin && match.toLowerCase().startsWith(baseOrigin.toLowerCase())) return match;
    return baseOrigin || match;
  });
};

// Normalisasi URL gambar secara generik berdasarkan env
export const normalizeImageUrl = (inputUrl) => {
  if (!inputUrl) return '';
  if (typeof inputUrl !== 'string') return String(inputUrl || '');

  const baseOrigin = getBaseOrigin();
  let url = inputUrl.trim();

  // Perbaiki double scheme
  url = stripDoubleScheme(url);

  // Biarkan skema lokal/temporary apa adanya
  if (url.startsWith('data:') || url.startsWith('file:') || url.startsWith('blob:')) {
    return url;
  }

  // Hilangkan /api pada path upload jika ada
  url = url.replace('/api/uploads/', '/uploads/');

  // Jika relatif ke root uploads
  if (url.startsWith('/uploads/')) {
    return `${baseOrigin}${url}`;
  }

  // Jika absolute URL
  if (/^https?:\/\//i.test(url)) {
    // Jika mengandung localhost:5173 atau IP lama, ganti origin
    if (/localhost:5173|^https?:\/\/\d+\.\d+\.\d+\.\d+(:\d+)?/i.test(url)) {
      return replaceLegacyOrigin(url, baseOrigin);
    }
    // Jika absolute lain, tetap tapi pastikan tidak ada /api di upload
    return url;
  }

  // Jika relatif tanpa leading slash, buat absolute
  if (!url.startsWith('/')) {
    return `${baseOrigin}/${url}`;
  }

  // Relatif namun bukan uploads, gabungkan ke origin
  return `${baseOrigin}${url}`;
};

// Utility untuk array objek gambar { url, ... }
export const normalizeImagesArray = (images) => {
  if (!Array.isArray(images)) return [];
  return images.map((img) => {
    if (img && typeof img === 'object' && img.url) {
      return { ...img, url: normalizeImageUrl(img.url) };
    }
    return img;
  });
};
