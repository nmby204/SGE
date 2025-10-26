const createError = require('http-errors');
const { verifyAccessToken } = require('../utils/jwt');

module.exports = function auth(required = true) {
  return (req, _res, next) => {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;

    if (!token) {
      if (!required) return next();
      return next(createError(401, 'Token requerido'));
    }
    try {
      const payload = verifyAccessToken(token);
      req.auth = payload; // { sub, email, rol, iat, exp }
      next();
    } catch (e) {
      next(createError(401, 'Token inválido o expirado'));
    }
  };
};
