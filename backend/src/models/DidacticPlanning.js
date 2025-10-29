module.exports = (sequelize, DataTypes) => {
  const DidacticPlanning = sequelize.define('DidacticPlanning', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    partial: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 3
      }
    },
    cycle: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    objectives: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    methodology: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    evaluation: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    resources: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'adjustments_required'),
      defaultValue: 'pending'
    },
    feedback: {
      type: DataTypes.TEXT
    },
    fileUrl: {
      type: DataTypes.STRING
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'didactic_plannings',
    timestamps: true,
    underscored: true
  });

  DidacticPlanning.associate = function(models) {
    DidacticPlanning.belongsTo(models.User, { foreignKey: 'professorId', as: 'professor' });
    DidacticPlanning.belongsTo(models.Course, { foreignKey: 'courseId', as: 'course' });
    DidacticPlanning.hasMany(models.PartialProgress, { foreignKey: 'planningId', as: 'progress' });
  };

  return DidacticPlanning;
};