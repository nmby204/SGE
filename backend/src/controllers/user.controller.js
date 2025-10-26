const createError = require('http-errors');
const service = require('../services/user.service');

module.exports = {
  async list(req, res) {
    const users = await service.list();
    res.json(users);
  },
  async get(req, res) {
    const u = await service.getById(req.params.id_user);
    if (!u) throw createError(404, 'User not found');
    res.json(u);
  },
  async create(req, res) {
    const created = await service.create(req.body);
    const { str_password, ...safe } = created.get({ plain: true });
    res.status(201).json(safe);
  },
  async update(req, res) {
    const updated = await service.update(req.params.id_user, req.body);
    if (!updated) throw createError(404, 'User not found');
    const { str_password, ...safe } = updated.get({ plain: true });
    res.json(safe);
  },
  async remove(req, res) {
    await service.remove(req.params.id_user);
    res.status(204).send();
  }
};
