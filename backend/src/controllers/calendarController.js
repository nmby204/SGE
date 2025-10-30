const { google } = require('googleapis');

const calendarController = {
  createEvent: async (req, res) => {
    try {
      const { summary, description, start, end, location, attendees, reminders } = req.body;

      // Configurar OAuth2 (usar el token del usuario)
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CALENDAR_CLIENT_ID,
        process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
        process.env.GOOGLE_CALENDAR_REDIRECT_URI
      );

      // En una implementación real, usarías el token del usuario
      oauth2Client.setCredentials({
        access_token: req.user.calendarAccessToken // Asumiendo que guardas el token
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const event = {
        summary,
        description,
        start: {
          dateTime: new Date(start).toISOString(),
          timeZone: 'America/Mexico_City',
        },
        end: {
          dateTime: new Date(end).toISOString(),
          timeZone: 'America/Mexico_City',
        },
        location,
        attendees: attendees || [],
        reminders: reminders || {
          useDefault: true
        }
      };

      const response = await calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        resource: event,
      });

      res.status(201).json({
        message: 'Evento creado exitosamente',
        event: response.data
      });

    } catch (error) {
      console.error('Error creando evento en Calendar:', error);
      res.status(500).json({ 
        message: 'Error creando evento en calendario',
        error: error.message 
      });
    }
  },

  getUpcomingEvents: async (req, res) => {
    try {
      const { maxResults = 10 } = req.query;

      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CALENDAR_CLIENT_ID,
        process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
        process.env.GOOGLE_CALENDAR_REDIRECT_URI
      );

      oauth2Client.setCredentials({
        access_token: req.user.calendarAccessToken
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const response = await calendar.events.list({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        timeMin: new Date().toISOString(),
        maxResults: parseInt(maxResults),
        singleEvents: true,
        orderBy: 'startTime',
      });

      res.json({
        events: response.data.items
      });

    } catch (error) {
      console.error('Error obteniendo eventos:', error);
      res.status(500).json({ 
        message: 'Error obteniendo eventos del calendario',
        error: error.message 
      });
    }
  },

  deleteEvent: async (req, res) => {
    try {
      const { eventId } = req.params;

      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CALENDAR_CLIENT_ID,
        process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
        process.env.GOOGLE_CALENDAR_REDIRECT_URI
      );

      oauth2Client.setCredentials({
        access_token: req.user.calendarAccessToken
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      await calendar.events.delete({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        eventId: eventId,
      });

      res.json({ message: 'Evento eliminado exitosamente' });

    } catch (error) {
      console.error('Error eliminando evento:', error);
      res.status(500).json({ 
        message: 'Error eliminando evento del calendario',
        error: error.message 
      });
    }
  }
};

module.exports = calendarController;