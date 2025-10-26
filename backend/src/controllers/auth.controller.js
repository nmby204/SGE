const createError = require('http-errors');
const authService = require('../services/auth.service');

module.exports = {
  async login(req, res) {
    const result = await authService.loginWithEmailPassword(req.body);
    if (!result) throw createError(401, 'Credenciales inválidas');
    res.json(result);
  }
};
