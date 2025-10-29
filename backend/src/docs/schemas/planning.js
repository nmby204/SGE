/**
 * @swagger
 * components:
 *   schemas:
 *     DidacticPlanning:
 *       type: object
 *       required:
 *         - courseId
 *         - partial
 *         - cycle
 *         - content
 *         - objectives
 *         - methodology
 *         - evaluation
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         professorId:
 *           type: string
 *           format: uuid
 *         courseId:
 *           type: string
 *           format: uuid
 *         partial:
 *           type: integer
 *           minimum: 1
 *           maximum: 3
 *           description: Número del parcial (1-3)
 *         cycle:
 *           type: string
 *           description: Ciclo escolar (ej. 2023-2024)
 *         content:
 *           type: string
 *           description: Contenido de la planeación
 *         objectives:
 *           type: string
 *           description: Objetivos de aprendizaje
 *         methodology:
 *           type: string
 *           description: Metodología de enseñanza
 *         evaluation:
 *           type: string
 *           description: Criterios de evaluación
 *         resources:
 *           type: string
 *           description: Recursos didácticos
 *         status:
 *           type: string
 *           enum: [pending, approved, adjustments_required]
 *           default: pending
 *         feedback:
 *           type: string
 *           description: Comentarios del coordinador
 *         fileUrl:
 *           type: string
 *           description: URL del archivo adjunto
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         professorId: "123e4567-e89b-12d3-a456-426614174001"
 *         courseId: "123e4567-e89b-12d3-a456-426614174002"
 *         partial: 1
 *         cycle: "2023-2024"
 *         content: "Contenido del primer parcial..."
 *         objectives: "Objetivos de aprendizaje..."
 *         methodology: "Metodología activa..."
 *         evaluation: "Evaluación continua..."
 *         resources: "Libros, videos, software..."
 *         status: "pending"
 *         feedback: null
 *         fileUrl: "/uploads/planeacion-123.pdf"
 * 
 *     PlanningReview:
 *       type: object
 *       required:
 *         - status
 *         - feedback
 *       properties:
 *         status:
 *           type: string
 *           enum: [approved, adjustments_required]
 *         feedback:
 *           type: string
 *       example:
 *         status: "approved"
 *         feedback: "Excelente planeación, cumple con todos los requisitos"
 */