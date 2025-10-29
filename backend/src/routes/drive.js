const express = require('express');
const multer = require('multer');
const { driveController } = require('../controllers/driveController');

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

console.log('🔄 Cargando rutas de Google Drive...');

// ✅ ENDPOINT PRINCIPAL - CON LOGGING
router.post('/upload', upload.single('file'), (req, res, next) => {
  console.log('🎯 ENDPOINT /api/drive/upload ALCANZADO!');
  console.log('📦 File recibido:', req.file ? 'SÍ' : 'NO');
  next();
}, driveController.uploadFile);

// ✅ ENDPOINT DE PRUEBA
router.get('/test', (req, res) => {
  console.log('✅ Endpoint /api/drive/test alcanzado');
  res.json({ 
    message: 'Google Drive API está funcionando',
    timestamp: new Date().toISOString(),
    status: 'active'
  });
});

// ✅ ENDPOINTS ADICIONALES
router.delete('/files/:fileId', driveController.deleteFile);
router.get('/files/:fileId', driveController.getFile);

console.log('✅ Rutas de Google Drive cargadas:');
console.log('   POST /api/drive/upload');
console.log('   GET  /api/drive/test');
console.log('   GET  /api/drive/files/:fileId');
console.log('   DELETE /api/drive/files/:fileId');

module.exports = router;