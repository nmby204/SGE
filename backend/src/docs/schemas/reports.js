/**
 * @swagger
 * components:
 *   schemas:
 *     PlanningCompliance:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *         approved:
 *           type: integer
 *         pending:
 *           type: integer
 *         adjustments_required:
 *           type: integer
 *         complianceRate:
 *           type: number
 *           format: float
 *       example:
 *         total: 100
 *         approved: 75
 *         pending: 15
 *         adjustments_required: 10
 *         complianceRate: 75.0
 * 
 *     TrainingReport:
 *       type: object
 *       properties:
 *         totalCourses:
 *           type: integer
 *         totalHours:
 *           type: integer
 *         byProfessor:
 *           type: object
 *           additionalProperties:
 *             type: object
 *             properties:
 *               courses:
 *                 type: integer
 *               hours:
 *                 type: integer
 *         byInstitution:
 *           type: object
 *           additionalProperties:
 *             type: object
 *             properties:
 *               courses:
 *                 type: integer
 *               hours:
 *                 type: integer
 *       example:
 *         totalCourses: 45
 *         totalHours: 680
 *         byProfessor:
 *           "Juan Pérez":
 *             courses: 3
 *             hours: 40
 *           "María García":
 *             courses: 2
 *             hours: 30
 *         byInstitution:
 *           "Universidad Nacional":
 *             courses: 20
 *             hours: 300
 *           "Instituto Tecnológico":
 *             courses: 15
 *             hours: 220
 */