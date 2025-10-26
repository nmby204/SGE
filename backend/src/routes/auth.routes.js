const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { loginValidator } = require('../validators/auth.validator');

  /**
   * @openapi
   * /api/auth/login:
   *   post:
   *     tags: [Auth]
   *     summary: Login con email y contraseña
   *     security: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [str_email, str_password]
   *             properties:
   *               str_email: { type: string, format: email }
   *               str_password: { type: string, minLength: 6 }
   *           example:
   *             str_email: "yo@ejemplo.com"
   *             str_password: "sisoyyo123"
   *     responses:
   *       200:
   *         description: Token emitido
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:       { type: string }
   *                 token_type:  { type: string, example: Bearer }
   *                 expires_in:  { type: string, example: 2h }
   *                 user:
   *                   type: object
   *       401: { description: Credenciales inválidas }
   */
router.post('/login', loginValidator, ctrl.login);

module.exports = router;
