const { User } = require('../models');

module.exports = {
  async list() {
    return User.findAll({ order: [['dt_created_at', 'DESC']] });
  },
  async getById(id_user) {
    return User.findByPk(id_user);
  },
  async create(data) {
    return User.create(data);
  },
  async update(id_user, data) {
    const u = await User.findByPk(id_user);
    if (!u) return null;
    return u.update(data);
  },
  async remove(id_user) {
    return User.destroy({ where: { id_user } });
  }
};