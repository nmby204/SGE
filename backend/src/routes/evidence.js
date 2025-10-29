const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createEvidence,
  getEvidences,
  getEvidenceById,
  updateEvidence,
  reviewEvidence,
  deleteEvidence
} = require('../controllers/evidenceController');

const router = express.Router();

// All routes are protected
router.use(auth);

/**
 * @swagger
 * /evidence:
 *   post:
 *     summary: Crear nueva evidencia de capacitación (Solo Profesor)
 *     tags: [Evidencias de Capacitación]
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
 *               - institution
 *               - date
 *               - hours
 *               - file
 *             properties:
 *               courseName:
 *                 type: string
 *               institution:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               hours:
 *                 type: integer
 *                 minimum: 1
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Evidencia creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Evidence'
 *       400:
 *         description: Datos inválidos o archivo requerido
 *       403:
 *         description: No autorizado (solo profesores)
 *       500:
 *         description: Error del servidor
 */
router.post('/', [
  authorize('professor'),
  upload.single('file'),
  body('courseName', 'Course name is required').not().isEmpty(),
  body('institution', 'Institution is required').not().isEmpty(),
  body('date', 'Date is required').isISO8601(),
  body('hours', 'Hours is required and must be a positive number').isInt({ min: 1 })
], createEvidence);

/**
 * @swagger
 * /evidence:
 *   get:
 *     summary: Obtener todas las evidencias
 *     tags: [Evidencias de Capacitación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de evidencias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Evidence'
 *       500:
 *         description: Error del servidor
 */
router.get('/', getEvidences);

/**
 * @swagger
 * /evidence/{id}:
 *   get:
 *     summary: Obtener evidencia por ID
 *     tags: [Evidencias de Capacitación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la evidencia
 *     responses:
 *       200:
 *         description: Evidencia encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Evidence'
 *       403:
 *         description: No autorizado para ver esta evidencia
 *       404:
 *         description: Evidencia no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', getEvidenceById);

/**
 * @swagger
 * /evidence/{id}:
 *   put:
 *     summary: Actualizar evidencia
 *     tags: [Evidencias de Capacitación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la evidencia
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               courseName:
 *                 type: string
 *               institution:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               hours:
 *                 type: integer
 *                 minimum: 1
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Evidencia actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Evidence'
 *       403:
 *         description: No autorizado para actualizar esta evidencia
 *       404:
 *         description: Evidencia no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', [
  upload.single('file'),
  body('date', 'Date must be valid').optional().isISO8601(),
  body('hours', 'Hours must be positive').optional().isInt({ min: 1 })
], updateEvidence);

/**
 * @swagger
 * /evidence/{id}/review:
 *   put:
 *     summary: Revisar evidencia (Solo Coordinador/Admin)
 *     tags: [Evidencias de Capacitación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la evidencia
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EvidenceReview'
 *     responses:
 *       200:
 *         description: Evidencia revisada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Evidence'
 *       403:
 *         description: No autorizado para revisar evidencias
 *       404:
 *         description: Evidencia no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/:id/review', [
  authorize('coordinator', 'admin'),
  body('status', 'Status is required').isIn(['approved', 'rejected']),
  body('feedback', 'Feedback is required').not().isEmpty()
], reviewEvidence);

/**
 * @swagger
 * /evidence/{id}:
 *   delete:
 *     summary: Eliminar evidencia
 *     tags: [Evidencias de Capacitación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la evidencia
 *     responses:
 *       200:
 *         description: Evidencia eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: No autorizado para eliminar esta evidencia
 *       404:
 *         description: Evidencia no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', deleteEvidence);

module.exports = router;