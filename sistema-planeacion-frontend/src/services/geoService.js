// src/services/geoService.js
import api from './api';

export const geoService = {
  getUniversityLocation: async () => {
    try {
      const response = await api.get('/geo/university');
      return response.data.university;
    } catch (error) {
      console.error('Error fetching university location:', error);
      throw error;
    }
  }
};