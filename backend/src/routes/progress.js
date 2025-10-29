const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const {
  createProgress,
  getProgressByPlanning,
  getProgressStats,
  updateProgress
} = require('../controllers/progressController');

const router = express.Router();

// All routes are protected
router.use(auth);

/**
 * @swagger
 * /progress:
 *   post:
 *     summary: Crear registro de avance parcial
 *     tags: [Avances Parciales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planningId
 *               - partial
 *               - progressPercentage
 *               - status
 *             properties:
 *               planningId:
 *                 type: string
 *                 format: uuid
 *               partial:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 3
 *               progressPercentage:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *               status:
 *                 type: string
 *                 enum: [fulfilled, partial, unfulfilled]
 *               achievements:
 *                 type: string
 *               challenges:
 *                 type: string
 *               adjustments:
 *                 type: string
 *     responses:
 *       201:
 *         description: Avance creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PartialProgress'
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No autorizado para agregar avance a esta planeación
 *       404:
 *         description: Planeación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.post('/', [
  body('planningId', 'Planning ID is required').not().isEmpty(),
  body('partial', 'Partial is required and must be 1-3').isInt({ min: 1, max: 3 }),
  body('progressPercentage', 'Progress percentage is required and must be 0-100').isInt({ min: 0, max: 100 }),
  body('status', 'Status is required').isIn(['fulfilled', 'partial', 'unfulfilled'])
], createProgress);

/**
 * @swagger
 * /progress/planning/{planningId}:
 *   get:
 *     summary: Obtener avances por planeación
 *     tags: [Avances Parciales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planningId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la planeación
 *     responses:
 *       200:
 *         description: Lista de avances
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PartialProgress'
 *       500:
 *         description: Error del servidor
 */
router.get('/planning/:planningId', getProgressByPlanning);

/**
 * @swagger
 * /progress/stats:
 *   get:
 *     summary: Obtener estadísticas de avances
 *     tags: [Avances Parciales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: partial
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 3
 *         description: Filtrar por parcial
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de materia
 *     responses:
 *       200:
 *         description: Estadísticas de avances
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProgressStats'
 *       500:
 *         description: Error del servidor
 */
router.get('/stats', getProgressStats);

/**
 * @swagger
 * /progress/{id}:
 *   put:
 *     summary: Actualizar registro de avance
 *     tags: [Avances Parciales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del avance
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               progressPercentage:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *               status:
 *                 type: string
 *                 enum: [fulfilled, partial, unfulfilled]
 *               achievements:
 *                 type: string
 *               challenges:
 *                 type: string
 *               adjustments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Avance actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PartialProgress'
 *       403:
 *         description: No autorizado para actualizar este avance
 *       404:
 *         description: Avance no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', [
  body('progressPercentage', 'Progress percentage must be 0-100').optional().isInt({ min: 0, max: 100 }),
  body('status', 'Status must be fulfilled, partial or unfulfilled').optional().isIn(['fulfilled', 'partial', 'unfulfilled'])
], updateProgress);

module.exports = router;