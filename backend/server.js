const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation (si existe)
try {
  const { swaggerUi, specs } = require('./src/docs/swagger');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customSiteTitle: 'Sistema de Planeación Didáctica - API Docs'
  }));
  console.log('✅ Swagger configurado en /api-docs');
} catch (error) {
  console.log('⚠️  Swagger no configurado aún');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Sistema de Planeación Didáctica API is running!',
    timestamp: new Date().toISOString(),
    docs: '/api-docs',
    features: {
      googleDrive: process.env.GOOGLE_DRIVE_CLIENT_ID ? '✅ Configurado' : '❌ No configurado',
      googleMaps: process.env.GOOGLE_MAPS_API_KEY ? '✅ Configurado' : '❌ No configurado',
      googleCalendar: process.env.GOOGLE_CALENDAR_CLIENT_ID ? '✅ Configurado' : '❌ No configurado'
    }
  });
});

// DEBUG: Verificar estructura de archivos
console.log('🔍 Verificando estructura de rutas...');
const fs = require('fs');
const routesPath = './src/routes';

try {
  const files = fs.readdirSync(routesPath);
  console.log('📁 Archivos en routes:', files);
} catch (error) {
  console.error('❌ No se puede leer la carpeta routes:', error.message);
}

// ✅ DIAGNÓSTICO DETALLADO: Verificar archivo drive.js específicamente
console.log('\n🔍 DIAGNÓSTICO GOOGLE DRIVE:');
try {
  const drivePath = './src/routes/drive.js';
  const driveExists = fs.existsSync(drivePath);
  console.log(`   📄 drive.js existe: ${driveExists ? '✅ SÍ' : '❌ NO'}`);
  
  if (driveExists) {
    const driveStats = fs.statSync(drivePath);
    console.log(`   📏 Tamaño: ${driveStats.size} bytes`);
    console.log(`   📅 Modificado: ${driveStats.mtime}`);
    
    // Leer primeras líneas para verificar contenido
    const driveContent = fs.readFileSync(drivePath, 'utf8');
    console.log(`   📝 Primeras 2 líneas:`);
    driveContent.split('\n').slice(0, 2).forEach((line, index) => {
      console.log(`      ${index + 1}: ${line.trim()}`);
    });
  }
} catch (driveCheckError) {
  console.error('   ❌ Error verificando drive.js:', driveCheckError.message);
}

// Importar y usar rutas a través de index.routes
try {
  console.log('\n🔄 Intentando cargar index.routes...');
  const routes = require('./src/routes/index.routes');
  console.log('✅ index.routes cargado exitosamente');
  
  app.use('/api', routes);
  console.log('✅ Rutas montadas en /api');
  
} catch (error) {
  console.error('❌ Error cargando index.routes:', error);
  console.error('📋 Detalle completo:', error.stack);
  
  // ✅ DIAGNÓSTICO DETALLADO: Cargar rutas individualmente con logging extenso
  console.log('\n🔄 Intentando cargar rutas individualmente...');
  try {
    console.log('   📁 Cargando /api/auth...');
    app.use('/api/auth', require('./src/routes/auth'));
    console.log('   ✅ /api/auth cargado');
    
    console.log('   📁 Cargando /api/users...');
    app.use('/api/users', require('./src/routes/users'));
    console.log('   ✅ /api/users cargado');
    
    console.log('   📁 Cargando /api/planning...');
    app.use('/api/planning', require('./src/routes/planning'));
    console.log('   ✅ /api/planning cargado');
    
    console.log('   📁 Cargando /api/progress...');
    app.use('/api/progress', require('./src/routes/progress'));
    console.log('   ✅ /api/progress cargado');
    
    console.log('   📁 Cargando /api/evidence...');
    app.use('/api/evidence', require('./src/routes/evidence'));
    console.log('   ✅ /api/evidence cargado');
    
    console.log('   📁 Cargando /api/reports...');
    app.use('/api/reports', require('./src/routes/reports'));
    console.log('   ✅ /api/reports cargado');
    
    // ✅ DIAGNÓSTICO DETALLADO: Google Drive API
    console.log('\n   🔍 DIAGNÓSTICO DETALLADO GOOGLE DRIVE:');
    try {
      console.log('      📥 Intentando cargar módulo drive...');
      const driveModule = require('./src/routes/drive');
      console.log('      ✅ Módulo drive cargado exitosamente');
      
      console.log('      🔗 Montando en /api/drive...');
      app.use('/api/drive', driveModule);
      console.log('      ✅ Google Drive API montada en /api/drive');
      
    } catch (driveError) {
      console.error('      ❌ ERROR CARGANDO GOOGLE DRIVE:');
      console.error('         📛 Mensaje:', driveError.message);
      console.error('         📍 Ruta:', './src/routes/drive');
      if (driveError.code === 'MODULE_NOT_FOUND') {
        console.error('         🔍 Dependencias faltantes:', driveError.requireStack);
      }
      console.error('         📋 Stack completo:', driveError.stack);
    }
    
    console.log('✅ Rutas individuales cargadas');
  } catch (individualError) {
    console.error('❌ Error cargando rutas individuales:', individualError);
  }
}

