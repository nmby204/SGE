const { Sequelize } = require('sequelize');
const dbCfg = require('../config/db.js')[process.env.NODE_ENV || 'development'];
const fs = require('fs');
const path = require('path');

const sequelize = dbCfg.use_env_variable
  ? new Sequelize(process.env[dbCfg.use_env_variable], dbCfg)
  : new Sequelize(dbCfg.database, dbCfg.username, dbCfg.password, dbCfg);

const db = { sequelize, Sequelize };

// Carga automática de modelos en src/models
fs.readdirSync(__dirname)
  .filter(f => f.endsWith('.model.js'))
  .forEach(f => {
    const model = require(path.join(__dirname, f))(sequelize);
    db[model.name] = model;
  });

// Associations (si las hubiera)
// Object.values(db).filter(m => m.associate).forEach(m => m.associate(db));

module.exports = db;