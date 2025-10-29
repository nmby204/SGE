import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { progressService } from '../../services/progressService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const ProgressList = () => {
  const [progress, setProgress] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    partial: '',
    courseId: ''
  });
  const { hasRole } = useAuth();

  useEffect(() => {
    loadProgressData();
  }, [filters]);

  const loadProgressData = async () => {
    try {
      const [progressData, statsData] = await Promise.all([
        progressService.getProgressStats(filters), // Esto debería devolver lista de avances
        progressService.getProgressStats(filters)
      ]);
      
      setProgress(progressData || []);
      setStats(statsData || {});
    } catch (error) {
      console.error('Error cargando avances:', error);
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
      fulfilled: { class: 'status-approved', text: 'Cumplido' },
      partial: { class: 'status-pending', text: 'Parcial' },
      unfulfilled: { class: 'status-rejected', text: 'No Cumplido' }
    };
    
    const statusInfo = statusMap[status] || { class: 'status-default', text: status };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  if (loading) {
    return <LoadingSpinner text="Cargando avances..." />;
  }

  return (
    <div className="progress-list">
      <div className="page-header">
        <h1>Avances Parciales</h1>
        <Link to="/progress/create" className="btn-primary">
          Registrar Avance
        </Link>
      </div>

      {/* Estadísticas rápidas */}
      {stats && (
        <div className="stats-overview">
          <div className="stat-item">
            <span className="stat-label">Progreso Promedio</span>
            <span className="stat-value">{stats.averageProgress || 0}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Cumplidos</span>
            <span className="stat-value">{stats.fulfilled || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Parcialmente Cumplidos</span>
            <span className="stat-value">{stats.partial || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">No Cumplidos</span>
            <span className="stat-value">{stats.unfulfilled || 0}</span>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="filters">
        <select 
          value={filters.partial} 
          onChange={(e) => handleFilterChange('partial', e.target.value)}
        >
          <option value="">Todos los parciales</option>
          <option value="1">Parcial 1</option>
          <option value="2">Parcial 2</option>
          <option value="3">Parcial 3</option>
        </select>

        <button onClick={loadProgressData} className="btn-secondary">
          Aplicar Filtros
        </button>
      </div>

      {/* Lista de avances */}
      <div className="progress-grid">
        {progress.length > 0 ? (
          progress.map(item => (
            <div key={item.id} className="progress-card">
              <div className="progress-header">
                <h3>{item.planning?.course?.name || 'Planeación'}</h3>
                <div className="progress-meta">
                  <span className="partial-badge">Parcial {item.partial}</span>
                  {getStatusBadge(item.status)}
                </div>
              </div>

              <div className="progress-main">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${item.progressPercentage}%` }}
                  ></div>
                </div>
                <span className="percentage-text">{item.progressPercentage}%</span>
              </div>

              <div className="progress-details">
                {item.achievements && (
                  <p><strong>Logros:</strong> {item.achievements.substring(0, 100)}...</p>
                )}
                
                {item.challenges && (
                  <p><strong>Desafíos:</strong> {item.challenges.substring(0, 100)}...</p>
                )}

                <p className="progress-date">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="progress-actions">
                <Link to={`/planning/${item.planningId}`} className="btn-secondary">
                  Ver Planeación
                </Link>
                
                {(hasRole(['admin', 'coordinator']) || item.planning?.professorId === item.userId) && (
                  <Link to={`/progress/edit/${item.id}`} className="btn-primary">
                    Editar
                  </Link>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No se encontraron avances registrados</p>
            <Link to="/progress/create" className="btn-primary">
              Registrar primer avance
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressList;