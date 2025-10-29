const { PartialProgress, DidacticPlanning, User } = require('../models');
const { validationResult } = require('express-validator');

const createProgress = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const planning = await DidacticPlanning.findByPk(req.body.planningId);
    if (!planning) {
      return res.status(404).json({ message: 'Planning not found' });
    }

    // Check if professor owns the planning
    if (req.user.role === 'professor' && planning.professorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to add progress to this planning' });
    }

    const progress = await PartialProgress.create(req.body);
    
    const newProgress = await PartialProgress.findByPk(progress.id, {
      include: [{
        model: DidacticPlanning,
        as: 'planning',
        include: ['professor'] // QUITAR 'course'
      }]
    });

    res.status(201).json(newProgress);
  } catch (error) {
    console.error('Create progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProgressByPlanning = async (req, res) => {
  try {
    const { planningId } = req.params;

    const progress = await PartialProgress.findAll({
      where: { planningId },
      include: [{
        model: DidacticPlanning,
        as: 'planning',
        include: ['professor'] // QUITAR 'course'
      }],
      order: [['partial', 'ASC']]
    });

    res.json(progress);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProgressStats = async (req, res) => {
  try {
    const { partial, courseId } = req.query;
    const where = {};

    if (partial) where.partial = parseInt(partial);

    // QUITAR courseId del where clause ya que no existe más
    const planningWhere = {};
    // if (courseId) planningWhere.courseId = courseId; // ELIMINAR esta línea

    const progress = await PartialProgress.findAll({
      where,
      include: [{
        model: DidacticPlanning,
        as: 'planning',
        where: planningWhere,
        include: ['professor'] // QUITAR 'course'
      }]
    });

    // Calculate statistics
    const stats = {
      total: progress.length,
      fulfilled: progress.filter(p => p.status === 'fulfilled').length,
      partial: progress.filter(p => p.status === 'partial').length,
      unfulfilled: progress.filter(p => p.status === 'unfulfilled').length,
      averageProgress: progress.reduce((acc, curr) => acc + curr.progressPercentage, 0) / progress.length || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Get progress stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProgress = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const progress = await PartialProgress.findByPk(req.params.id, {
      include: [{
        model: DidacticPlanning,
        as: 'planning'
      }]
    });

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    // Check permissions
    if (req.user.role === 'professor' && progress.planning.professorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this progress' });
    }

    await progress.update(req.body);

    const updatedProgress = await PartialProgress.findByPk(progress.id, {
      include: [{
        model: DidacticPlanning,
        as: 'planning',
        include: ['professor'] // QUITAR 'course'
      }]
    });

    res.json(updatedProgress);
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createProgress,
  getProgressByPlanning,
  getProgressStats,
  updateProgress
};