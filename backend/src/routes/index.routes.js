const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth');
const userRoutes = require('./users');
const planningRoutes = require('./planning');
const progressRoutes = require('./progress');
const evidenceRoutes = require('./evidence');
const reportRoutes = require('./reports');
const driveRoutes = require('./drive'); // ✅ NUEVO: Google Drive
const calendarRoutes = require('./calendar'); // ← NUEVA RUTA
const geoRoutes = require('./geoRoutes'); // ← NUEVA RUTA: Geolocalización

// Usar rutas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/planning', planningRoutes);
router.use('/progress', progressRoutes);
router.use('/evidence', evidenceRoutes);
router.use('/reports', reportRoutes);
router.use('/drive', driveRoutes); // ✅ NUEVO: Google Drive
router.use('/calendar', calendarRoutes); // ← NUEVA RUTA
router.use('/geo', geoRoutes); // ← NUEVA RUTA: Geolocalización

// Debug route
router.get('/debug', (req, res) => {
  res.json({
    message: 'Debug route working!',
    timestamp: new Date().toISOString(),
    availableRoutes: [
      '/api/auth',
      '/api/users', 
      '/api/planning',
      '/api/progress',
      '/api/evidence',
      '/api/reports',
      '/api/drive', // ✅ NUEVO
      '/api/calendar', // ← NUEVA RUTA
      '/api/geo' // ← NUEVA RUTA: Geolocalización
    ]
  });
});

console.log('🔄 index.routes.js cargado correctamente');
console.log('✅ Google Drive routes incluidas');
console.log('📍 Geolocation routes incluidas'); // ← NUEVO

module.exports = router;