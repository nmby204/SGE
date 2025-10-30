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
} catch (error) {
  // Swagger no configurado
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Sistema de Planeación Didáctica API is running!',
    timestamp: new Date().toISOString(),
    docs: '/api-docs'
  });
});

// Importar y usar rutas a través de index.routes
try {
  const routes = require('./src/routes/index.routes');
  app.use('/api', routes);
} catch (error) {
  // Cargar rutas individualmente si index.routes falla
  try {
    app.use('/api/auth', require('./src/routes/auth'));
    app.use('/api/users', require('./src/routes/users'));
    app.use('/api/planning', require('./src/routes/planning'));
    app.use('/api/progress', require('./src/routes/progress'));
    app.use('/api/evidence', require('./src/routes/evidence'));
    app.use('/api/reports', require('./src/routes/reports'));
    app.use('/api/calendar', require('./src/routes/calendar'));
    
    // Google Drive API
    try {
      app.use('/api/drive', require('./src/routes/drive'));
    } catch (driveError) {
      console.error('Error cargando Google Drive API:', driveError.message);
    }
  } catch (individualError) {
    console.error('Error cargando rutas individuales:', individualError.message);
  }
}

// Rutas de prueba para Calendar
app.get('/api/calendar/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Calendar API is working!',
    endpoints: {
      events: '/api/calendar/events',
      create: '/api/calendar/events/create',
      sync: '/api/calendar/sync'
    }
  });
});

app.get('/api/calendar/events', (req, res) => {
  // Datos de ejemplo para probar el calendario
  const sampleEvents = [
    {
      id: 1,
      title: 'Revisión de Planeaciones',
      start: new Date(new Date().setHours(10, 0, 0, 0)),
      end: new Date(new Date().setHours(11, 30, 0, 0)),
      type: 'review',
      description: 'Revisión semanal de planeaciones pendientes'
    },
    {
      id: 2,
      title: 'Capacitación Docente',
      start: new Date(new Date().setDate(new Date().getDate() + 1)),
      end: new Date(new Date().setDate(new Date().getDate() + 1)),
      type: 'training',
      description: 'Sesión de capacitación para nuevos profesores'
    },
    {
      id: 3,
      title: 'Entrega de Evidencias',
      start: new Date(new Date().setDate(new Date().getDate() + 3)),
      end: new Date(new Date().setDate(new Date().getDate() + 3)),
      type: 'deadline',
      description: 'Fecha límite para entrega de evidencias'
    },
    {
      id: 4,
      title: 'Reunión de Coordinadores',
      start: new Date(new Date().setDate(new Date().getDate() + 5)),
      end: new Date(new Date().setDate(new Date().getDate() + 5)),
      type: 'meeting',
      description: 'Reunión mensual del equipo de coordinación'
    }
  ];
  
  res.json({
    success: true,
    events: sampleEvents
  });
});

app.post('/api/calendar/events/create', (req, res) => {
  const { title, start, end, type, description } = req.body;
  
  const newEvent = {
    id: Date.now(),
    title,
    start: new Date(start),
    end: new Date(end),
    type,
    description,
    createdAt: new Date()
  };
  
  res.json({
    success: true,
    message: 'Evento creado exitosamente',
    event: newEvent
  });
});

app.get('/api/calendar/sync', (req, res) => {
  res.json({
    success: true,
    message: 'Sincronización con Google Calendar disponible',
    configured: !!process.env.GOOGLE_CALENDAR_CLIENT_ID,
    endpoints: {
      auth: '/api/calendar/auth',
      callback: '/api/calendar/oauth2callback',
      sync: '/api/calendar/sync'
    }
  });
});

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
      calendar: '/api/calendar',
      drive: '/api/drive'
    },
    apis: {
      googleDrive: '/api/drive/upload',
      googleCalendar: '/api/calendar/events'
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
      calendar: '/api/calendar/events',
      drive: '/api/drive/upload'
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
  console.log(`📚 Swagger Docs: http://localhost:${PORT}/api-docs`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
  console.log(`📅 Calendar API: http://localhost:${PORT}/api/calendar/events`);
  console.log(`🌐 URL principal: http://localhost:${PORT}/`);
});

module.exports = app;