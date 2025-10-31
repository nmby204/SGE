const { User, DidacticPlanning, Evidence } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const getUsers = async (req, res) => {
  try {
    const { role, isActive } = req.query;
    const where = {};

    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      where,
      order: [['createdAt', 'DESC']]
    });
    
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProfessors = async (req, res) => {
  try {
    const professors = await User.findAll({
      attributes: { exclude: ['password'] },
      where: { 
        role: 'professor',
        isActive: true 
      },
      include: [{
        model: DidacticPlanning,
        as: 'plannings',
        attributes: ['id', 'courseName', 'partial', 'cycle', 'status', 'createdAt'],
        where: { isActive: true },
        required: false
      }],
      order: [['name', 'ASC']]
    });
    
    res.json(professors);
  } catch (error) {
    console.error('Get professors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: DidacticPlanning,
          as: 'plannings',
          attributes: ['id', 'courseName', 'partial', 'cycle', 'status', 'createdAt'],
          where: { isActive: true },
          required: false
        },
        {
          model: Evidence,
          as: 'evidences',
          attributes: ['id', 'courseName', 'institution', 'date', 'hours', 'status', 'createdAt'],
          where: { isActive: true },
          required: false
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Si no es admin y no es el propio usuario, limitar información
    if (req.user.role !== 'admin' && req.user.id !== user.id) {
      delete user.dataValues.plannings;
      delete user.dataValues.evidences;
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only admin can update roles
    if (req.body.role && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update roles' });
    }

    // Verificar si el email ya existe (si se está actualizando)
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ 
        where: { 
          email: req.body.email,
          id: { [Op.ne]: req.params.id }
        } 
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    await user.update(req.body);

    // Obtener usuario actualizado sin password
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete users' });
    }

    // No permitir que un usuario se elimine a sí mismo
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Soft delete
    await user.update({ isActive: false });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Nueva función para crear usuario
const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'professor'
    });

    // No enviar la contraseña
    const userResponse = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUsers,
  getProfessors,
  getUserById,
  updateUser,
  deleteUser,
  createUser
};