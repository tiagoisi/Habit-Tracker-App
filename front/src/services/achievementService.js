import api from './authService';

export const achievementService = {
    // Obtener todos los logros
    async getAll() {
        const response = await api.get('/achievements');
        return response.data;
    },

    // Obtener progreso de logros
    async getProgress() {
        const response = await api.get('/achievements/progress');
        return response.data;
    },
};