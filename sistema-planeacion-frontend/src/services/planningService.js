import api from './api';

export const planningService = {
  createPlanning: async (planningData) => {
    const formData = new FormData();
    
    // Agregar campos de texto (incluyendo courseName)
    Object.keys(planningData).forEach(key => {
      if (key !== 'file' && planningData[key] !== undefined) {
        formData.append(key, planningData[key]);
      }
    });
    
    // Agregar archivo si existe
    if (planningData.file) {
      formData.append('file', planningData.file);
    }

    const response = await api.post('/planning', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Los demás métodos se mantienen igual...
  getPlannings: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    const response = await api.get(`/planning?${params}`);
    return response.data;
  },

  getPlanningById: async (id) => {
    const response = await api.get(`/planning/${id}`);
    return response.data;
  },

  updatePlanning: async (id, planningData) => {
    const formData = new FormData();
    
    Object.keys(planningData).forEach(key => {
      if (key !== 'file' && planningData[key] !== undefined) {
        formData.append(key, planningData[key]);
      }
    });
    
    if (planningData.file) {
      formData.append('file', planningData.file);
    }

    const response = await api.put(`/planning/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  reviewPlanning: async (id, reviewData) => {
    const response = await api.put(`/planning/${id}/review`, reviewData);
    return response.data;
  },

  deletePlanning: async (id) => {
    const response = await api.delete(`/planning/${id}`);
    return response.data;
  }
};