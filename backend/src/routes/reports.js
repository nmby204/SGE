const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const {
  getPlanningCompliance,
  getPartialProgressReport,
  getTrainingCoursesReport,
  exportToExcel
} = require('../controllers/reportController');

const router = express.Router();

// All routes are protected
router.use(auth);

/**
 * @swagger
 * /reports/planning-compliance:
 *   get:
 *     summary: Obtener reporte de cumplimiento de planeaciones
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cycle
 *         schema:
 *           type: string
 *         description: Ciclo escolar
 *       - in: query
 *         name: partial
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 3
 *         description: Parcial específico
 *     responses:
 *       200:
 *         description: Reporte de cumplimiento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanningCompliance'
 *       403:
 *         description: No autorizado (solo coordinador/admin)
 *       500:
 *         description: Error del servidor
 */
router.get('/planning-compliance', authorize('coordinator', 'admin'), getPlanningCompliance);

/**
 * @swagger
 * /reports/partial-progress:
 *   get:
 *     summary: Obtener reporte de avances parciales
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: partial
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 3
 *         description: Parcial específico
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la materia
 *     responses:
 *       200:
 *         description: Reporte de avances parciales
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 averageProgress:
 *                   type: number
 *                   format: float
 *                 statusBreakdown:
 *                   type: object
 *                   properties:
 *                     fulfilled:
 *                       type: integer
 *                     partial:
 *                       type: integer
 *                     unfulfilled:
 *                       type: integer
 *                 byProfessor:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       total:
 *                         type: integer
 *                       fulfilled:
 *                         type: integer
 *                       averageProgress:
 *                         type: number
 *                         format: float
 *       403:
 *         description: No autorizado (solo coordinador/admin)
 *       500:
 *         description: Error del servidor
 */
router.get('/partial-progress', authorize('coordinator', 'admin'), getPartialProgressReport);

/**
 * @swagger
 * /reports/training-courses:
 *   get:
 *     summary: Obtener reporte de cursos de capacitación
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del periodo
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del periodo
 *     responses:
 *       200:
 *         description: Reporte de cursos de capacitación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrainingReport'
 *       403:
 *         description: No autorizado (solo coordinador/admin)
 *       500:
 *         description: Error del servidor
 */
router.get('/training-courses', authorize('coordinator', 'admin'), getTrainingCoursesReport);

/**
 * @swagger
 * /reports/export:
 *   get:
 *     summary: Exportar reportes a Excel
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: reportType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [planning, progress, training]
 *         description: Tipo de reporte a exportar
 *       - in: query
 *         name: cycle
 *         schema:
 *           type: string
 *         description: Ciclo escolar (para reporte de planeación)
 *       - in: query
 *         name: partial
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 3
 *         description: Parcial (para reporte de avances)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (para reporte de capacitación)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (para reporte de capacitación)
 *     responses:
 *       200:
 *         description: Archivo Excel generado
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Tipo de reporte inválido
 *       403:
 *         description: No autorizado (solo coordinador/admin)
 *       500:
 *         description: Error del servidor
 */
router.get('/export', authorize('coordinator', 'admin'), exportToExcel);

module.exports = router;