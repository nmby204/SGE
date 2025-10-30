const { google } = require('googleapis');

class CalendarService {
  constructor() {
    if (process.env.GOOGLE_CALENDAR_CLIENT_ID && process.env.GOOGLE_CALENDAR_CLIENT_SECRET) {
      this.oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CALENDAR_CLIENT_ID,
        process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
        process.env.GOOGLE_CALENDAR_REDIRECT_URI
      );
    }
  }

  isGoogleCalendarConfigured() {
    return !!(process.env.GOOGLE_CALENDAR_CLIENT_ID && process.env.GOOGLE_CALENDAR_CLIENT_SECRET);
  }

  setAuthCredentials(accessToken) {
    if (this.oauth2Client && accessToken) {
      this.oauth2Client.setCredentials({ access_token: accessToken });
    }
  }

  async createGoogleCalendarEvent(eventData) {
    try {
      if (!this.isGoogleCalendarConfigured()) {
        throw new Error('Google Calendar no está configurado');
      }

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const event = {
        summary: eventData.summary,
        description: eventData.description,
        start: {
          dateTime: new Date(eventData.start).toISOString(),
          timeZone: 'America/Mexico_City',
        },
        end: {
          dateTime: new Date(eventData.end).toISOString(),
          timeZone: 'America/Mexico_City',
        },
        location: eventData.location,
        attendees: eventData.attendees || [],
        reminders: eventData.reminders || { useDefault: true }
      };

      const response = await calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        resource: event,
      });

      return response.data;
    } catch (error) {
      console.error('Error en createGoogleCalendarEvent:', error);
      throw error;
    }
  }

  async getUpcomingGoogleEvents(maxResults = 10) {
    try {
      if (!this.isGoogleCalendarConfigured()) {
        throw new Error('Google Calendar no está configurado');
      }

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const response = await calendar.events.list({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        timeMin: new Date().toISOString(),
        maxResults: parseInt(maxResults),
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error en getUpcomingGoogleEvents:', error);
      throw error;
    }
  }

  async deleteGoogleCalendarEvent(eventId) {
    try {
      if (!this.isGoogleCalendarConfigured()) {
        throw new Error('Google Calendar no está configurado');
      }

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      await calendar.events.delete({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        eventId: eventId,
      });

      return true;
    } catch (error) {
      console.error('Error en deleteGoogleCalendarEvent:', error);
      throw error;
    }
  }

  getLocalEvents(maxResults = 5) {
    const events = [
      {
        id: 'local-1',
        summary: 'Revisión de Planeaciones Q1',
        description: 'Revisión mensual de planeaciones didácticas',
        start: { dateTime: new Date(Date.now() + 86400000).toISOString() },
        end: { dateTime: new Date(Date.now() + 90000000).toISOString() },
        location: 'Sala de juntas',
        type: 'meeting'
      },
      {
        id: 'local-2',
        summary: 'Capacitación Docentes',
        description: 'Capacitación sobre nuevas metodologías',
        start: { dateTime: new Date(Date.now() + 172800000).toISOString() },
        end: { dateTime: new Date(Date.now() + 180000000).toISOString() },
        location: 'Aula magna',
        type: 'training'
      }
    ];

    return events.slice(0, maxResults);
  }

  async createEvent(eventData, userAccessToken = null) {
    try {
      if (this.isGoogleCalendarConfigured()) {
        this.setAuthCredentials(userAccessToken);
        const googleEvent = await this.createGoogleCalendarEvent(eventData);
        return {
          source: 'google',
          event: googleEvent
        };
      }
      throw new Error('Google Calendar no configurado');
    } catch (error) {
      console.warn('Creando evento local como fallback:', error.message);
      const localEvent = {
        id: 'local-' + Date.now(),
        summary: eventData.summary,
        description: eventData.description,
        start: { dateTime: eventData.start },
        end: { dateTime: eventData.end },
        location: eventData.location,
        type: eventData.type || 'event'
      };
      return {
        source: 'local',
        event: localEvent
      };
    }
  }

  async getUpcomingEvents(maxResults = 10, userAccessToken = null, user = null) {
    // Si tenemos usuario, obtener eventos reales de la base de datos
    if (user) {
      console.log('📅 Obteniendo eventos reales de la base de datos');
      const calendarNotificationService = require('./calendarNotificationService');
      const realEvents = await calendarNotificationService.getDatabaseEvents(user, maxResults);
      return {
        source: 'database',
        events: realEvents
      };
    }

    // Si no hay usuario, intentar Google Calendar o eventos locales
    try {
      if (this.isGoogleCalendarConfigured()) {
        this.setAuthCredentials(userAccessToken);
        const googleEvents = await this.getUpcomingGoogleEvents(maxResults);
        return {
          source: 'google',
          events: googleEvents
        };
      }
    } catch (error) {
      console.warn('Obteniendo eventos locales como fallback:', error.message);
    }

    // Fallback a eventos locales
    const localEvents = this.getLocalEvents(maxResults);
    return {
      source: 'local',
      events: localEvents
    };
  }

  async deleteEvent(eventId, userAccessToken = null) {
    try {
      if (eventId.startsWith('local-')) {
        return { source: 'local', deleted: true };
      }

      if (this.isGoogleCalendarConfigured()) {
        this.setAuthCredentials(userAccessToken);
        await this.deleteGoogleCalendarEvent(eventId);
        return { source: 'google', deleted: true };
      }
      throw new Error('Google Calendar no configurado');
    } catch (error) {
      console.error('Error eliminando evento:', error);
      throw error;
    }
  }
}

module.exports = new CalendarService();