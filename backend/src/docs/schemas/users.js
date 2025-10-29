/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único del usuario
 *         name:
 *           type: string
 *           description: Nombre completo del usuario
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         role:
 *           type: string
 *           enum: [admin, coordinator, professor]
 *           description: Rol del usuario
 *         isActive:
 *           type: boolean
 *           description: Estado del usuario
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         name: "Juan Pérez"
 *         email: "juan.perez@escuela.com"
 *         role: "professor"
 *         isActive: true
 *         createdAt: "2023-10-01T12:00:00.000Z"
 *         updatedAt: "2023-10-01T12:00:00.000Z"
 * 
 *     UserUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Nombre completo del usuario
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         role:
 *           type: string
 *           enum: [admin, coordinator, professor]
 *           description: Rol del usuario
 *         isActive:
 *           type: boolean
 *           description: Estado del usuario
 *       example:
 *         name: "Juan Pérez Actualizado"
 *         email: "juan.actualizado@escuela.com"
 *         role: "professor"
 *         isActive: true
 */