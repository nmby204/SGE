import api from './api';

export const evidenceService = {
  // Crear evidencia
  createEvidence: async (evidenceData) => {
    const formData = new FormData();
    
    Object.keys(evidenceData).forEach(key => {
      if (key !== 'file' && evidenceData[key] !== undefined) {
        formData.append(key, evidenceData[key]);
      }
    });
    
    if (evidenceData.file) {
      formData.append('file', evidenceData.file);
    }

    const response = await api.post('/evidence', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Obtener todas las evidencias
  getEvidences: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    const response = await api.get(`/evidence?${params}`);
    return response.data;
  },

  // Obtener evidencia por ID
  getEvidenceById: async (id) => {
    const response = await api.get(`/evidence/${id}`);
    return response.data;
  },

  // Actualizar evidencia
  updateEvidence: async (id, evidenceData) => {
    const formData = new FormData();
    
    Object.keys(evidenceData).forEach(key => {
      if (key !== 'file' && evidenceData[key] !== undefined) {
        formData.append(key, evidenceData[key]);
      }
    });
    
    if (evidenceData.file) {
      formData.append('file', evidenceData.file);
    }

    const response = await api.put(`/evidence/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Revisar evidencia (coordinador/admin)
  reviewEvidence: async (id, reviewData) => {
    const response = await api.put(`/evidence/${id}/review`, reviewData);
    return response.data;
  },

  // Eliminar evidencia
  deleteEvidence: async (id) => {
    const response = await api.delete(`/evidence/${id}`);
    return response.data;
  }
};