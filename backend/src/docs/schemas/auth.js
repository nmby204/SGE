/**
 * @swagger
 * components:
 *   schemas:
 *     UserAuth:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         password:
 *           type: string
 *           format: password
 *           description: Contraseña del usuario
 *       example:
 *         email: "profesor@escuela.com"
 *         password: "password123"
 * 
 *     UserRegister:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - role
 *       properties:
 *         name:
 *           type: string
 *           description: Nombre completo del usuario
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           description: Contraseña del usuario
 *         role:
 *           type: string
 *           enum: [coordinator, professor]
 *           description: Rol del usuario
 *       example:
 *         name: "Juan Pérez"
 *         email: "juan.perez@escuela.com"
 *         password: "password123"
 *         role: "professor"
 * 
 *     ChangePassword:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           format: password
 *           description: Contraseña actual
 *         newPassword:
 *           type: string
 *           format: password
 *           minLength: 6
 *           description: Nueva contraseña
 *       example:
 *         currentPassword: "oldpassword"
 *         newPassword: "newpassword123"
 * 
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT token
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             role:
 *               type: string
 *       example:
 *         token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         user:
 *           id: "123e4567-e89b-12d3-a456-426614174000"
 *           name: "Juan Pérez"
 *           email: "juan.perez@escuela.com"
 *           role: "professor"
 */