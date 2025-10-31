/**
 * @swagger
 * tags:
 *   name: Geolocation
 *   description: API para gestión de geolocalización (estática)
 */

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
 *                       example: "Universidad Tecnológica del Norte de Guanajuato"
 *                     latitude:
 *                       type: number
 *                       format: float
 *                       example: 21.156
 *                     longitude:
 *                       type: number
 *                       format: float
 *                       example: -100.933
 *                     address:
 *                       type: string
 *                       example: "Educación Tecnológica 34, Fracc. Universidad, 37800 Dolores Hidalgo Cuna de la Independencia Nacional, Gto."
 *                 message:
 *                   type: string
 *                   example: "Ubicación de la universidad obtenida exitosamente"
 *       401:
 *         description: No autorizado - Token inválido o faltante
 *       500:
 *         description: Error del servidor
 */