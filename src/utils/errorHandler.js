/**
 * Utility functions for handling errors consistently across the application
 */

/**
 * Check if an error is a database duplicate key error
 * @param {Error} error - The error object
 * @returns {boolean} - True if it's a duplicate key error
 */
export const isDuplicateKeyError = (error) => {
    // Check for Sequelize unique constraint error
    if (error.name === 'SequelizeUniqueConstraintError') {
        return true
    }

    // Check for MySQL duplicate entry error
    if (error.parent && error.parent.code === 'ER_DUP_ENTRY') {
        return true
    }

    // Check for generic duplicate key error messages
    if (error.message && (
        error.message.includes('Duplicate entry') ||
        error.message.includes('PRIMARY must be unique') ||
        error.message.includes('duplicate key') ||
        error.message.includes('unique constraint')
    )) {
        return true
    }

    // Check for axios error with duplicate key in response
    if (error.response && error.response.data) {
        const responseData = error.response.data
        if (responseData.message && (
            responseData.message.includes('Duplicate entry') ||
            responseData.message.includes('PRIMARY must be unique') ||
            responseData.message.includes('duplicate key') ||
            responseData.message.includes('unique constraint')
        )) {
            return true
        }
    }

    return false
}

/**
 * Check if an error is a database connection error
 * @param {Error} error - The error object
 * @returns {boolean} - True if it's a connection error
 */
export const isConnectionError = (error) => {
    let errorMessage = ''

    if (typeof error === 'string') {
        errorMessage = error
    } else if (error && typeof error === 'object') {
        errorMessage = error.message ||
            error.error ||
            error.toString() ||
            (error.response && error.response.data && error.response.data.message) ||
            (error.response && error.response.data && error.response.data.error) ||
            JSON.stringify(error)
    }

    return errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('ENOTFOUND') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('Network Error')
}

/**
 * Get user-friendly error message
 * @param {Error} error - The error object
 * @returns {string} - User-friendly error message
 */
export const getErrorMessage = (error) => {
    if (isDuplicateKeyError(error)) {
        return 'Data sedang diproses, silakan coba lagi'
    }

    if (isConnectionError(error)) {
        return 'Koneksi ke server terputus, silakan coba lagi'
    }

    // Default error message
    return 'Terjadi kesalahan, silakan coba lagi'
}

/**
 * Extract error message from various error object structures
 * @param {Error} error - The error object
 * @returns {string} - Extracted error message
 */
export const extractErrorMessage = (error) => {
    if (typeof error === 'string') {
        return error
    }

    if (error && typeof error === 'object') {
        return error.message ||
            error.error ||
            (error.response && error.response.data && error.response.data.message) ||
            (error.response && error.response.data && error.response.data.error) ||
            error.toString()
    }

    return 'Unknown error'
}

/**
 * Handle API errors with retry logic for specific error types
 * @param {Function} apiCall - The API function to call
 * @param {number} maxRetries - Maximum number of retries (default: 1)
 * @param {number} delay - Delay between retries in ms (default: 100)
 * @returns {Promise} - Promise that resolves with the API response
 */
export const retryApiCall = async (apiCall, maxRetries = 1, delay = 100) => {
    let lastError

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await apiCall()
        } catch (error) {
            lastError = error

            // Only retry for specific errors
            if (isDuplicateKeyError(error) && attempt < maxRetries) {
                console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`)
                await new Promise(resolve => setTimeout(resolve, delay))
                continue
            }

            // For other errors or max retries reached, throw the error
            throw error
        }
    }

    throw lastError
} 