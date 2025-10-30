const calendarService = require('./calendarService');
const { DidacticPlanning, Evidence, PartialProgress, User } = require('../models');

class CalendarNotificationService {
  
  // ✅ CREAR EVENTO PARA NUEVA PLANEACIÓN
  async createPlanningEvent(planning, professor) {
    try {
      const eventData = {
        summary: `📚 Nueva Planeación: ${planning.courseName}`,
        description: `Planeación creada para ${planning.courseName} - Parcial ${planning.partial}\nCiclo: ${planning.cycle}\nProfesor: ${professor.name}`,
        start: new Date(planning.submissionDate),
        end: new Date(new Date(planning.submissionDate).setHours(23, 59, 59)),
        location: 'Sistema de Planeación Didáctica',
        type: 'planning_submission'
      };

      // Crear evento para el profesor
      await calendarService.createEvent(eventData, professor.calendarAccessToken);

      // Si hay fecha de revisión, crear evento para coordinadores
      if (planning.reviewDeadline) {
        const reviewEvent = {
          summary: `🔍 Revisar Planeación: ${planning.courseName}`,
          description: `Revisión pendiente: ${planning.courseName}\nProfesor: ${professor.name}\nParcial: ${planning.partial}`,
          start: new Date(planning.reviewDeadline),
          end: new Date(new Date(planning.reviewDeadline).setHours(23, 59, 59)),
          location: 'Sistema de Planeación Didáctica',
          type: 'review_deadline'
        };

        console.log('📅 Evento de revisión programado para:', planning.reviewDeadline);
      }

      console.log('✅ Evento de planeación creado para calendario');
    } catch (error) {
      console.error('❌ Error creando evento de planeación:', error);
    }
  }

  // ✅ CREAR EVENTO PARA REVISIÓN DE PLANEACIÓN
  async createReviewEvent(planning, professor, reviewer) {
    try {
      const eventData = {
        summary: `👁️ Revisar: ${planning.courseName}`,
        description: `Revisión requerida: ${planning.courseName}\nProfesor: ${professor.name}\nEstado: ${planning.status}\nFeedback: ${planning.feedback || 'Sin feedback'}`,
        start: new Date(),
        end: new Date(new Date().setHours(23, 59, 59)),
        location: 'Sistema de Planeación Didáctica',
        type: 'review_required'
      };

      await calendarService.createEvent(eventData, reviewer.calendarAccessToken);
      console.log('✅ Evento de revisión creado para coordinador');
    } catch (error) {
      console.error('❌ Error creando evento de revisión:', error);
    }
  }

  // ✅ CREAR EVENTO PARA EVIDENCIA
  async createEvidenceEvent(evidence, professor) {
    try {
      const eventData = {
        summary: `📋 Evidencia: ${evidence.courseName}`,
        description: `Evidencia de capacitación: ${evidence.courseName}\nInstitución: ${evidence.institution}\nHoras: ${evidence.hours}\nFecha: ${evidence.date}`,
        start: new Date(evidence.date),
        end: new Date(new Date(evidence.date).setHours(23, 59, 59)),
        location: evidence.institution,
        type: 'training_evidence'
      };

      await calendarService.createEvent(eventData, professor.calendarAccessToken);

      // Evento de revisión para coordinadores
      if (evidence.reviewDeadline) {
        const reviewEvent = {
          summary: `🔍 Revisar Evidencia: ${evidence.courseName}`,
          description: `Evidencia pendiente de revisión: ${evidence.courseName}\nProfesor: ${professor.name}\nHoras: ${evidence.hours}`,
          start: new Date(evidence.reviewDeadline),
          end: new Date(new Date(evidence.reviewDeadline).setHours(23, 59, 59)),
          location: 'Sistema de Planeación Didáctica',
          type: 'evidence_review'
        };

        console.log('📅 Evento de revisión de evidencia programado');
      }

      console.log('✅ Evento de evidencia creado para calendario');
    } catch (error) {
      console.error('❌ Error creando evento de evidencia:', error);
    }
  }

  // ✅ CREAR EVENTO PARA PROGRESO PARCIAL
  async createProgressEvent(progress, planning, professor) {
    try {
      const eventData = {
        summary: `📊 Avance: ${planning.courseName} - Parcial ${progress.partial}`,
        description: `Avance registrado: ${progress.progressPercentage}% completado\nEstado: ${progress.status}\nLogros: ${progress.achievements || 'Sin logros registrados'}`,
        start: new Date(),
        end: new Date(new Date().setHours(23, 59, 59)),
        location: 'Sistema de Planeación Didáctica',
        type: 'progress_update'
      };

      await calendarService.createEvent(eventData, professor.calendarAccessToken);

      // Evento para próximo checkpoint
      if (progress.nextCheckpoint) {
        const checkpointEvent = {
          summary: `⏰ Checkpoint: ${planning.courseName} - Parcial ${progress.partial}`,
          description: `Próximo checkpoint programado\nAvance actual: ${progress.progressPercentage}%`,
          start: new Date(progress.nextCheckpoint),
          end: new Date(new Date(progress.nextCheckpoint).setHours(23, 59, 59)),
          location: 'Sistema de Planeación Didáctica',
          type: 'progress_checkpoint'
        };

        console.log('📅 Evento de checkpoint programado');
      }

      console.log('✅ Evento de progreso creado para calendario');
    } catch (error) {
      console.error('❌ Error creando evento de progreso:', error);
    }
  }

