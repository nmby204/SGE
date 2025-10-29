const { DidacticPlanning, Course, User, PartialProgress } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const createPlanning = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const planningData = {
      ...req.body,
      professorId: req.user.id,
      fileUrl: req.file ? req.file.path : null
    };

    const planning = await DidacticPlanning.create(planningData);

    // Include related data in response
    const newPlanning = await DidacticPlanning.findByPk(planning.id, {
      include: [
        { model: User, as: 'professor', attributes: ['id', 'name', 'email'] },
        { model: Course, as: 'course' }
      ]
    });

    res.status(201).json(newPlanning);
  } catch (error) {
    console.error('Create planning error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPlannings = async (req, res) => {
  try {
    const { courseId, partial, status, cycle } = req.query;
    const where = {};

    // Filter by course
    if (courseId) where.courseId = courseId;
    
    // Filter by partial
    if (partial) where.partial = parseInt(partial);
    
    // Filter by status
    if (status) where.status = status;
    
    // Filter by cycle
    if (cycle) where.cycle = cycle;

    // Professors can only see their own plannings
    if (req.user.role === 'professor') {
      where.professorId = req.user.id;
    }

    const plannings = await DidacticPlanning.findAll({
      where,
      include: [
        { model: User, as: 'professor', attributes: ['id', 'name', 'email'] },
        { model: Course, as: 'course' },
        { model: PartialProgress, as: 'progress' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(plannings);
  } catch (error) {
    console.error('Get plannings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPlanningById = async (req, res) => {
  try {
    const planning = await DidacticPlanning.findByPk(req.params.id, {
      include: [
        { model: User, as: 'professor', attributes: ['id', 'name', 'email'] },
        { model: Course, as: 'course' },
        { model: PartialProgress, as: 'progress' }
      ]
    });

    if (!planning) {
      return res.status(404).json({ message: 'Planning not found' });
    }

    // Check permissions
    if (req.user.role === 'professor' && planning.professorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this planning' });
    }

    res.json(planning);
  } catch (error) {
    console.error('Get planning error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPlanningHistory = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { cycle } = req.query;

    const where = { courseId };
    if (cycle) where.cycle = { [Op.ne]: cycle }; // Exclude current cycle

    const history = await DidacticPlanning.findAll({
      where,
      include: [
        { model: User, as: 'professor', attributes: ['id', 'name', 'email'] },
        { model: Course, as: 'course' }
      ],
      order: [['cycle', 'DESC'], ['partial', 'ASC']]
    });

    res.json(history);
  } catch (error) {
    console.error('Get planning history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updatePlanning = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const planning = await DidacticPlanning.findByPk(req.params.id);
    if (!planning) {
      return res.status(404).json({ message: 'Planning not found' });
    }

    // Check permissions
    if (req.user.role === 'professor' && planning.professorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this planning' });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.fileUrl = req.file.path;
    }

    await planning.update(updateData);

    const updatedPlanning = await DidacticPlanning.findByPk(planning.id, {
      include: [
        { model: User, as: 'professor', attributes: ['id', 'name', 'email'] },
        { model: Course, as: 'course' }
      ]
    });

    res.json(updatedPlanning);
  } catch (error) {
    console.error('Update planning error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const reviewPlanning = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'coordinator' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to review plannings' });
    }

    const planning = await DidacticPlanning.findByPk(req.params.id);
    if (!planning) {
      return res.status(404).json({ message: 'Planning not found' });
    }

    const { status, feedback } = req.body;
    await planning.update({ status, feedback });

    const updatedPlanning = await DidacticPlanning.findByPk(planning.id, {
      include: [
        { model: User, as: 'professor', attributes: ['id', 'name', 'email'] },
        { model: Course, as: 'course' }
      ]
    });

    res.json(updatedPlanning);
  } catch (error) {
    console.error('Review planning error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deletePlanning = async (req, res) => {
  try {
    const planning = await DidacticPlanning.findByPk(req.params.id);
    if (!planning) {
      return res.status(404).json({ message: 'Planning not found' });
    }

    // Check permissions
    if (req.user.role === 'professor' && planning.professorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this planning' });
    }

    await planning.destroy();
    res.json({ message: 'Planning deleted successfully' });
  } catch (error) {
    console.error('Delete planning error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createPlanning,
  getPlannings,
  getPlanningById,
  getPlanningHistory,
  updatePlanning,
  reviewPlanning,
  deletePlanning
};