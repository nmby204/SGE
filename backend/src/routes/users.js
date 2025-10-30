// routes/userRoutes.js - Versión corregida
const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middlewares/auth');
const {
  getUsers,
  getProfessors,
  getUserById,
  updateUser,
  deleteUser,
  createUser
} = require('../controllers/userController');

const router = express.Router();

// All routes are protected
router.use(auth);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios (Admin/Coordinador)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, coordinator, professor]
 *         description: Filtrar por rol
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo/inactivo
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/', authorize(['admin', 'coordinator']), getUsers);

/**
 * @swagger
 * /users/professors:
 *   get:
 *     summary: Obtener todos los profesores (Admin/Coordinador)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de profesores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/professors', authorize(['admin', 'coordinator']), getProfessors);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crear nuevo usuario (Solo Admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               role:
 *                 type: string
 *                 enum: [admin, coordinator, professor]
 *                 default: professor
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Datos inválidos o email ya existe
 *       403:
 *         description: No autorizado (solo admin)
 *       500:
 *         description: Error del servidor
 */
router.post('/', authorize(['admin']), [
  body('name', 'Name is required').notEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  body('role', 'Role must be admin, coordinator or professor').optional().isIn(['admin', 'coordinator', 'professor'])
], createUser);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtener usuario por ID (Admin/Coordinador)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', authorize(['admin', 'coordinator']), getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualizar usuario (Admin puede actualizar cualquier usuario, otros solo su propio perfil)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       403:
 *         description: No autorizado para actualizar este usuario
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', [
  body('email', 'Please include a valid email').optional().isEmail(),
  body('role', 'Role must be admin, coordinator or professor').optional().isIn(['admin', 'coordinator', 'professor'])
], updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Eliminar usuario (Solo Admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: No autorizado (solo admin)
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', authorize(['admin']), deleteUser);

module.exports = router;