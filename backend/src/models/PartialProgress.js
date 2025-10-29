module.exports = (sequelize, DataTypes) => {
  const PartialProgress = sequelize.define('PartialProgress', {
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
    progressPercentage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 100
      }
    },
    status: {
      type: DataTypes.ENUM('fulfilled', 'partial', 'unfulfilled'),
      allowNull: false
    },
    achievements: {
      type: DataTypes.TEXT
    },
    challenges: {
      type: DataTypes.TEXT
    },
    adjustments: {
      type: DataTypes.TEXT
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'partial_progress',
    timestamps: true,
    underscored: true
  });

  PartialProgress.associate = function(models) {
    PartialProgress.belongsTo(models.DidacticPlanning, { foreignKey: 'planningId', as: 'planning' });
  };

  return PartialProgress;
};