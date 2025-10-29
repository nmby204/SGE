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

// Importar y usar rutas a través de index.routes
try {
  console.log('🔄 Intentando cargar index.routes...');
  const routes = require('./src/routes/index.routes');
  console.log('✅ index.routes cargado exitosamente');
  
  app.use('/api', routes);
  console.log('✅ Rutas montadas en /api');
  
} catch (error) {
  console.error('❌ Error cargando index.routes:', error);
  console.error('📋 Detalle completo:', error.stack);
  
  // ✅ NUEVO: Cargar rutas incluyendo Google Drive
  console.log('🔄 Intentando cargar rutas individualmente...');
  try {
    app.use('/api/auth', require('./src/routes/auth'));
    app.use('/api/users', require('./src/routes/users'));
    app.use('/api/planning', require('./src/routes/planning'));
    app.use('/api/progress', require('./src/routes/progress'));
    app.use('/api/evidence', require('./src/routes/evidence'));
    app.use('/api/reports', require('./src/routes/reports'));
    
    // ✅ NUEVO: Ruta para Google Drive API
    try {
      app.use('/api/drive', require('./src/routes/drive'));
      console.log('✅ Google Drive API montada en /api/drive');
    } catch (driveError) {
      console.log('⚠️  Google Drive API no configurada aún:', driveError.message);
    }
    
    console.log('✅ Rutas individuales cargadas');
  } catch (individualError) {
    console.error('❌ Error cargando rutas individuales:', individualError);
  }
}

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
      drive: '/api/drive' // ✅ NUEVO
    },
    apis: {
      googleDrive: '/api/drive/upload', // ✅ NUEVO
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
  res.status(404).json({ 
    message: 'Endpoint no encontrado',
    availableEndpoints: {
      root: '/',
      docs: '/api-docs',
      health: '/api/health',
      drive: '/api/drive/upload' // ✅ NUEVO
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
  console.log(`📚 Swagger Docs: http://localhost:${PORT}/api-docs`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 URL principal: http://localhost:${PORT}/`);
  console.log(`☁️  Google Drive API: http://localhost:${PORT}/api/drive/upload`); // ✅ NUEVO
  
  // ✅ NUEVO: Verificar configuración de APIs de Google
  console.log('\n🔧 Configuración de APIs de Google:');
  console.log(`   📁 Google Drive: ${process.env.GOOGLE_DRIVE_CLIENT_ID ? '✅ Configurado' : '❌ No configurado'}`);
  console.log(`   🗺️  Google Maps: ${process.env.GOOGLE_MAPS_API_KEY ? '✅ Configurado' : '❌ No configurado'}`);
  console.log(`   📅 Google Calendar: ${process.env.GOOGLE_CALENDAR_CLIENT_ID ? '✅ Configurado' : '❌ No configurado'}`);
});