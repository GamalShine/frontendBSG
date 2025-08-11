// Utility functions untuk menangani berbagai format gambar

/**
 * Convert mobile app image format to File object
 * @param {Object} mobileImage - Image object from mobile app
 * @returns {Promise<File>} - File object
 */
export const convertMobileImageToFile = async (mobileImage) => {
    try {
        console.log('🔄 Converting mobile image to file:', mobileImage);

        // If we have a URL, try to fetch the image
        if (mobileImage.url) {
            const response = await fetch(mobileImage.url);
            const blob = await response.blob();
            return new File([blob], mobileImage.name, { type: blob.type });
        }

        // If we have a URI, try to fetch from local file system
        if (mobileImage.uri) {
            // For mobile apps, this would need to be handled differently
            // For now, we'll create a placeholder
            console.log('⚠️ URI handling not implemented for web');
            return new File(['placeholder'], mobileImage.name, { type: 'image/jpeg' });
        }

        throw new Error('No valid image source found');
    } catch (error) {
        console.error('❌ Error converting mobile image:', error);
        // Return a placeholder file
        return new File(['error'], mobileImage.name || 'error.jpg', { type: 'image/jpeg' });
    }
};

/**
 * Process images array to handle different formats
 * @param {Array} images - Array of images in various formats
 * @returns {Promise<Array>} - Array of File objects
 */
export const processImages = async (images) => {
    if (!images || images.length === 0) {
        return [];
    }

    const processedImages = [];

    for (const image of images) {
        try {
            // Handle mobile app format
            if (image.uri || (image.url && image.name)) {
                const file = await convertMobileImageToFile(image);
                processedImages.push(file);
            }
            // Handle web File objects
            else if (image instanceof File) {
                processedImages.push(image);
            }
            // Handle other formats
            else {
                console.warn('⚠️ Unknown image format:', image);
            }
        } catch (error) {
            console.error('❌ Error processing image:', error);
        }
    }

    return processedImages;
};

/**
 * Validate image format
 * @param {Object|File} image - Image to validate
 * @returns {boolean} - Whether image is valid
 */
export const isValidImage = (image) => {
    // Check if it's a File object
    if (image instanceof File) {
        return image.type.startsWith('image/');
    }

    // Check if it's a mobile app format
    if (image && (image.uri || image.url) && image.name) {
        return true;
    }

    return false;
};

/**
 * Get image display info
 * @param {Object|File} image - Image object
 * @returns {Object} - Display information
 */
export const getImageInfo = (image) => {
    if (image instanceof File) {
        return {
            name: image.name,
            size: image.size,
            type: image.type,
            preview: URL.createObjectURL(image)
        };
    }

    if (image && image.name) {
        return {
            name: image.name,
            size: image.size || 0,
            type: image.type || 'image/jpeg',
            preview: image.url || image.uri || null
        };
    }

    return {
        name: 'Unknown',
        size: 0,
        type: 'image/jpeg',
        preview: null
    };
}; 