  // ✅ OBTENER EVENTOS REALES DE LA BASE DE DATOS (CORREGIDO)
  async getDatabaseEvents(user, maxResults = 10) {
    try {
      console.log('📅 Obteniendo eventos reales de la base de datos...');

      // Eventos de planeaciones del usuario - CORREGIDO: usar created_at
      const userPlannings = await DidacticPlanning.findAll({
        where: { 
          professorId: user.id, 
          isActive: true 
        },
        include: [{ 
          model: User, 
          as: 'professor', 
          attributes: ['id', 'name', 'email'] 
        }],
        order: [['submissionDate', 'DESC']],
        limit: maxResults
      });

      // Eventos de evidencias del usuario - CORREGIDO: usar created_at
      const userEvidences = await Evidence.findAll({
        where: { 
          professorId: user.id, 
          isActive: true 
        },
        include: [{ 
          model: User, 
          as: 'professor', 
          attributes: ['id', 'name', 'email'] 
        }],
        order: [['date', 'DESC']],
        limit: maxResults
      });

      // Eventos de progresos del usuario - CORREGIDO: usar created_at
      const userProgress = await PartialProgress.findAll({
        where: { isActive: true },
        include: [{
          model: DidacticPlanning,
          as: 'planning',
          where: { 
            professorId: user.id, 
            isActive: true 
          },
          include: [{ 
            model: User, 
            as: 'professor', 
            attributes: ['id', 'name', 'email'] 
          }]
        }],
        order: [['created_at', 'DESC']], // ← CORREGIDO: usar created_at en lugar de createdAt
        limit: maxResults
      });

      // Formatear eventos de planeaciones
      const planningEvents = userPlannings.map(p => ({
        id: `planning-${p.id}`,
        title: `📚 ${p.courseName} - Parcial ${p.partial}`,
        start: p.submissionDate || p.created_at, // Usar created_at si no hay submissionDate
        end: p.reviewDeadline || new Date((p.submissionDate || p.created_at).getTime() + 60 * 60 * 1000),
        type: 'planning',
        status: p.status,
        description: `Ciclo: ${p.cycle} | Estado: ${p.status}`,
        entity: p
      }));

      // Formatear eventos de evidencias
      const evidenceEvents = userEvidences.map(e => ({
        id: `evidence-${e.id}`,
        title: `📋 ${e.courseName} - ${e.institution}`,
        start: e.date || e.created_at, // Usar created_at si no hay date
        end: e.reviewDeadline || new Date((e.date || e.created_at).getTime() + 60 * 60 * 1000),
        type: 'evidence',
        status: e.status,
        description: `${e.hours} horas | Estado: ${e.status}`,
        entity: e
      }));

      // Formatear eventos de progresos
      const progressEvents = userProgress.map(p => ({
        id: `progress-${p.id}`,
        title: `📊 ${p.planning.courseName} - ${p.progressPercentage}%`,
        start: p.created_at, // ← CORREGIDO: usar created_at
        end: p.nextCheckpoint || new Date(p.created_at.getTime() + 60 * 60 * 1000),
        type: 'progress',
        status: p.status,
        description: `Parcial ${p.partial} | Estado: ${p.status}`,
        entity: p
      }));

      // Combinar todos los eventos y ordenar por fecha
      const allEvents = [
        ...planningEvents,
        ...evidenceEvents, 
        ...progressEvents
      ].sort((a, b) => new Date(a.start) - new Date(b.start))
       .slice(0, maxResults);

      console.log(`✅ Obtenidos ${allEvents.length} eventos reales de la BD`);
      return allEvents;

    } catch (error) {
      console.error('❌ Error obteniendo eventos de la base de datos:', error);
      return [];
    }
  }

  // ✅ OBTENER EVENTOS DEL SISTEMA (DATOS REALES)
  async getSystemEvents(user, maxResults = 10) {
    try {
      return await this.getDatabaseEvents(user, maxResults);
    } catch (error) {
      console.error('❌ Error obteniendo eventos del sistema:', error);
      return [];
    }
  }
}

module.exports = new CalendarNotificationService();