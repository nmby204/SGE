import api from './api';

export const progressService = {
  // Crear avance
  createProgress: async (progressData) => {
    const response = await api.post('/progress', progressData);
    return response.data;
  },

  // Obtener avances por planeación
  getProgressByPlanning: async (planningId) => {
    const response = await api.get(`/progress/planning/${planningId}`);
    return response.data;
  },

  // Obtener estadísticas
  getProgressStats: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    const response = await api.get(`/progress/stats?${params}`);
    return response.data;
  },

  // Actualizar avance
  updateProgress: async (id, progressData) => {
    const response = await api.put(`/progress/${id}`, progressData);
    return response.data;
  }
};