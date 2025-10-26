const router = require('express').Router();
const ctrl = require('../controllers/user.controller');
const auth = require('../middlewares/auth.middleware');
const { createUser, updateUser } = require('../validators/user.validator');

router.use(auth(true));

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: List users
 *     responses: { 200: { description: OK } }
 */
router.get('/', ctrl.list);

/**
 * @openapi
 * /api/users/{id_user}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by id
 *     parameters:
 *       - in: path
 *         name: id_user
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not Found }
 */
router.get('/:id_user', ctrl.get);

/**
 * @openapi
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Create user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [str_name, str_email, str_password, int_rol]
 *             properties:
 *               str_name: { type: string, maxLength: 100 }
 *               str_email: { type: string, format: email }
 *               str_password: { type: string, minLength: 6 }
 *               int_rol: { type: integer, enum: [1,2] }
 *     responses:
 *       201: { description: Created }
 */
router.post('/', createUser, ctrl.create);

/**
 * @openapi
 * /api/users/{id_user}:
 *   put:
 *     tags: [Users]
 *     summary: Update user
 *     parameters:
 *       - in: path
 *         name: id_user
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               str_name: { type: string }
 *               str_email: { type: string, format: email }
 *               str_password: { type: string, minLength: 6 }
 *               int_rol: { type: integer, enum: [1,2] }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not Found }
 */
router.put('/:id_user', updateUser, ctrl.update);

/**
 * @openapi
 * /api/users/{id_user}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user
 *     parameters:
 *       - in: path
 *         name: id_user
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: No Content }
 */
router.delete('/:id_user', ctrl.remove);

module.exports = router;