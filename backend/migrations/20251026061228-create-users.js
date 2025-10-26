'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id_user: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      str_name: { type: Sequelize.STRING(100), allowNull: false },
      str_email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      str_password: { type: Sequelize.STRING(255), allowNull: false },
      int_rol: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      dt_created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
      dt_updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });

    await queryInterface.sequelize.query(
      'ALTER TABLE "Users" ADD CONSTRAINT "Users_int_rol_chk" CHECK (int_rol IN (1,2));'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Users');
  }
};
