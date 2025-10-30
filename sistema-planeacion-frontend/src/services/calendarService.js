import api from './api';

export const calendarService = {
  // Crear evento en calendario
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/calendar/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Error creando evento en calendario:', error);
      throw error;
    }
  },

  // Crear evento para fecha de parcial
  createPartialEvent: async (planning, partialNumber, partialDate) => {
    const eventData = {
      summary: `Parcial ${partialNumber} - ${planning.courseName}`,
      description: `Evaluación del parcial ${partialNumber} para ${planning.courseName}. Profesor: ${planning.professor?.name}`,
      start: new Date(partialDate),
      end: new Date(new Date(partialDate).getTime() + 2 * 60 * 60 * 1000), // +2 horas
      location: 'Institución Educativa',
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 día antes
          { method: 'popup', minutes: 60 } // 1 hora antes
        ]
      }
    };

    return await calendarService.createEvent(eventData);
  },

  // Crear recordatorio para revisión de planeación
  createReviewReminder: async (planning, coordinatorEmails = []) => {
    const eventData = {
      summary: `📋 Revisar Planeación - ${planning.courseName}`,
      description: `Planeación pendiente de revisión para ${planning.courseName}. Profesor: ${planning.professor?.name}`,
      start: new Date(),
      end: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
      attendees: coordinatorEmails.map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 }, // 1 hora antes
          { method: 'popup', minutes: 15 } // 15 minutos antes
        ]
      }
    };

    return await calendarService.createEvent(eventData);
  },

  // Obtener eventos próximos
  getUpcomingEvents: async (maxResults = 10) => {
    try {
      const response = await api.get(`/calendar/events/upcoming?maxResults=${maxResults}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo eventos:', error);
      return [];
    }
  },

  // Eliminar evento
  deleteEvent: async (eventId) => {
    try {
      const response = await api.delete(`/calendar/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando evento:', error);
      throw error;
    }
  }
};