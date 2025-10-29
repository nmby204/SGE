import api from './api';

export const reportService = {
  // Reporte de cumplimiento de planeaciones
  getPlanningCompliance: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    const response = await api.get(`/reports/planning-compliance?${params}`);
    return response.data;
  },

  // Reporte de avances parciales
  getPartialProgressReport: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    const response = await api.get(`/reports/partial-progress?${params}`);
    return response.data;
  },

  // Reporte de cursos de capacitación
  getTrainingCoursesReport: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    const response = await api.get(`/reports/training-courses?${params}`);
    return response.data;
  },

  // Exportar a Excel
  exportToExcel: async (reportType, filters = {}) => {
    const params = new URLSearchParams();
    params.append('reportType', reportType);
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    const response = await api.get(`/reports/export?${params}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};