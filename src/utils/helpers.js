import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

export const formatDate = (date, formatStr = 'dd MMM yyyy') => {
    if (!date) return '-'
    try {
        const parsedDate = typeof date === 'string' ? parseISO(date) : date
        return format(parsedDate, formatStr, { locale: id })
    } catch (error) {
        return '-'
    }
}

export const formatDateTime = (date) => {
    return formatDate(date, 'dd MMM yyyy HH:mm')
}

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
    }).format(amount || 0)
}

export const getInitials = (name) => {
    if (!name) return ''
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

export const truncateText = (text, maxLength = 100) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
}

export const getFileExtension = (filename) => {
    if (!filename) return ''
    return filename.split('.').pop().toLowerCase()
}

export const isImageFile = (filename) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    return imageExtensions.includes(getFileExtension(filename))
}

export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const debounce = (func, wait) => {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

export const generateId = () => {
    return Math.random().toString(36).substr(2, 9)
} 