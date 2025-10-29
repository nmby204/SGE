const { DidacticPlanning, User, PartialProgress } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const createPlanning = async (req, res) => {
  try {
    console.log('🔍 === INICIANDO CREACIÓN DE PLANEACIÓN ===');
    console.log('📝 Body recibido:', req.body);
    console.log('📁 Archivo recibido:', req.file);
    console.log('👤 Usuario autenticado:', req.user);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Errores de validación:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    // ✅ DETERMINAR TIPO DE ALMACENAMIENTO
    let fileData = {};
    const isGoogleDrive = req.body.driveFileId && req.body.fileUrl;

    if (isGoogleDrive) {
      // ✅ GOOGLE DRIVE
      console.log('☁️ Usando Google Drive para almacenamiento');
      fileData = {
        fileUrl: req.body.fileUrl,
        driveFileId: req.body.driveFileId,
        fileName: req.body.fileName || 'archivo',
        storageType: 'google_drive'
      };
    } else if (req.file) {
      // ✅ ALMACENAMIENTO LOCAL
      console.log('📂 Usando almacenamiento local');
      fileData = {
        fileUrl: req.file.path,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        storageType: 'local'
      };
    }

    // Preparar datos para la planeación
    const planningData = {
      ...req.body,
      professorId: req.user.id,
      ...fileData
    };

    // Asegurarnos de que no haya courseId
    delete planningData.courseId;

    console.log('📊 Datos finales para crear:', planningData);

    // Validar tipos de datos
    if (planningData.partial) {
      planningData.partial = parseInt(planningData.partial);
    }

    // Crear la planeación
    const planning = await DidacticPlanning.create(planningData);
    console.log('✅ Planeación creada exitosamente. ID:', planning.id);

    // Obtener la planeación con datos relacionados
    const newPlanning = await DidacticPlanning.findByPk(planning.id, {
      include: [
        { model: User, as: 'professor', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json(newPlanning);

  } catch (error) {
    console.error('❌ Create planning error:', error);
    console.error('🔍 Error details:', error.message);
    console.error('📋 Stack:', error.stack);
    
    res.status(500).json({ 
      message: 'Error del servidor al crear la planeación',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getPlannings = async (req, res) => {
  try {
    const { courseName, partial, status, cycle } = req.query;
    const where = { isActive: true };

    // Filter by courseName
    if (courseName) where.courseName = { [Op.iLike]: `%${courseName}%` };
    
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

    console.log('🔍 Buscando planeaciones con filtros:', where);

    const plannings = await DidacticPlanning.findAll({
      where,
      include: [
        { model: User, as: 'professor', attributes: ['id', 'name', 'email'] },
        { model: PartialProgress, as: 'progress' }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`✅ Encontradas ${plannings.length} planeaciones`);
    res.json(plannings);

  } catch (error) {
    console.error('❌ Get plannings error:', error);
    res.status(500).json({ 
      message: 'Error del servidor al obtener planeaciones',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getPlanningById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Buscando planeación con ID:', id);

    const planning = await DidacticPlanning.findOne({
      where: { id, isActive: true },
      include: [
        { model: User, as: 'professor', attributes: ['id', 'name', 'email'] },
        { model: PartialProgress, as: 'progress' }
      ]
    });

    if (!planning) {
      console.log('❌ Planeación no encontrada:', id);
      return res.status(404).json({ message: 'Planeación no encontrada' });
    }

    // Check permissions
    if (req.user.role === 'professor' && planning.professorId !== req.user.id) {
      console.log('❌ Usuario no autorizado para ver esta planeación');
      return res.status(403).json({ message: 'No autorizado para ver esta planeación' });
    }

    console.log('✅ Planeación encontrada:', planning.id);
    res.json(planning);

  } catch (error) {
    console.error('❌ Get planning error:', error);
    res.status(500).json({ 
      message: 'Error del servidor al obtener la planeación',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getPlanningHistory = async (req, res) => {
  try {
    const { courseName } = req.params;
    const { cycle } = req.query;

    console.log('🔍 Buscando historial para materia:', courseName);

    const where = { 
      courseName,
      isActive: true 
    };
    
    if (cycle) where.cycle = { [Op.ne]: cycle };

    const history = await DidacticPlanning.findAll({
      where,
      include: [
        { model: User, as: 'professor', attributes: ['id', 'name', 'email'] }
      ],
      order: [['cycle', 'DESC'], ['partial', 'ASC']]
    });

    console.log(`✅ Encontradas ${history.length} planeaciones en el historial`);
    res.json(history);

  } catch (error) {
    console.error('❌ Get planning history error:', error);
    res.status(500).json({ 
      message: 'Error del servidor al obtener el historial',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const updatePlanning = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Actualizando planeación con ID:', id);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const planning = await DidacticPlanning.findOne({
      where: { id, isActive: true }
    });

    if (!planning) {
      console.log('❌ Planeación no encontrada para actualizar:', id);
      return res.status(404).json({ message: 'Planeación no encontrada' });
    }

    // Check permissions
    if (req.user.role === 'professor' && planning.professorId !== req.user.id) {
      console.log('❌ Usuario no autorizado para actualizar esta planeación');
      return res.status(403).json({ message: 'No autorizado para actualizar esta planeación' });
    }

    // ✅ DETERMINAR TIPO DE ALMACENAMIENTO
    let fileData = {};
    const isGoogleDrive = req.body.driveFileId && req.body.fileUrl;

    if (isGoogleDrive) {
      // ✅ GOOGLE DRIVE
      console.log('☁️ Actualizando con Google Drive');
      fileData = {
        fileUrl: req.body.fileUrl,
        driveFileId: req.body.driveFileId,
        fileName: req.body.fileName || planning.fileName,
        storageType: 'google_drive'
      };
    } else if (req.file) {
      // ✅ ALMACENAMIENTO LOCAL
      console.log('📂 Actualizando con archivo local');
      fileData = {
        fileUrl: req.file.path,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        storageType: 'local'
      };
    }

    const updateData = { 
      ...req.body,
      ...fileData
    };

    // Asegurarnos de que no haya courseId
    delete updateData.courseId;

    console.log('📊 Datos para actualizar:', updateData);

    await planning.update(updateData);

    const updatedPlanning = await DidacticPlanning.findByPk(planning.id, {
      include: [
        { model: User, as: 'professor', attributes: ['id', 'name', 'email'] }
      ]
    });

    console.log('✅ Planeación actualizada exitosamente');
    res.json(updatedPlanning);

  } catch (error) {
    console.error('❌ Update planning error:', error);
    res.status(500).json({ 
      message: 'Error del servidor al actualizar la planeación',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const reviewPlanning = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Revisando planeación con ID:', id);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'coordinator' && req.user.role !== 'admin') {
      console.log('❌ Usuario no autorizado para revisar planeaciones');
      return res.status(403).json({ message: 'No autorizado para revisar planeaciones' });
    }

    const planning = await DidacticPlanning.findOne({
      where: { id, isActive: true }
    });

    if (!planning) {
      console.log('❌ Planeación no encontrada para revisión:', id);
      return res.status(404).json({ message: 'Planeación no encontrada' });
    }

    const { status, feedback } = req.body;
    console.log('📝 Revisión - Estado:', status, 'Feedback:', feedback);

    await planning.update({ status, feedback });

    const updatedPlanning = await DidacticPlanning.findByPk(planning.id, {
      include: [
        { model: User, as: 'professor', attributes: ['id', 'name', 'email'] }
      ]
    });

    console.log('✅ Planeación revisada exitosamente');
    res.json(updatedPlanning);

  } catch (error) {
    console.error('❌ Review planning error:', error);
    res.status(500).json({ 
      message: 'Error del servidor al revisar la planeación',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const deletePlanning = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Eliminando planeación con ID:', id);

    const planning = await DidacticPlanning.findOne({
      where: { id, isActive: true }
    });

    if (!planning) {
      console.log('❌ Planeación no encontrada para eliminar:', id);
      return res.status(404).json({ message: 'Planeación no encontrada' });
    }

    // Check permissions
    if (req.user.role === 'professor' && planning.professorId !== req.user.id) {
      console.log('❌ Usuario no autorizado para eliminar esta planeación');
      return res.status(403).json({ message: 'No autorizado para eliminar esta planeación' });
    }

    // Soft delete
    await planning.update({ isActive: false });

    console.log('✅ Planeación eliminada exitosamente (soft delete)');
    res.json({ message: 'Planeación eliminada exitosamente' });

  } catch (error) {
    console.error('❌ Delete planning error:', error);
    res.status(500).json({ 
      message: 'Error del servidor al eliminar la planeación',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
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