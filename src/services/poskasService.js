import api from './api'

export const poskasService = {
    async getPoskas() {
        const response = await api.get('/keuangan-poskas')
        return response.data
    },

    async getPoskasById(id) {
        const response = await api.get(`/keuangan-poskas/${id}`)
        return response.data
    },

    async createPoskas(poskasData) {
        console.log('📤 Service: Creating FormData...');
        const formData = new FormData()

        // Add text fields
        formData.append('tanggal_poskas', poskasData.tanggal_poskas)
        formData.append('isi_poskas', poskasData.isi_poskas)
        console.log('📝 Service: Added text fields');

        // Add images if any
        if (poskasData.images && poskasData.images.length > 0) {
            console.log('📁 Service: Adding images to FormData:', poskasData.images.length);
            poskasData.images.forEach((image, index) => {
                console.log(`   ${index + 1}. ${image.name} (${(image.size / 1024).toFixed(1)} KB)`);
                formData.append('images', image)
            })
        } else {
            console.log('📁 Service: No images to upload');
        }

        console.log('📤 Service: Sending request to API...');
        const response = await api.post('/keuangan-poskas', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        console.log('📥 Service: Received response:', response.data);
        return response.data
    },

    async updatePoskas(id, poskasData) {
        const formData = new FormData()

        // Add text fields
        formData.append('tanggal_poskas', poskasData.tanggal_poskas)
        formData.append('isi_poskas', poskasData.isi_poskas)

        // Add images if any
        if (poskasData.images && poskasData.images.length > 0) {
            poskasData.images.forEach((image, index) => {
                formData.append('images', image)
            })
        }

        const response = await api.put(`/keuangan-poskas/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },

    async deletePoskas(id) {
        const response = await api.delete(`/keuangan-poskas/${id}`)
        return response.data
    },

    async getPoskasByDateRange(startDate, endDate) {
        const response = await api.get('/keuangan-poskas/date-range', {
            params: { startDate, endDate }
        })
        return response.data
    },

    async getPoskasByUser(userId) {
        const response = await api.get(`/keuangan-poskas/user/${userId}`)
        return response.data
    },
} 