import api from './api';

export const planningService = {
  createPlanning: async (planningData) => {
    console.log('🔄 planningService.createPlanning llamado con:', planningData);
    
    // ✅ DETECTAR SI ES GOOGLE DRIVE O LOCAL
    const isGoogleDrive = planningData.driveFileId && planningData.fileUrl;
    
    if (isGoogleDrive) {
      console.log('☁️ Enviando datos de Google Drive al backend');
      // Enviar como JSON normal (sin FormData)
      const response = await api.post('/planning', planningData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } else {
      console.log('📂 Enviando archivo local con FormData');
      // Método original con FormData
      const formData = new FormData();
      
      Object.keys(planningData).forEach(key => {
        if (key !== 'file' && planningData[key] !== undefined) {
          formData.append(key, planningData[key]);
        }
      });
      
      if (planningData.file) {
        formData.append('file', planningData.file);
      }

      const response = await api.post('/planning', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data' 
        }
      });
      return response.data;
    }
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
    console.log('🔄 planningService.updatePlanning llamado con:', planningData);
    
    // ✅ DETECTAR SI ES GOOGLE DRIVE O LOCAL
    const isGoogleDrive = planningData.driveFileId && planningData.fileUrl;
    
    if (isGoogleDrive) {
      console.log('☁️ Enviando datos de Google Drive al backend (update)');
      const response = await api.put(`/planning/${id}`, planningData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } else {
      console.log('📂 Enviando archivo local con FormData (update)');
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
    }
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