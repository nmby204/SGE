import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { planningService } from '../../services/planningService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const PlanningList = () => {
  const [plannings, setPlannings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    partial: '',
    cycle: ''
  });
  const { user, hasRole } = useAuth();

  useEffect(() => {
    loadPlannings();
  }, [filters]);

  const loadPlannings = async () => {
    try {
      const data = await planningService.getPlannings(filters);
      setPlannings(data);
    } catch (error) {
      console.error('Error cargando planeaciones:', error);
      alert('Error al cargar las planeaciones');
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

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { class: 'status-pending', text: 'Pendiente' },
      approved: { class: 'status-approved', text: 'Aprobado' },
      adjustments_required: { class: 'status-adjustments', text: 'Ajustes Requeridos' }
    };
    
    const statusInfo = statusMap[status] || { class: 'status-default', text: status };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const canReview = hasRole(['admin', 'coordinator']);

  if (loading) {
    return <LoadingSpinner text="Cargando planeaciones..." />;
  }

  return (
    <div className="planning-list">
      <div className="page-header">
        <h1>Planeaciones Didácticas</h1>
        {hasRole('professor') && (
          <Link to="/planning/create" className="btn-primary">
            Nueva Planeación
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
          <option value="adjustments_required">Ajustes Requeridos</option>
        </select>

        <select 
          value={filters.partial} 
          onChange={(e) => handleFilterChange('partial', e.target.value)}
        >
          <option value="">Todos los parciales</option>
          <option value="1">Parcial 1</option>
          <option value="2">Parcial 2</option>
          <option value="3">Parcial 3</option>
        </select>

        <input
          type="text"
          placeholder="Ciclo escolar"
          value={filters.cycle}
          onChange={(e) => handleFilterChange('cycle', e.target.value)}
        />

        <button onClick={loadPlannings} className="btn-secondary">
          Aplicar Filtros
        </button>
      </div>

      {/* Lista de planeaciones */}
      <div className="plannings-grid">
        {plannings.length > 0 ? (
          plannings.map(planning => (
            <div key={planning.id} className="planning-card">
              <div className="planning-header">
                <h3>{planning.course?.name || 'Materia no especificada'}</h3>
                {getStatusBadge(planning.status)}
              </div>
              
              <div className="planning-details">
                <p><strong>Parcial:</strong> {planning.partial}</p>
                <p><strong>Ciclo:</strong> {planning.cycle}</p>
                <p><strong>Profesor:</strong> {planning.professor?.name}</p>
                <p><strong>Fecha:</strong> {new Date(planning.createdAt).toLocaleDateString()}</p>
              </div>

              {planning.feedback && (
                <div className="planning-feedback">
                  <strong>Feedback:</strong> {planning.feedback}
                </div>
              )}

              <div className="planning-actions">
                <Link to={`/planning/${planning.id}`} className="btn-secondary">
                  Ver Detalles
                </Link>
                
                {canReview && planning.status === 'pending' && (
                  <Link 
                    to={`/planning/${planning.id}`} 
                    className="btn-primary"
                  >
                    Revisar
                  </Link>
                )}

                {hasRole('professor') && planning.status === 'adjustments_required' && (
                  <Link 
                    to={`/planning/${planning.id}`} 
                    className="btn-primary"
                  >
                    Corregir
                  </Link>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No se encontraron planeaciones</p>
            {hasRole('professor') && (
              <Link to="/planning/create" className="btn-primary">
                Crear primera planeación
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanningList;