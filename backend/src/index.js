require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./config/swagger');
const routes = require('./routes/index.routes');
const { sequelize } = require('./models');
const notFound = require('./middlewares/notfound.middleware');
const errorHandler = require('./middlewares/error.middleware');
const logger = require('./logs/logger');

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

app.get('/swagger-ui/index.html', (req, res) => res.redirect('/swagger-ui'));


// Rutas
app.use(routes);

// 404 + errores
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    logger.info('DB connected');
    app.listen(PORT, () => logger.info(`Server on http://localhost:${PORT} (docs: /docs)`));
  } catch (e) {
    logger.error('DB connection error', e);
    process.exit(1);
  }
})();