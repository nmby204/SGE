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
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'courses',
    timestamps: true,
    underscored: true
  });

  Course.associate = function(models) {
    Course.belongsTo(models.User, { foreignKey: 'coordinatorId', as: 'coordinator' });
    // ❌ ELIMINAR o COMENTAR esta línea:
    // Course.hasMany(models.DidacticPlanning, { foreignKey: 'courseId', as: 'plannings' });
  };

  return Course;
};