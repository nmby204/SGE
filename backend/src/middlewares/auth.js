const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// CORREGIDO: Aceptar tanto array como argumentos separados
const authorize = (...roles) => {
  // Si el primer argumento es un array, usarlo directamente
  if (roles.length === 1 && Array.isArray(roles[0])) {
    roles = roles[0];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    console.log(`🔐 Autorización: Usuario ${req.user.role} intentando acceder. Roles permitidos: ${roles.join(', ')}`);

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${roles.join(', ')}`,
        userRole: req.user.role,
        requiredRoles: roles
      });
    }

    next();
  };
};

module.exports = {
  auth,
  authorize
};