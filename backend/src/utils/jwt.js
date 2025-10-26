const jwt = require('jsonwebtoken');

const JWT_SECRET  = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '2h';

function signAccessToken(payload, opts = {}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES, ...opts });
}

function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signAccessToken, verifyAccessToken };
