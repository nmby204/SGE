const express = require('express');
const router = express.Router();
const { getUniversityLocation } = require('../controllers/geoController');
const { auth } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(auth);

/**
 * @swagger
 * /geo/university:
 *   get:
 *     summary: Obtener la ubicación estática de la universidad
 *     tags: [Geolocation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ubicación de la universidad obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 university:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Universidad Nacional de México"
 *                     latitude:
 *                       type: number
 *                       format: float
 *                       example: 19.432608
 *                     longitude:
 *                       type: number
 *                       format: float
 *                       example: -99.133209
 *                     address:
 *                       type: string
 *                       example: "Av. Universidad 3000, Ciudad Universitaria"
 *                 message:
 *                   type: string
 *                   example: "Ubicación de la universidad obtenida exitosamente"
 *       401:
 *         description: No autorizado - Token inválido o faltante
 *       500:
 *         description: Error del servidor
 */
router.get('/university', getUniversityLocation);

module.exports = router;