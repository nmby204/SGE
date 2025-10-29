module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'coordinator', 'professor'),
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'users',
    timestamps: true
  });

  User.associate = function(models) {
    User.hasMany(models.DidacticPlanning, { foreignKey: 'professorId', as: 'plannings' });
    User.hasMany(models.Evidence, { foreignKey: 'professorId', as: 'evidences' });
    User.hasMany(models.Course, { foreignKey: 'coordinatorId', as: 'coordinatedCourses' });
  };

  return User;
};