module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT
    },
    credits: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'courses',
    timestamps: true
  });

  Course.associate = function(models) {
    Course.belongsTo(models.User, { foreignKey: 'coordinatorId', as: 'coordinator' });
    Course.hasMany(models.DidacticPlanning, { foreignKey: 'courseId', as: 'plannings' });
  };

  return Course;
};