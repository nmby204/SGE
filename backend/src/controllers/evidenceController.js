const { Evidence, User } = require('../models');
const { validationResult } = require('express-validator');

const createEvidence = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const evidenceData = {
      ...req.body,
      professorId: req.user.id,
      fileUrl: req.file.path
    };

    const evidence = await Evidence.create(evidenceData);

    const newEvidence = await Evidence.findByPk(evidence.id, {
      include: [{
        model: User,
        as: 'professor',
        attributes: ['id', 'name', 'email']
      }]
    });

    res.status(201).json(newEvidence);
  } catch (error) {
    console.error('Create evidence error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getEvidences = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};

    if (status) where.status = status;

    // Professors can only see their own evidences
    if (req.user.role === 'professor') {
      where.professorId = req.user.id;
    }

    const evidences = await Evidence.findAll({
      where,
      include: [{
        model: User,
        as: 'professor',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(evidences);
  } catch (error) {
    console.error('Get evidences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getEvidenceById = async (req, res) => {
  try {
    const evidence = await Evidence.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'professor',
        attributes: ['id', 'name', 'email']
      }]
    });

    if (!evidence) {
      return res.status(404).json({ message: 'Evidence not found' });
    }

    // Check permissions
    if (req.user.role === 'professor' && evidence.professorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this evidence' });
    }

    res.json(evidence);
  } catch (error) {
    console.error('Get evidence error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateEvidence = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const evidence = await Evidence.findByPk(req.params.id);
    if (!evidence) {
      return res.status(404).json({ message: 'Evidence not found' });
    }

    // Check permissions
    if (req.user.role === 'professor' && evidence.professorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this evidence' });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.fileUrl = req.file.path;
    }

    await evidence.update(updateData);

    const updatedEvidence = await Evidence.findByPk(evidence.id, {
      include: [{
        model: User,
        as: 'professor',
        attributes: ['id', 'name', 'email']
      }]
    });

    res.json(updatedEvidence);
  } catch (error) {
    console.error('Update evidence error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const reviewEvidence = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'coordinator' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to review evidences' });
    }

    const evidence = await Evidence.findByPk(req.params.id);
    if (!evidence) {
      return res.status(404).json({ message: 'Evidence not found' });
    }

    const { status, feedback } = req.body;
    await evidence.update({ status, feedback });

    const updatedEvidence = await Evidence.findByPk(evidence.id, {
      include: [{
        model: User,
        as: 'professor',
        attributes: ['id', 'name', 'email']
      }]
    });

    res.json(updatedEvidence);
  } catch (error) {
    console.error('Review evidence error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteEvidence = async (req, res) => {
  try {
    const evidence = await Evidence.findByPk(req.params.id);
    if (!evidence) {
      return res.status(404).json({ message: 'Evidence not found' });
    }

    // Check permissions
    if (req.user.role === 'professor' && evidence.professorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this evidence' });
    }

    await evidence.destroy();
    res.json({ message: 'Evidence deleted successfully' });
  } catch (error) {
    console.error('Delete evidence error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createEvidence,
  getEvidences,
  getEvidenceById,
  updateEvidence,
  reviewEvidence,
  deleteEvidence
};