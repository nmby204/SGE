const { DataTypes } = require('sequelize');

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
      field: 'progress_percentage',
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
    },
    planningId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'planning_id',
      references: {
        model: 'didactic_plannings',
        key: 'id'
      }
    },
    // ✅ NUEVOS CAMPOS PARA CALENDARIO
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'due_date'
    },
    nextCheckpoint: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'next_checkpoint'
    }
  }, {
    tableName: 'partial_progress',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  PartialProgress.associate = function(models) {
    PartialProgress.belongsTo(models.DidacticPlanning, { 
      foreignKey: 'planningId', 
      as: 'planning' 
    });
  };

  return PartialProgress;
};