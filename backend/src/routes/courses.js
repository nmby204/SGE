const express = require('express');
const { auth } = require('../middlewares/auth');
const { Course } = require('../models');
const router = express.Router();

// All routes are protected
router.use(auth);

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Obtener todas las materias/cursos
 *     tags: [Cursos/Materias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cursos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       500:
 *         description: Error del servidor
 */
router.get('/', async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'code', 'description', 'credits'],
      order: [['name', 'ASC']]
    });
    
    res.json(courses);
  } catch (error) {
    console.error('Error obteniendo cursos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Obtener curso por ID
 *     tags: [Cursos/Materias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del curso
 *     responses:
 *       200:
 *         description: Curso encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Curso no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      attributes: ['id', 'name', 'code', 'description', 'credits']
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    res.json(course);
  } catch (error) {
    console.error('Error obteniendo curso:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;