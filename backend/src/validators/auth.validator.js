const { celebrate, Joi, Segments } = require('celebrate');

exports.loginValidator = celebrate({
  [Segments.BODY]: Joi.object({
    str_email: Joi.string().email().required(),
    str_password: Joi.string().min(6).required()
  })
});
