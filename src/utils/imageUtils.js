/**
 * Utility functions for processing images in POSKAS
 */

/**
 * Parse images string to array with proper URL fixing
 * @param {any} imagesData - Images data (string, array, or object)
 * @param {string} baseUrl - Base URL for making relative URLs absolute
 * @returns {Array} Array of processed image objects
 */
export const parseImagesString = (imagesData, baseUrl = '') => {
  if (!imagesData) return [];

  try {
    console.log('🔍 parseImagesString called with:', imagesData);
    console.log('🔍 imagesData type:', typeof imagesData);
    console.log('🔍 baseUrl:', baseUrl);

    let result;

    // Handle different formats
    if (Array.isArray(imagesData)) {
      result = imagesData;
      console.log('✅ Images is already an array, using directly');
    } else if (typeof imagesData === 'string') {
      try {
        let cleanImages = imagesData.trim();

        if (cleanImages.startsWith('"') && cleanImages.endsWith('"')) {
          cleanImages = cleanImages.slice(1, -1);
        }

        cleanImages = cleanImages.replace(/\\"/g, '"').replace(/\\\\/g, '\\');

        console.log('🔍 Cleaned images string:', cleanImages);

        result = JSON.parse(cleanImages);
        console.log('✅ Successfully parsed string as JSON:', result);
      } catch (parseError) {
        console.log('ℹ️ Failed to parse string as JSON, treating as single image name:', parseError);
        result = [{ name: imagesData, url: imagesData }];
      }
    } else if (typeof imagesData === 'object' && imagesData !== null) {
      result = [imagesData];
      console.log('✅ Single object wrapped in array');
    } else {
      console.log('ℹ️ Unknown images format:', typeof imagesData);
      return [];
    }

    if (!Array.isArray(result)) {
      console.log('ℹ️ Parsed result is not an array, converting...');
      if (result && typeof result === 'object' && result !== null) {
        result = [result];
        console.log('✅ Converted single object to array');
      } else {
        console.log('ℹ️ Invalid images data, returning empty array');
        return [];
      }
    }

    result = result.filter(image => {
      if (!image || typeof image !== 'object') {
        console.log('ℹ️ Invalid image object:', image);
        return false;
      }
      return true;
    }).map(image => {
      const validImage = {
        id: image.id || image.image_id || Date.now() + Math.random(),
        name: image.name || image.filename || `image_${Date.now()}`,
        url: image.url || image.image_url || '',
        uri: image.uri || image.image_uri || '',
        serverPath: image.serverPath || image.server_path || ''
      };

      if (validImage.url) {
        let fixedUrl = validImage.url;

        if (fixedUrl.startsWith('http://http://')) {
          fixedUrl = fixedUrl.replace('http://http://', 'http://');
          console.log(`🔍 Fixed double http:// URL: ${validImage.url} -> ${fixedUrl}`);
        }

        if (fixedUrl.includes('/api/uploads/')) {
          fixedUrl = fixedUrl.replace('/api/uploads/', '/uploads/');
          console.log(`🔍 Fixed /api in upload URL: ${validImage.url} -> ${fixedUrl}`);
        }

        if (!fixedUrl.startsWith('http') && !fixedUrl.startsWith('data:')) {
          const baseUrlClean = baseUrl.replace('/api', '');
          fixedUrl = `${baseUrlClean}${fixedUrl.startsWith('/') ? '' : '/'}${fixedUrl}`;
          console.log(`🔍 Made URL absolute: ${validImage.url} -> ${fixedUrl}`);
        }

        validImage.url = fixedUrl;
      }

      if (validImage.uri) {
        let fixedUri = validImage.uri;

        if (fixedUri.startsWith('http://http://')) {
          fixedUri = fixedUri.replace('http://http://', 'http://');
        }

        if (fixedUri.includes('/api/uploads/')) {
          fixedUri = fixedUri.replace('/api/uploads/', '/uploads/');
        }

        if (!fixedUri.startsWith('http') && !fixedUri.startsWith('data:')) {
          const baseUrlClean = baseUrl.replace('/api', '');
          fixedUri = `${baseUrlClean}${fixedUri.startsWith('/') ? '' : '/'}${fixedUri}`;
        }

        validImage.uri = fixedUri;
      }

      return validImage;
    });

    console.log('🔍 Final parsed images:', result);
    return result;
  } catch (error) {
    console.error('❌ Error parsing images string:', error);
    return [];
  }
};

/**
 * Get display URL for an image (prioritizes url over uri)
 * @param {Object} image - Image object
 * @returns {string} Display URL
 */
export const getImageDisplayUrl = (image) => {
  if (!image) return '';

  if (image.url) {
    return image.url;
  }

  if (image.uri) {
    return image.uri;
  }

  return '';
};

/**
 * Get fallback URL for an image (prioritizes uri over url)
 * @param {Object} image - Image object
 * @returns {string} Fallback URL
 */
export const getImageFallbackUrl = (image) => {
  if (!image) return '';

  if (image.uri) {
    return image.uri;
  }

  if (image.url) {
    return image.url;
  }

  return '';
};

/**
 * Get comprehensive image information for preview components
 * @param {Object|File} image - Image object or File object
 * @returns {Object} Image info object with preview, name, size, etc.
 */
export const getImageInfo = (image) => {
  if (!image) {
    return {
      preview: '',
      name: 'Unknown',
      size: 0,
      type: 'unknown'
    };
  }

  // Handle File objects (from file input)
  if (image instanceof File) {
    return {
      preview: URL.createObjectURL(image),
      name: image.name,
      size: image.size,
      type: image.type
    };
  }

  // Handle image objects with preview URLs
  if (image.preview) {
    return {
      preview: image.preview,
      name: image.name || 'Image',
      size: image.size || 0,
      type: image.type || 'image'
    };
  }

  // Handle image objects with URLs
  if (image.url || image.uri) {
    return {
      preview: image.url || image.uri,
      name: image.name || image.filename || 'Image',
      size: image.size || 0,
      type: image.type || 'image'
    };
  }

  // Handle base64 data URLs
  if (image.dataURL) {
    return {
      preview: image.dataURL,
      name: image.name || 'Image',
      size: image.size || 0,
      type: image.type || 'image'
    };
  }

  // Fallback for unknown image types
  return {
    preview: '',
    name: image.name || image.filename || 'Unknown Image',
    size: image.size || 0,
    type: image.type || 'unknown'
  };
};

/**
 * Check if an image object is valid
 * @param {any} image - Image object to validate
 * @returns {boolean} True if image is valid
 */
export const isValidImage = (image) => {
  if (!image) return false;

  // Check if it's a File object
  if (image instanceof File) {
    return image.type.startsWith('image/');
  }

  // Check if it's an object with required properties
  if (typeof image === 'object') {
    return !!(image.url || image.uri || image.preview || image.dataURL);
  }

  return false;
};

/**
 * Format file size in human readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Clean up object URLs to prevent memory leaks
 * @param {string} objectURL - Object URL to revoke
 */
export const revokeObjectURL = (objectURL) => {
  if (objectURL && objectURL.startsWith('blob:')) {
    URL.revokeObjectURL(objectURL);
  }
}; 