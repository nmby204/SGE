import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { evidenceService } from '../../services/evidenceService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Modal from '../../components/Common/Modal';
import FileUpload from '../../components/Common/FileUpload';
import './styles/evidence.css';

const EvidenceList = () => {
  const [evidences, setEvidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: ''
  });
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [reviewData, setReviewData] = useState({
    status: 'approved',
    feedback: ''
  });
  
  // Estados para el modal de creación
  const [formData, setFormData] = useState({
    courseName: '',
    institution: '',
    date: '',
    hours: ''
  });
  const [file, setFile] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

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
      loadEvidences();
    } catch (error) {
      console.error('Error enviando revisión:', error);
      alert('Error al enviar la revisión');
    }
  };

  // Funciones para el modal de creación
  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');

    if (!file) {
      setCreateError('Debe subir un archivo de evidencia');
      setCreateLoading(false);
      return;
    }

    try {
      const evidenceData = {
        ...formData,
        file: file,
        hours: parseInt(formData.hours)
      };

      await evidenceService.createEvidence(evidenceData);
      alert('Evidencia registrada exitosamente');
      handleCreateSuccess();
      closeCreateModal();
    } catch (error) {
      console.error('Error creando evidencia:', error);
      setCreateError(error.response?.data?.message || 'Error al registrar la evidencia');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    loadEvidences();
  };

  const openCreateModal = () => {
    setCreateModalOpen(true);
    resetCreateForm();
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    resetCreateForm();
  };

  const resetCreateForm = () => {
    setFormData({
      courseName: '',
      institution: '',
      date: '',
      hours: ''
    });
    setFile(null);
    setCreateError('');
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
          <button 
            onClick={openCreateModal} 
            className="btn-primary"
          >
            Nueva Evidencia
          </button>
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
              <button 
                onClick={openCreateModal} 
                className="btn-primary"
              >
                Registrar primera evidencia
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de creación de evidencia */}
      <Modal
        isOpen={createModalOpen}
        onClose={closeCreateModal}
        title="Registrar Nueva Evidencia"
        size="large"
      >
        <div className="create-evidence-modal">
          {createError && (
            <div className="error-message">
              {createError}
            </div>
          )}

          <form onSubmit={handleCreateSubmit} className="evidence-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="courseName">Nombre del Curso/Taller *</label>
                <input
                  type="text"
                  id="courseName"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleCreateChange}
                  required
                  placeholder="Ej: Curso de Actualización Docente"
                />
              </div>

              <div className="form-group">
                <label htmlFor="institution">Institución Emisora *</label>
                <input
                  type="text"
                  id="institution"
                  name="institution"
                  value={formData.institution}
                  onChange={handleCreateChange}
                  required
                  placeholder="Ej: Universidad Nacional"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Fecha del Curso *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleCreateChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="hours">Horas Acreditadas *</label>
                <input
                  type="number"
                  id="hours"
                  name="hours"
                  value={formData.hours}
                  onChange={handleCreateChange}
                  required
                  min="1"
                  placeholder="Ej: 40"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Constancia o Documento Comprobatorio *</label>
              <FileUpload onFileSelect={handleFileSelect} />
              <small>Suba el documento que acredita la capacitación (PDF, imagen, constancia)</small>
            </div>

            <div className="form-note">
              <h4>Nota:</h4>
              <p>
                La evidencia será enviada para revisión por parte de la coordinación. 
                Recibirá una notificación cuando sea aprobada o si se requieren ajustes.
              </p>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={closeCreateModal}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={createLoading || !file}
                className="btn-primary"
              >
                {createLoading ? (
                  <>
                    <LoadingSpinner size="small" />
                    Registrando...
                  </>
                ) : (
                  'Registrar Evidencia'
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>

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