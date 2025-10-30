const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const DidacticPlanning = sequelize.define('DidacticPlanning', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    courseName: {
      type: DataTypes.STRING,
      allowNull: false
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
    // ✅ NUEVOS CAMPOS PARA GOOGLE DRIVE
    driveFileId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    storageType: {
      type: DataTypes.ENUM('local', 'google_drive'),
      defaultValue: 'local'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    // ✅ NUEVOS CAMPOS PARA CALENDARIO
    submissionDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'submission_date'
    },
    reviewDeadline: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'review_deadline'
    },
    nextReviewDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'next_review_date'
    }
  }, {
    tableName: 'didactic_plannings',
    timestamps: true,
    underscored: true
  });

  DidacticPlanning.associate = function(models) {
    DidacticPlanning.belongsTo(models.User, { foreignKey: 'professorId', as: 'professor' });
    DidacticPlanning.hasMany(models.PartialProgress, { foreignKey: 'planningId', as: 'progress' });
  };

  return DidacticPlanning;
};