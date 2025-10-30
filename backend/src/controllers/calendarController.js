const calendarService = require('../services/calendarService');
const calendarNotificationService = require('../services/calendarNotificationService');

const calendarController = {
  createEvent: async (req, res) => {
    try {
      const { summary, description, start, end, location, attendees, reminders, type } = req.body;

      console.log('📅 Creando evento:', { summary, start, end, type });

      const result = await calendarService.createEvent(
        { summary, description, start, end, location, attendees, reminders, type },
        req.user?.calendarAccessToken
      );

      console.log('✅ Evento creado:', result.source);

      res.status(201).json({
        message: `Evento creado exitosamente (${result.source})`,
        event: result.event
      });

    } catch (error) {
      console.error('❌ Error en createEvent:', error);
      res.status(500).json({ 
        message: 'Error creando evento',
        error: error.message 
      });
    }
  },

  getUpcomingEvents: async (req, res) => {
    try {
      const { maxResults = 10, includeSystemEvents = true } = req.query;

      console.log('📅 Obteniendo eventos próximos');

      // Obtener eventos de la base de datos (reales)
      const calendarResult = await calendarService.getUpcomingEvents(
        parseInt(maxResults),
        req.user?.calendarAccessToken,
        req.user // ← Pasar el usuario para obtener datos reales
      );

      let response = {
        source: calendarResult.source,
        events: calendarResult.events
      };

      console.log('✅ Eventos obtenidos:', response.events.length);

      res.json(response);

    } catch (error) {
      console.error('❌ Error en getUpcomingEvents:', error);
      res.status(500).json({ 
        message: 'Error obteniendo eventos',
        error: error.message 
      });
    }
  },

  deleteEvent: async (req, res) => {
    try {
      const { eventId } = req.params;

      console.log('📅 Eliminando evento:', eventId);

      const result = await calendarService.deleteEvent(
        eventId,
        req.user?.calendarAccessToken
      );

      console.log('✅ Evento eliminado:', result.source);

      res.json({ 
        message: `Evento eliminado exitosamente (${result.source})`,
        deleted: result.deleted
      });

    } catch (error) {
      console.error('❌ Error en deleteEvent:', error);
      res.status(500).json({ 
        message: 'Error eliminando evento',
        error: error.message 
      });
    }
  },

  // ✅ NUEVA FUNCIÓN: Obtener solo eventos del sistema (datos reales)
  getSystemEvents: async (req, res) => {
    try {
      const { maxResults = 10 } = req.query;

      console.log('📅 Obteniendo eventos del sistema (datos reales)');

      const systemEvents = await calendarNotificationService.getSystemEvents(req.user, parseInt(maxResults));

      console.log('✅ Eventos del sistema obtenidos:', systemEvents.length);

      res.json({
        source: 'system',
        events: systemEvents,
        totalEvents: systemEvents.length
      });

    } catch (error) {
      console.error('❌ Error en getSystemEvents:', error);
      res.status(500).json({ 
        message: 'Error obteniendo eventos del sistema',
        error: error.message 
      });
    }
  },

  // ✅ NUEVA FUNCIÓN: Obtener eventos por tipo
  getEventsByType: async (req, res) => {
    try {
      const { type, maxResults = 10 } = req.query;
      
      console.log(`📅 Obteniendo eventos por tipo: ${type}`);

      const allEvents = await calendarNotificationService.getDatabaseEvents(req.user, 50); // Obtener más para filtrar
      
      const filteredEvents = type 
        ? allEvents.filter(event => event.type === type)
        : allEvents;

      const limitedEvents = filteredEvents.slice(0, maxResults);

      console.log(`✅ Eventos de tipo "${type}" obtenidos:`, limitedEvents.length);

      res.json({
        type: type || 'all',
        events: limitedEvents,
        totalEvents: limitedEvents.length
      });

    } catch (error) {
      console.error('❌ Error en getEventsByType:', error);
      res.status(500).json({ 
        message: 'Error obteniendo eventos por tipo',
        error: error.message 
      });
    }
  }
};

module.exports = calendarController;