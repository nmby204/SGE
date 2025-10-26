const { celebrate, Joi, Segments } = require('celebrate');

exports.createUser = celebrate({
  [Segments.BODY]: Joi.object({
    str_name: Joi.string().max(100).required(),
    str_email: Joi.string().email().required(),
    str_password: Joi.string().min(6).required(),
    int_rol: Joi.number().integer().valid(1,2).required()
  })
});

exports.updateUser = celebrate({
  [Segments.BODY]: Joi.object({
    str_name: Joi.string().max(100),
    str_email: Joi.string().email(),
    str_password: Joi.string().min(6),
    int_rol: Joi.number().integer().valid(1,2)
  }).min(1)
});
