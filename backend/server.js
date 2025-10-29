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
    docs: '/api-docs'
  });
});

// Importar y usar rutas
try {
  app.use('/api/auth', require('./src/routes/auth'));
  app.use('/api/users', require('./src/routes/users'));
  app.use('/api/planning', require('./src/routes/planning'));
  app.use('/api/progress', require('./src/routes/progress'));
  app.use('/api/evidence', require('./src/routes/evidence'));
  app.use('/api/reports', require('./src/routes/reports'));
  console.log('✅ Rutas cargadas correctamente');
} catch (error) {
  console.error('❌ Error cargando rutas:', error);
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
      planning: '/api/planning'
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
      health: '/api/health'
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
  console.log(`📚 Swagger Docs: http://localhost:${PORT}/api-docs`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 URL principal: http://localhost:${PORT}/`);
});

module.exports = app;