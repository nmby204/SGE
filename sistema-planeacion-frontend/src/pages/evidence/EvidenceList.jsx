import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { evidenceService } from '../../services/evidenceService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Modal from '../../components/Common/Modal';
import '../../styles/evidence-styles.css';
const EvidenceList = () => {
  const [evidences, setEvidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: ''
  });
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [reviewData, setReviewData] = useState({
    status: 'approved',
    feedback: ''
  });
  const { user, hasRole } = useAuth();

  useEffect(() => {
    loadEvidences();
  }, [filters]);

  const loadEvidences = async () => {
    try {
      const data = await evidenceService.getEvidences(filters);
      setEvidences(data);
    } catch (error) {
      console.error('Error cargando evidencias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const openReviewModal = (evidence) => {
    setSelectedEvidence(evidence);
    setReviewData({
      status: 'approved',
      feedback: ''
    });
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await evidenceService.reviewEvidence(selectedEvidence.id, reviewData);
      alert('Revisión enviada exitosamente');
      setReviewModalOpen(false);
      loadEvidences(); // Recargar lista
    } catch (error) {
      console.error('Error enviando revisión:', error);
      alert('Error al enviar la revisión');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { class: 'status-pending', text: 'Pendiente' },
      approved: { class: 'status-approved', text: 'Aprobado' },
      rejected: { class: 'status-rejected', text: 'Rechazado' }
    };
    
    const statusInfo = statusMap[status] || { class: 'status-default', text: status };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const canReview = hasRole(['admin', 'coordinator']);
  const isOwner = (evidence) => evidence.professorId === user?.id;

  if (loading) {
    return <LoadingSpinner text="Cargando evidencias..." />;
  }

  return (
    <div className="evidence-list">
      <div className="page-header">
        <h1>Evidencias de Capacitación</h1>
        {hasRole('professor') && (
          <Link to="/evidence/create" className="btn-primary">
            Nueva Evidencia
          </Link>
        )}
      </div>

      {/* Filtros */}
      <div className="filters">
        <select 
          value={filters.status} 
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="approved">Aprobado</option>
          <option value="rejected">Rechazado</option>
        </select>

        <button onClick={loadEvidences} className="btn-secondary">
          Aplicar Filtros
        </button>
      </div>

      {/* Lista de evidencias */}
      <div className="evidences-grid">
        {evidences.length > 0 ? (
          evidences.map(evidence => (
            <div key={evidence.id} className="evidence-card">
              <div className="evidence-header">
                <h3>{evidence.courseName}</h3>
                {getStatusBadge(evidence.status)}
              </div>
              
              <div className="evidence-details">
                <p><strong>Institución:</strong> {evidence.institution}</p>
                <p><strong>Fecha:</strong> {new Date(evidence.date).toLocaleDateString()}</p>
                <p><strong>Horas:</strong> {evidence.hours} horas</p>
                <p><strong>Profesor:</strong> {evidence.professor?.name}</p>
                
                {evidence.feedback && (
                  <div className="evidence-feedback">
                    <strong>Feedback:</strong> {evidence.feedback}
                  </div>
                )}
              </div>

              <div className="evidence-actions">
                {evidence.fileUrl && (
                  <a 
                    href={evidence.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    Ver Archivo
                  </a>
                )}
                
                {canReview && evidence.status === 'pending' && (
                  <button 
                    onClick={() => openReviewModal(evidence)}
                    className="btn-primary"
                  >
                    Revisar
                  </button>
                )}

                {isOwner(evidence) && evidence.status === 'rejected' && (
                  <Link 
                    to={`/evidence/edit/${evidence.id}`}
                    className="btn-primary"
                  >
                    Corregir
                  </Link>
                )}

                {(isOwner(evidence) || canReview) && (
                  <Link 
                    to={`/evidence/${evidence.id}`}
                    className="btn-secondary"
                  >
                    Detalles
                  </Link>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No se encontraron evidencias</p>
            {hasRole('professor') && (
              <Link to="/evidence/create" className="btn-primary">
                Registrar primera evidencia
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Modal de revisión */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Revisar Evidencia"
      >
        {selectedEvidence && (
          <form onSubmit={handleReviewSubmit}>
            <div className="evidence-preview">
              <h4>Información de la Evidencia</h4>
              <p><strong>Curso:</strong> {selectedEvidence.courseName}</p>
              <p><strong>Institución:</strong> {selectedEvidence.institution}</p>
              <p><strong>Horas:</strong> {selectedEvidence.hours}</p>
              <p><strong>Profesor:</strong> {selectedEvidence.professor?.name}</p>
              
              {selectedEvidence.fileUrl && (
                <a 
                  href={selectedEvidence.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="file-link"
                >
                  📎 Ver archivo adjunto
                </a>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="reviewStatus">Decisión</label>
              <select
                id="reviewStatus"
                value={reviewData.status}
                onChange={(e) => setReviewData(prev => ({ ...prev, status: e.target.value }))}
                required
              >
                <option value="approved">Aprobar</option>
                <option value="rejected">Rechazar</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="feedback">Comentarios *</label>
              <textarea
                id="feedback"
                value={reviewData.feedback}
                onChange={(e) => setReviewData(prev => ({ ...prev, feedback: e.target.value }))}
                required
                rows="4"
                placeholder="Proporcione comentarios sobre la evidencia..."
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
        )}
      </Modal>
    </div>
  );
};

export default EvidenceList;