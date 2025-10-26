const router = require('express').Router();

router.use('/api/users', require('./users.routes'));
router.use('/api/auth', require('./auth.routes'));

module.exports = router;