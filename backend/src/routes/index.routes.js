const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth');
const userRoutes = require('./users');
const planningRoutes = require('./planning');
const progressRoutes = require('./progress');
const evidenceRoutes = require('./evidence');
const reportRoutes = require('./reports');

// Usar rutas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/planning', planningRoutes);
router.use('/progress', progressRoutes);
router.use('/evidence', evidenceRoutes);
router.use('/reports', reportRoutes);

// Debug route
router.get('/debug', (req, res) => {
  res.json({
    message: 'Debug route working!',
    timestamp: new Date().toISOString()
  });
});

console.log('🔄 index.routes.js cargado correctamente');

module.exports = router;