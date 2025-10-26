const { User } = require('../models');
const { signAccessToken } = require('../utils/jwt');

module.exports = {
  async loginWithEmailPassword({ str_email, str_password }) {
    const email = (str_email || '').trim().toLowerCase();

    const user = await User.findOne({ where: { str_email: email } });
    if (!user) return null;

    const ok = await user.isPasswordValid(str_password || '');
    if (!ok) return null;

    const payload = { sub: user.id_user, email: user.str_email, rol: user.int_rol };

    const token = signAccessToken(payload);

    const { str_password: _, ...safe } = user.get({ plain: true });

    return { token, user: safe, token_type: 'Bearer', expires_in: process.env.JWT_EXPIRES || '2h' };
  }
};