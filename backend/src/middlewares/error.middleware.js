const { isCelebrateError } = require('celebrate');

module.exports = (err, _req, res, _next) => {
  if (isCelebrateError(err)) {
    const details = {};
    for (const [segment, joiErr] of err.details.entries()) {
      details[segment] = joiErr.message;
    }
    return res.status(400).json({ error: 'ValidationError', details });
  }
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
};
