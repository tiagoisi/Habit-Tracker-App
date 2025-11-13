import api from './authService';

export const userService = {
    // Obtener estadísticas del usuario
    async getStats(userId) {
        const response = await api.get(`/users/${userId}/stats`);
        return response.data;
    },

    // Subir avatar
    async uploadAvatar(userId, formData) {
        const response = await api.post(`/users/${userId}/avatar`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Eliminar avatar
    async deleteAvatar(userId) {
        const response = await api.delete(`/users/${userId}/avatar`);
        return response.data;
    },

    // Actualizar perfil
    async updateProfile(userId, data) {
        const response = await api.patch(`/users/${userId}`, data);
        return response.data;
    },
};