// ✅ DIAGNÓSTICO: Verificar rutas montadas
console.log('\n📋 VERIFICANDO RUTAS MONTADAS:');
setTimeout(() => {
  console.log('   🔍 Listando rutas disponibles...');
  const routes = [];
  
  function listRoutes(stack, prefix = '') {
    stack.forEach((middleware) => {
      if (middleware.route) {
        // Rutas directas
        const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
        routes.push(`${methods} ${prefix}${middleware.route.path}`);
      } else if (middleware.name === 'router') {
        // Router montado
        const routerPath = prefix;
        if (middleware.handle && middleware.handle.stack) {
          listRoutes(middleware.handle.stack, routerPath);
        }
      }
    });
  }
  
  listRoutes(app._router.stack);
  
  console.log(`   📊 Total de rutas: ${routes.length}`);
  routes.forEach(route => {
    console.log(`      ${route}`);
  });
  
  // Verificar específicamente rutas de drive
  const driveRoutes = routes.filter(route => route.includes('/drive'));
  console.log(`\n   🎯 Rutas de Google Drive encontradas: ${driveRoutes.length}`);
  driveRoutes.forEach(route => {
    console.log(`      ✅ ${route}`);
  });
  
  if (driveRoutes.length === 0) {
    console.log('   ❌ NO se encontraron rutas de Google Drive');
  }
}, 1000);

// ✅ SOLUCIÓN NUCLEAR: Rutas directas para diagnóstico
console.log('\n🔧 CONFIGURANDO RUTAS DIRECTAS DE DIAGNÓSTICO...');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Ruta directa de test
app.get('/api/drive-direct-test', (req, res) => {
  console.log('🎯 RUTA DIRECTA DRIVE TEST ALCANZADA');
  res.json({ 
    success: true,
    message: 'Direct Drive route is working!',
    timestamp: new Date().toISOString(),
    diagnostic: 'Esta ruta funciona, el problema está en las rutas regulares'
  });
});

// Ruta directa de upload
app.post('/api/drive-direct-upload', upload.single('file'), (req, res) => {
  console.log('🎯 RUTA DIRECTA DRIVE UPLOAD ALCANZADA');
  console.log('   📦 File recibido:', req.file ? req.file.originalname : 'NONE');
  
  res.json({
    success: true,
    message: 'Direct upload route works!',
    file: req.file ? {
      name: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    } : null,
    diagnostic: 'Si esta ruta funciona, el problema está en el controlador de drive'
  });
});

console.log('✅ Rutas directas de diagnóstico configuradas:');
console.log('   GET  /api/drive-direct-test');
console.log('   POST /api/drive-direct-upload');

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido al Sistema de Planeación Didáctica',
    version: '1.0.0',
    endpoints: {
      docs: '/api-docs',
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      planning: '/api/planning',
      drive: '/api/drive',
      driveDirect: '/api/drive-direct-test' // ✅ NUEVO
    },
    apis: {
      googleDrive: '/api/drive/upload',
      googleDriveDirect: '/api/drive-direct-upload', // ✅ NUEVO
      googleMaps: 'Próximamente',
      googleCalendar: 'Próximamente'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ 404 - Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    message: 'Endpoint no encontrado',
    availableEndpoints: {
      root: '/',
      docs: '/api-docs',
      health: '/api/health',
      drive: '/api/drive/upload',
      driveDirectTest: '/api/drive-direct-test', // ✅ NUEVO
      driveDirectUpload: '/api/drive-direct-upload' // ✅ NUEVO
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor ejecutándose en el puerto ${PORT}`);
  console.log(`📚 Swagger Docs: http://localhost:${PORT}/api-docs`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 URL principal: http://localhost:${PORT}/`);
  console.log(`☁️  Google Drive API: http://localhost:${PORT}/api/drive/upload`);
  console.log(`🔧 Google Drive Direct: http://localhost:${PORT}/api/drive-direct-test`);
  
  console.log('\n🔧 Configuración de APIs de Google:');
  console.log(`   📁 Google Drive: ${process.env.GOOGLE_DRIVE_CLIENT_ID ? '✅ Configurado' : '❌ No configurado'}`);
  console.log(`   🗺️  Google Maps: ${process.env.GOOGLE_MAPS_API_KEY ? '✅ Configurado' : '❌ No configurado'}`);
  console.log(`   📅 Google Calendar: ${process.env.GOOGLE_CALENDAR_CLIENT_ID ? '✅ Configurado' : '❌ No configurado'}`);
});