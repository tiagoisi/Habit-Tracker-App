import api from './authService';

export const habitService = {
    // Obtener todos los hábitos del usuario
    async getAll() {
        const response = await api.get('/habits');
        return response.data;
    },

    // Obtener un hábito específico
    async getOne(id) {
        const response = await api.get(`/habits/${id}`);
        return response.data;
    },

    // Crear nuevo hábito
    async create(habitData) {
        const response = await api.post('/habits', habitData);
        return response.data;
    },

    // Actualizar hábito
    async update(id, habitData) {
        const response = await api.patch(`/habits/${id}`, habitData);
        return response.data;
    },

    // Eliminar hábito
    async delete(id) {
        await api.delete(`/habits/${id}`);
    },

    // Activar/desactivar hábito
    async toggleActive(id) {
        const response = await api.patch(`/habits/${id}/toggle`);
        return response.data;
    },

    // Marcar como completado
    async complete(id, notes = '') {
        const response = await api.post(`/habits/${id}/complete`, { notes });
        return response.data;
    },

    // Desmarcar
    async uncomplete(id) {
        await api.delete(`/habits/${id}/complete`);
    },

    // Obtener progreso (últimos 30 días)
    async getProgress(id) {
        const response = await api.get(`/habits/${id}/progress`);
        return response.data;
    },

    // Obtener resumen del día
    async getTodaySummary() {
        const response = await api.get('/habits/summary');
        return response.data;
    },

     // ✅ NUEVO MÉTODO
    async getMonthlyStats(year, month) {
        const params = new URLSearchParams();
        if (year) params.append('year', year);
        if (month !== undefined) params.append('month', month);
        
        const response = await api.get(`/habits/monthly-stats?${params.toString()}`);
        return response.data;
    },
};