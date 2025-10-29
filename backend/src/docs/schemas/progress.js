/**
 * @swagger
 * components:
 *   schemas:
 *     PartialProgress:
 *       type: object
 *       required:
 *         - planningId
 *         - partial
 *         - progressPercentage
 *         - status
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         planningId:
 *           type: string
 *           format: uuid
 *         partial:
 *           type: integer
 *           minimum: 1
 *           maximum: 3
 *         progressPercentage:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *         status:
 *           type: string
 *           enum: [fulfilled, partial, unfulfilled]
 *         achievements:
 *           type: string
 *         challenges:
 *           type: string
 *         adjustments:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         planningId: "123e4567-e89b-12d3-a456-426614174001"
 *         partial: 1
 *         progressPercentage: 85
 *         status: "partial"
 *         achievements: "Se completaron los temas 1-4"
 *         challenges: "Falta tiempo para prácticas"
 *         adjustments: "Reorganizar calendario"
 * 
 *     ProgressStats:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *         fulfilled:
 *           type: integer
 *         partial:
 *           type: integer
 *         unfulfilled:
 *           type: integer
 *         averageProgress:
 *           type: number
 *           format: float
 *       example:
 *         total: 50
 *         fulfilled: 30
 *         partial: 15
 *         unfulfilled: 5
 *         averageProgress: 78.5
 */