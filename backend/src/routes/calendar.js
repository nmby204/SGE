const express = require('express');
const { auth } = require('../middlewares/auth');
const calendarController = require('../controllers/calendarController');
const router = express.Router();

// Todas las rutas protegidas
router.use(auth);

/**
 * @swagger
 * /calendar/events:
 *   post:
 *     summary: Crear evento en Google Calendar
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CalendarEvent'
 *     responses:
 *       201:
 *         description: Evento creado exitosamente
 *       500:
 *         description: Error del servidor
 */
router.post('/events', calendarController.createEvent);

/**
 * @swagger
 * /calendar/events/upcoming:
 *   get:
 *     summary: Obtener eventos próximos (datos reales de BD)
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: maxResults
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número máximo de eventos a retornar
 *     responses:
 *       200:
 *         description: Lista de eventos próximos de la base de datos
 *       500:
 *         description: Error del servidor
 */
router.get('/events/upcoming', calendarController.getUpcomingEvents);

/**
 * @swagger
 * /calendar/events/system:
 *   get:
 *     summary: Obtener solo eventos del sistema (datos reales)
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: maxResults
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número máximo de eventos a retornar
 *     responses:
 *       200:
 *         description: Lista de eventos del sistema
 *       500:
 *         description: Error del servidor
 */
router.get('/events/system', calendarController.getSystemEvents);

/**
 * @swagger
 * /calendar/events/filter:
 *   get:
 *     summary: Obtener eventos filtrados por tipo
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [planning, evidence, progress]
 *         description: Tipo de evento a filtrar
 *       - in: query
 *         name: maxResults
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número máximo de eventos a retornar
 *     responses:
 *       200:
 *         description: Lista de eventos filtrados
 *       500:
 *         description: Error del servidor
 */
router.get('/events/filter', calendarController.getEventsByType);

/**
 * @swagger
 * /calendar/events/{eventId}:
 *   delete:
 *     summary: Eliminar evento del calendario
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento a eliminar
 *     responses:
 *       200:
 *         description: Evento eliminado exitosamente
 *       500:
 *         description: Error del servidor
 */
router.delete('/events/:eventId', calendarController.deleteEvent);

module.exports = router;