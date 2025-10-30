const express = require('express');
const { auth } = require('../middlewares/auth');
const { calendarController } = require('../controllers/calendarController');
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
 *     summary: Obtener eventos próximos
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
 *         description: Lista de eventos próximos
 *       500:
 *         description: Error del servidor
 */
router.get('/events/upcoming', calendarController.getUpcomingEvents);

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