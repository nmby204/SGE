const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./User')(sequelize, Sequelize);
db.Course = require('./Course')(sequelize, Sequelize);
db.DidacticPlanning = require('./DidacticPlanning')(sequelize, Sequelize);
db.PartialProgress = require('./PartialProgress')(sequelize, Sequelize);
db.Evidence = require('./Evidence')(sequelize, Sequelize);

// Define associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;