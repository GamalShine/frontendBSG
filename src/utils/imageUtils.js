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
        
        if (fixedUrl.includes('192.168.30.49:3000')) {
          const baseUrlClean = baseUrl.replace('/api', '');
          fixedUrl = fixedUrl.replace('http://192.168.30.49:3000', baseUrlClean);
          console.log(`🔍 Fixed old IP URL: ${validImage.url} -> ${fixedUrl}`);
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
        
        if (fixedUri.includes('192.168.30.49:3000')) {
          const baseUrlClean = baseUrl.replace('/api', '');
          fixedUri = fixedUri.replace('http://192.168.30.49:3000', baseUrlClean);
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