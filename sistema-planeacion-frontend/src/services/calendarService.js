import api from './api';

export const calendarService = {
  // Obtener eventos próximos (datos reales de BD)
  getUpcomingEvents: async (maxResults = 5) => {
    try {
      const response = await api.get(`/calendar/events/upcoming?maxResults=${maxResults}`);
      return response.data;
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      throw error;
    }
  },

  // Obtener solo eventos del sistema
  getSystemEvents: async (maxResults = 10) => {
    try {
      const response = await api.get(`/calendar/events/system?maxResults=${maxResults}`);
      return response.data;
    } catch (error) {
      console.error('Error getting system events:', error);
      throw error;
    }
  },

  // Obtener eventos filtrados por tipo
  getEventsByType: async (type, maxResults = 10) => {
    try {
      const response = await api.get(`/calendar/events/filter?type=${type}&maxResults=${maxResults}`);
      return response.data;
    } catch (error) {
      console.error('Error getting events by type:', error);
      throw error;
    }
  },

  // Crear evento manual
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/calendar/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  },

  // Eliminar evento
  deleteEvent: async (eventId) => {
    try {
      const response = await api.delete(`/calendar/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }
};