const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middlewares/auth');
const {
  login,
  register,
  getMe,
  changePassword
} = require('../controllers/authController');

const router = express.Router();

router.post('/login', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
], login);

// TEMPORAL: Permite registro sin autenticación para crear el admin inic
router.post('/register', [
  // auth,           // ← COMENTADO temporalmente
  // authorize('admin'), // ← COMENTADO temporalmente
  body('name', 'Name is required').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  body('role', 'Role is required').isIn(['admin', 'coordinator', 'professor']) // ← AGREGADO 'admin'
], register);

router.get('/me', auth, getMe);

router.put('/change-password', [
  auth,
  body('currentPassword', 'Current password is required').exists(),
  body('newPassword', 'New password must be 6 or more characters').isLength({ min: 6 })
], changePassword);

module.exports = router;