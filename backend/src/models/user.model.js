const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt'); // npm i bcrypt

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id_user: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
      defaultValue: DataTypes.UUIDV4
    },
    str_name: { type: DataTypes.STRING(100), allowNull: false },
    str_email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    str_password: { type: DataTypes.STRING(255), allowNull: false },
    int_rol: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, validate: { isIn: [[1,2]] } }
  }, { 
    tableName: 'Users',
    timestamps: true,
    createdAt: 'dt_created_at',
    updatedAt: 'dt_updated_at'
  });

  // Hash de contraseña (buenas prácticas)
  User.addHook('beforeCreate', async (user) => {
    if (user.str_password) {
      user.str_password = await bcrypt.hash(user.str_password, 10);
    }
  });
  User.addHook('beforeUpdate', async (user) => {
    if (user.changed('str_password')) {
      user.str_password = await bcrypt.hash(user.str_password, 10);
    }
  });

  // Método helper para comparar contraseña
  User.prototype.isPasswordValid = function (plain) {
    return bcrypt.compare(plain, this.str_password);
  };

  return User;
};