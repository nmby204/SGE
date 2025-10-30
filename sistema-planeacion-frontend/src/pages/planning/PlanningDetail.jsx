import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { planningService } from '../../services/planningService';
import { progressService } from '../../services/progressService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Modal from '../../components/Common/Modal';

const PlanningDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  
  const [planning, setPlanning] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: 'approved',
    feedback: ''
  });

  useEffect(() => {
    loadPlanningData();
  }, [id]);

  const loadPlanningData = async () => {
    try {
      const [planningData, progressData] = await Promise.all([
        planningService.getPlanningById(id),
        progressService.getProgressByPlanning(id)
      ]);
      
      setPlanning(planningData);
      setProgress(progressData);
    } catch (error) {
      console.error('Error cargando planeación:', error);
      alert('Error al cargar la planeación');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await planningService.reviewPlanning(id, reviewData);
      alert('Revisión enviada exitosamente');
      setReviewModalOpen(false);
      loadPlanningData(); // Recargar datos
    } catch (error) {
      console.error('Error enviando revisión:', error);
      alert('Error al enviar la revisión');
    }
  };

  const canReview = hasRole(['admin', 'coordinator']);
  const isOwner = planning?.professorId === user?.id;
  
  // ✅ NUEVA FUNCIÓN: Verificar si el profesor puede ver/registrar avances
  const canViewProgress = () => {
    // Admin y coordinadores siempre pueden ver
    if (hasRole(['admin', 'coordinator'])) {
      return true;
    }
    
    // Profesores solo pueden ver si la planeación está aprobada
    if (hasRole('professor')) {
      return planning?.status === 'approved';
    }
    
    return false;
  };

  // ✅ NUEVA FUNCIÓN: Verificar si puede registrar avances
  const canCreateProgress = () => {
    // Admin y coordinadores siempre pueden registrar
    if (hasRole(['admin', 'coordinator'])) {
      return true;
    }
    
    // Profesores solo pueden registrar si la planeación está aprobada
    if (hasRole('professor') && isOwner) {
      return planning?.status === 'approved';
    }
    
    return false;
  };

  if (loading) {
    return <LoadingSpinner text="Cargando planeación..." />;
  }

  if (!planning) {
    return (
      <div className="error-page">
        <h1>Planeación no encontrada</h1>
        <button onClick={() => navigate('/planning')} className="btn-primary">
          Volver a Planeaciones
        </button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { class: 'status-pending', text: 'Pendiente' },
      approved: { class: 'status-approved', text: 'Aprobado' },
      adjustments_required: { class: 'status-adjustments', text: 'Ajustes Requeridos' }
    };
    
    const statusInfo = statusMap[status] || { class: 'status-default', text: status };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const getProgressStatusBadge = (status) => {
    const statusMap = {
      fulfilled: { class: 'status-approved', text: 'Cumplido' },
      partial: { class: 'status-pending', text: 'Parcial' },
      unfulfilled: { class: 'status-rejected', text: 'No Cumplido' }
    };
    
    const statusInfo = statusMap[status] || { class: 'status-default', text: status };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  return (
    <div className="planning-detail">
      <div className="page-header">
        <div>
          <h1>Planeación Didáctica</h1>
          <p>{planning.course?.name} - Parcial {planning.partial}</p>
        </div>
        
        <div className="header-actions">
          <button onClick={() => navigate('/planning')} className="btn-secondary">
            Volver
          </button>
          
          {canReview && planning.status === 'pending' && (
            <button 
              onClick={() => setReviewModalOpen(true)}
              className="btn-primary"
            >
              Revisar Planeación
            </button>
          )}
          
          {isOwner && planning.status === 'adjustments_required' && (
            <button 
              onClick={() => navigate(`/planning/edit/${id}`)}
              className="btn-primary"
            >
              Corregir Planeación
            </button>
          )}
        </div>
      </div>

      {/* Información general */}
      <div className="detail-section">
        <h2>Información General</h2>
        <div className="info-grid">
          <div className="info-item">
            <strong>Materia:</strong> {planning.course?.name || 'No especificada'}
          </div>
          <div className="info-item">
            <strong>Parcial:</strong> {planning.partial}
          </div>
          <div className="info-item">
            <strong>Ciclo:</strong> {planning.cycle}
          </div>
          <div className="info-item">
            <strong>Profesor:</strong> {planning.professor?.name}
          </div>
          <div className="info-item">
            <strong>Estado:</strong> {getStatusBadge(planning.status)}
          </div>
          <div className="info-item">
            <strong>Fecha de creación:</strong> {new Date(planning.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Contenido de la planeación */}
      <div className="detail-section">
        <h2>Contenido de la Planeación</h2>
        
        <div className="content-section">
          <h3>Contenido Temático</h3>
          <p>{planning.content}</p>
        </div>

        <div className="content-section">
          <h3>Objetivos de Aprendizaje</h3>
          <p>{planning.objectives}</p>
        </div>

        <div className="content-section">
          <h3>Metodología</h3>
          <p>{planning.methodology}</p>
        </div>

        <div className="content-section">
          <h3>Estrategias de Evaluación</h3>
          <p>{planning.evaluation}</p>
        </div>

        {planning.resources && (
          <div className="content-section">
            <h3>Recursos Didácticos</h3>
            <p>{planning.resources}</p>
          </div>
        )}

        {planning.fileUrl && (
          <div className="content-section">
            <h3>Archivo Adjunto</h3>
            <a 
              href={planning.fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="file-link"
            >
              📎 Ver archivo adjunto
            </a>
          </div>
        )}
      </div>

      {/* Feedback si existe */}
      {planning.feedback && (
        <div className="detail-section feedback-section">
          <h2>Feedback de Revisión</h2>
          <div className="feedback-content">
            <p>{planning.feedback}</p>
          </div>
        </div>
      )}

      {/* ✅ Avances registrados - BLOQUEADO PARA PROFESORES SI NO ESTÁ APROBADA */}
      {canViewProgress() ? (
        <div className="detail-section">
          <h2>Avances Parciales</h2>
          
          {progress.length > 0 ? (
            <div className="progress-list">
              {progress.map(progressItem => (
                <div key={progressItem.id} className="progress-item">
                  <div className="progress-header">
                    <h3>Parcial {progressItem.partial}</h3>
                    <div className="progress-stats">
                      <span className="progress-percentage">
                        {progressItem.progressPercentage}%
                      </span>
                      {getProgressStatusBadge(progressItem.status)}
                    </div>
                  </div>
                  
                  <div className="progress-details">
                    {progressItem.achievements && (
                      <div>
                        <strong>Logros:</strong> {progressItem.achievements}
                      </div>
                    )}
                    
                    {progressItem.challenges && (
                      <div>
                        <strong>Desafíos:</strong> {progressItem.challenges}
                      </div>
                    )}
                    
                    {progressItem.adjustments && (
                      <div>
                        <strong>Ajustes:</strong> {progressItem.adjustments}
                      </div>
                    )}
                  </div>
                  
                  <div className="progress-date">
                    Registrado el: {new Date(progressItem.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-progress">
              <p>No hay avances registrados para esta planeación.</p>
              {hasRole('professor') && planning.status !== 'approved' && (
                <div className="info-message">
                  <p>⏳ Los avances parciales estarán disponibles una vez que la planeación sea aprobada.</p>
                </div>
              )}
            </div>
          )}

          {canCreateProgress() && (
            <button 
              onClick={() => navigate('/progress', { state: { planningId: id } })}
              className="btn-secondary"
            >
              Registrar Avance
            </button>
          )}
        </div>
      ) : (
        // ✅ MOSTRAR MENSAJE CUANDO NO TIENE ACCESO
        <div className="detail-section blocked-section">
          <h2>Avances Parciales</h2>
          <div className="access-denied">
            <div className="warning-icon">⚠️</div>
            <h3>Acceso restringido</h3>
            <p>
              {hasRole('professor') 
                ? "Los avances parciales solo están disponibles para planeaciones aprobadas. Una vez que esta planeación sea revisada y aprobada, podrás registrar y ver los avances."
                : "No tienes permisos para ver los avances parciales."
              }
            </p>
            {hasRole('professor') && (
              <div className="current-status">
                <strong>Estado actual:</strong> {getStatusBadge(planning.status)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de revisión */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Revisar Planeación"
      >
        <form onSubmit={handleReviewSubmit}>
          <div className="form-group">
            <label htmlFor="reviewStatus">Estado</label>
            <select
              id="reviewStatus"
              value={reviewData.status}
              onChange={(e) => setReviewData(prev => ({ ...prev, status: e.target.value }))}
              required
            >
              <option value="approved">Aprobar</option>
              <option value="adjustments_required">Solicitar Ajustes</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="feedback">Feedback *</label>
            <textarea
              id="feedback"
              value={reviewData.feedback}
              onChange={(e) => setReviewData(prev => ({ ...prev, feedback: e.target.value }))}
              required
              rows="6"
              placeholder="Proporcione comentarios detallados sobre la planeación..."
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => setReviewModalOpen(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Enviar Revisión
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PlanningDetail;