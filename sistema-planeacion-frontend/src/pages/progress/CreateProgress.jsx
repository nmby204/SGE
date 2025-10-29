import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { progressService } from '../../services/progressService';
import { planningService } from '../../services/planningService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const CreateProgress = () => {
  const [formData, setFormData] = useState({
    planningId: '',
    partial: '',
    progressPercentage: '',
    status: '',
    achievements: '',
    challenges: '',
    adjustments: ''
  });
  const [plannings, setPlannings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPlannings, setLoadingPlannings] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener planningId de la ubicación si viene de una planeación específica
  useEffect(() => {
    if (location.state?.planningId) {
      setFormData(prev => ({
        ...prev,
        planningId: location.state.planningId
      }));
    }
    loadPlannings();
  }, [location]);

  const loadPlannings = async () => {
    try {
      const data = await planningService.getPlannings();
      setPlannings(data);
    } catch (error) {
      console.error('Error cargando planeaciones:', error);
    } finally {
      setLoadingPlannings(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-calcular status basado en porcentaje
    if (name === 'progressPercentage') {
      const percentage = parseInt(value) || 0;
      let status = '';
      
      if (percentage >= 90) status = 'fulfilled';
      else if (percentage >= 60) status = 'partial';
      else status = 'unfulfilled';
      
      setFormData(prev => ({
        ...prev,
        status: status
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await progressService.createProgress(formData);
      alert('Avance registrado exitosamente');
      navigate('/progress');
    } catch (error) {
      console.error('Error registrando avance:', error);
      setError(error.response?.data?.message || 'Error al registrar el avance');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      fulfilled: 'Cumplido (90-100%)',
      partial: 'Parcialmente Cumplido (60-89%)',
      unfulfilled: 'No Cumplido (0-59%)'
    };
    return statusMap[status] || status;
  };

  if (loadingPlannings) {
    return <LoadingSpinner text="Cargando planeaciones..." />;
  }

  return (
    <div className="create-progress">
      <div className="page-header">
        <h1>Registrar Avance Parcial</h1>
        <button onClick={() => navigate('/progress')} className="btn-secondary">
          Volver a Avances
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="progress-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="planningId">Planeación *</label>
            <select
              id="planningId"
              name="planningId"
              value={formData.planningId}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar planeación</option>
              {plannings.map(planning => (
                <option key={planning.id} value={planning.id}>
                  {planning.course?.name} - Parcial {planning.partial} ({planning.cycle})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="partial">Parcial *</label>
            <select
              id="partial"
              name="partial"
              value={formData.partial}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar parcial</option>
              <option value="1">Parcial 1</option>
              <option value="2">Parcial 2</option>
              <option value="3">Parcial 3</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="progressPercentage">Porcentaje de Avance *</label>
            <input
              type="number"
              id="progressPercentage"
              name="progressPercentage"
              value={formData.progressPercentage}
              onChange={handleChange}
              required
              min="0"
              max="100"
              placeholder="0-100"
            />
            <small>Porcentaje del contenido que se ha cubierto</small>
          </div>

          <div className="form-group">
            <label>Estado Calculado</label>
            <div className="status-display">
              {formData.status ? (
                <span className={`status-badge status-${formData.status}`}>
                  {getStatusText(formData.status)}
                </span>
              ) : (
                <span className="status-placeholder">Se calculará automáticamente</span>
              )}
            </div>
            <input type="hidden" name="status" value={formData.status} />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="achievements">Logros Alcanzados</label>
          <textarea
            id="achievements"
            name="achievements"
            value={formData.achievements}
            onChange={handleChange}
            rows="3"
            placeholder="Describa los principales logros alcanzados en este parcial..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="challenges">Desafíos Encontrados</label>
          <textarea
            id="challenges"
            name="challenges"
            value={formData.challenges}
            onChange={handleChange}
            rows="3"
            placeholder="Describa los desafíos o dificultades encontradas..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="adjustments">Ajustes Realizados</label>
          <textarea
            id="adjustments"
            name="adjustments"
            value={formData.adjustments}
            onChange={handleChange}
            rows="3"
            placeholder="Describa los ajustes realizados a la planeación original..."
          />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/progress')}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Registrando Avance...' : 'Registrar Avance'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProgress;