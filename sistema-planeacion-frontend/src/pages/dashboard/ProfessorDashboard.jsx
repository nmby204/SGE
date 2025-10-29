import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { planningService } from '../../services/planningService';
import { progressService } from '../../services/progressService';
import { evidenceService } from '../../services/evidenceService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import '../../styles/evidence-styles.css';


const ProfessorDashboard = () => {
  const [stats, setStats] = useState({
    myPlannings: 0,
    pendingPlannings: 0,
    approvedEvidences: 0,
    averageProgress: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentItems, setRecentItems] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [plannings, progresses, evidences] = await Promise.all([
        planningService.getPlannings(),
        progressService.getProgressStats(),
        evidenceService.getEvidences()
      ]);

      const myPlannings = plannings.filter(p => p.professorId); // En realidad vendría filtrado del backend
      const pendingPlannings = myPlannings.filter(p => p.status === 'pending');
      const approvedEvidences = evidences.filter(e => e.status === 'approved');

      setStats({
        myPlannings: myPlannings.length,
        pendingPlannings: pendingPlannings.length,
        approvedEvidences: approvedEvidences.length,
        averageProgress: progresses.averageProgress || 0
      });

      // Items recientes
      const recent = [
        ...myPlannings.slice(0, 3).map(p => ({
          id: p.id,
          type: 'planning',
          title: p.course?.name,
          status: p.status,
          time: 'Reciente'
        })),
        ...evidences.slice(0, 2).map(e => ({
          id: e.id,
          type: 'evidence',
          title: e.courseName,
          status: e.status,
          time: 'Reciente'
        }))
      ];
      setRecentItems(recent);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Cargando tu información..." />;
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { class: 'status-pending', text: 'Pendiente' },
      approved: { class: 'status-approved', text: 'Aprobado' },
      adjustments_required: { class: 'status-adjustments', text: 'Ajustes' },
      rejected: { class: 'status-rejected', text: 'Rechazado' }
    };
    
    const statusInfo = statusMap[status] || { class: 'status-default', text: status };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  return (
    <div className="professor-dashboard">
      {/* Estadísticas personales */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Mis Planeaciones</h3>
          <p className="stat-number">{stats.myPlannings}</p>
          <Link to="/planning" className="stat-link">Ver todas</Link>
        </div>

        <div className="stat-card">
          <h3>Pendientes de Revisión</h3>
          <p className="stat-number">{stats.pendingPlannings}</p>
          <Link to="/planning?status=pending" className="stat-link">Ver detalles</Link>
        </div>

        <div className="stat-card">
          <h3>Evidencias Aprobadas</h3>
          <p className="stat-number">{stats.approvedEvidences}</p>
          <Link to="/evidence" className="stat-link">Mis evidencias</Link>
        </div>

        <div className="stat-card">
          <h3>Progreso Promedio</h3>
          <p className="stat-number">{stats.averageProgress}%</p>
          <Link to="/progress" className="stat-link">Ver avances</Link>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="quick-actions">
        <h2>Acciones Rápidas</h2>
        <div className="actions-grid">
          <Link to="/planning/create" className="action-card">
            <h3>Nueva Planeación</h3>
            <p>Crear una nueva planeación didáctica</p>
          </Link>

          <Link to="/progress/create" className="action-card">
            <h3>Registrar Avance</h3>
            <p>Agregar avance parcial de planeación</p>
          </Link>

          <Link to="/evidence/create" className="action-card">
            <h3>Subir Evidencia</h3>
            <p>Registrar evidencia de capacitación</p>
          </Link>

          <Link to="/planning" className="action-card">
            <h3>Mis Planeaciones</h3>
            <p>Ver y gestionar todas mis planeaciones</p>
          </Link>
        </div>
      </div>

      {/* Items recientes */}
      <div className="recent-items">
        <h2>Actividad Reciente</h2>
        {recentItems.length > 0 ? (
          <div className="recent-list">
            {recentItems.map(item => (
              <div key={item.id} className="recent-item">
                <div className="recent-type">
                  {item.type === 'planning' ? '📚' : '📋'}
                </div>
                <div className="recent-info">
                  <h4>{item.title}</h4>
                  <div className="recent-meta">
                    {getStatusBadge(item.status)}
                    <span className="recent-time">{item.time}</span>
                  </div>
                </div>
                <div className="recent-actions">
                  <Link 
                    to={item.type === 'planning' ? `/planning/${item.id}` : `/evidence/${item.id}`}
                    className="btn-secondary"
                  >
                    Ver
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay actividad reciente</p>
        )}
      </div>
    </div>
  );
};

export default ProfessorDashboard;