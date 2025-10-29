module.exports = (sequelize, DataTypes) => {
  const Evidence = sequelize.define('Evidence', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    courseName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    institution: {
      type: DataTypes.STRING,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    hours: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    feedback: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'evidences',
    timestamps: true
  });

  Evidence.associate = function(models) {
    Evidence.belongsTo(models.User, { foreignKey: 'professorId', as: 'professor' });
  };

  return Evidence;
};