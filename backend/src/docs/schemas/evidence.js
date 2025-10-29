/**
 * @swagger
 * components:
 *   schemas:
 *     Evidence:
 *       type: object
 *       required:
 *         - courseName
 *         - institution
 *         - date
 *         - hours
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         professorId:
 *           type: string
 *           format: uuid
 *         courseName:
 *           type: string
 *           description: Nombre del curso o taller
 *         institution:
 *           type: string
 *           description: Institución que emitió el curso
 *         date:
 *           type: string
 *           format: date
 *           description: Fecha del curso
 *         hours:
 *           type: integer
 *           minimum: 1
 *           description: Horas acreditadas
 *         fileUrl:
 *           type: string
 *           description: URL del archivo de constancia
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           default: pending
 *         feedback:
 *           type: string
 *           description: Comentarios del coordinador
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         professorId: "123e4567-e89b-12d3-a456-426614174001"
 *         courseName: "Taller de Educación Inclusiva"
 *         institution: "Universidad Nacional"
 *         date: "2023-09-15"
 *         hours: 20
 *         fileUrl: "/uploads/constancia-123.pdf"
 *         status: "pending"
 *         feedback: null
 * 
 *     EvidenceReview:
 *       type: object
 *       required:
 *         - status
 *         - feedback
 *       properties:
 *         status:
 *           type: string
 *           enum: [approved, rejected]
 *         feedback:
 *           type: string
 *       example:
 *         status: "approved"
 *         feedback: "Constancia válida y completa"
 */