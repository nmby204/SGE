const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const {
  createPlanning,
  getPlannings,
  getPlanningById,
  getPlanningHistory,
  updatePlanning,
  reviewPlanning,
  deletePlanning
} = require('../controllers/planningController');

const router = express.Router();

// All routes are protected
router.use(auth);

/**
 * @swagger
 * /planning:
 *   post:
 *     summary: Crear nueva planeación didáctica (Solo Profesor)
 *     tags: [Planeación Didáctica]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - courseName
 *               - partial
 *               - cycle
 *               - content
 *               - objectives
 *               - methodology
 *               - evaluation
 *             properties:
 *               courseName:
 *                 type: string
 *                 description: Nombre de la materia
 *               partial:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 3
 *               cycle:
 *                 type: string
 *               content:
 *                 type: string
 *               objectives:
 *                 type: string
 *               methodology:
 *                 type: string
 *               evaluation:
 *                 type: string
 *               resources:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Planeación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DidacticPlanning'
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No autorizado (solo profesores)
 *       500:
 *         description: Error del servidor
 */
router.post('/', [
  authorize('professor'),
  upload.single('file'),
  body('courseName', 'Course name is required').not().isEmpty(),
  body('partial', 'Partial is required and must be 1-3').isInt({ min: 1, max: 3 }),
  body('cycle', 'Cycle is required').not().isEmpty(),
  body('content', 'Content is required').not().isEmpty(),
  body('objectives', 'Objectives are required').not().isEmpty(),
  body('methodology', 'Methodology is required').not().isEmpty(),
  body('evaluation', 'Evaluation is required').not().isEmpty()
], createPlanning);

/**
 * @swagger
 * /planning:
 *   get:
 *     summary: Obtener todas las planeaciones
 *     tags: [Planeación Didáctica]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseName
 *         schema:
 *           type: string
 *         description: Filtrar por nombre de materia
 *       - in: query
 *         name: partial
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 3
 *         description: Filtrar por parcial
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, adjustments_required]
 *         description: Filtrar por estado
 *       - in: query
 *         name: cycle
 *         schema:
 *           type: string
 *         description: Filtrar por ciclo escolar
 *     responses:
 *       200:
 *         description: Lista de planeaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DidacticPlanning'
 *       500:
 *         description: Error del servidor
 */
router.get('/', getPlannings);

/**
 * @swagger
 * /planning/{id}:
 *   get:
 *     summary: Obtener planeación por ID
 *     tags: [Planeación Didáctica]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la planeación
 *     responses:
 *       200:
 *         description: Planeación encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DidacticPlanning'
 *       403:
 *         description: No autorizado para ver esta planeación
 *       404:
 *         description: Planeación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', getPlanningById);

/**
 * @swagger
 * /planning/history/{courseName}:
 *   get:
 *     summary: Obtener historial de planeaciones de una materia
 *     tags: [Planeación Didáctica]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de la materia
 *       - in: query
 *         name: cycle
 *         schema:
 *           type: string
 *         description: Ciclo actual (excluir del historial)
 *     responses:
 *       200:
 *         description: Historial de planeaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DidacticPlanning'
 *       500:
 *         description: Error del servidor
 */
router.get('/history/:courseName', getPlanningHistory);

/**
 * @swagger
 * /planning/{id}:
 *   put:
 *     summary: Actualizar planeación
 *     tags: [Planeación Didáctica]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la planeación
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               courseName:
 *                 type: string
 *                 description: Nombre de la materia
 *               partial:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 3
 *               cycle:
 *                 type: string
 *               content:
 *                 type: string
 *               objectives:
 *                 type: string
 *               methodology:
 *                 type: string
 *               evaluation:
 *                 type: string
 *               resources:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Planeación actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DidacticPlanning'
 *       403:
 *         description: No autorizado para actualizar esta planeación
 *       404:
 *         description: Planeación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', [
  upload.single('file'),
  body('courseName', 'Course name is required').optional().not().isEmpty(),
  body('partial', 'Partial must be 1-3').optional().isInt({ min: 1, max: 3 })
], updatePlanning);

/**
 * @swagger
 * /planning/{id}/review:
 *   put:
 *     summary: Revisar planeación (Solo Coordinador/Admin)
 *     tags: [Planeación Didáctica]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la planeación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlanningReview'
 *     responses:
 *       200:
 *         description: Planeación revisada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DidacticPlanning'
 *       403:
 *         description: No autorizado para revisar planeaciones
 *       404:
 *         description: Planeación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/:id/review', [
  authorize('coordinator', 'admin'),
  body('status', 'Status is required').isIn(['approved', 'adjustments_required']),
  body('feedback', 'Feedback is required').not().isEmpty()
], reviewPlanning);

/**
 * @swagger
 * /planning/{id}:
 *   delete:
 *     summary: Eliminar planeación
 *     tags: [Planeación Didáctica]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la planeación
 *     responses:
 *       200:
 *         description: Planeación eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: No autorizado para eliminar esta planeación
 *       404:
 *         description: Planeación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', deletePlanning);

module.exports = router;