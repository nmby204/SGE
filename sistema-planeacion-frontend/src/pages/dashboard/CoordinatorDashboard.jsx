import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import { planningService } from '../../services/planningService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import CalendarWidget from '../../components/Calendar/CalendarWidget';
import './styles/dashboard.css';

const CoordinatorDashboard = () => {
  const [stats, setStats] = useState({
    pendingPlannings: 0,
    pendingEvidences: 0,
    averageProgress: 0,
    approvedCourses: 0
  });
  const [loading, setLoading] = useState(true);
  const [pendingItems, setPendingItems] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [plannings, evidences, progressReport] = await Promise.all([
        planningService.getPlannings({ status: 'pending' }),
        // evidenceService.getEvidences({ status: 'pending' }),
        reportService.getPartialProgressReport()
      ]);

      setStats({
        pendingPlannings: plannings.length,
        pendingEvidences: 0, // evidences.length
        averageProgress: progressReport.averageProgress || 0,
        approvedCourses: 0 // Esto vendría de otro endpoint
      });

      // Items pendientes de revisión
      const pending = [
        ...plannings.slice(0, 5).map(p => ({
          id: p.id,
          type: 'planning',
          title: `Planeación - ${p.course?.name}`,
          professor: p.professor?.name,
          time: 'Pendiente'
        }))
      ];
      setPendingItems(pending);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Cargando dashboard..." />;
  }

  return (
    <div className="coordinator-dashboard">
      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Planeaciones Pendientes</h3>
          <p className="stat-number">{stats.pendingPlannings}</p>
          <Link to="/planning?status=pending" className="stat-link">Revisar</Link>
        </div>

        <div className="stat-card">
          <h3>Evidencias Pendientes</h3>
          <p className="stat-number">{stats.pendingEvidences}</p>
          <Link to="/evidence?status=pending" className="stat-link">Validar</Link>
        </div>

        <div className="stat-card">
          <h3>Progreso Promedio</h3>
          <p className="stat-number">{stats.averageProgress}%</p>
          <Link to="/progress" className="stat-link">Ver avances</Link>
        </div>

        <div className="stat-card">
          <h3>Cursos Aprobados</h3>
          <p className="stat-number">{stats.approvedCourses}</p>
          <Link to="/reports" className="stat-link">Ver reportes</Link>
        </div>
      </div>

      {/* Calendario */}
      <div className="dashboard-section">
        <CalendarWidget />
      </div>

      {/* Pendientes de revisión */}
      <div className="pending-review">
        <h2>Pendientes de Revisión</h2>
        {pendingItems.length > 0 ? (
          <div className="pending-list">
            {pendingItems.map(item => (
              <div key={item.id} className="pending-item">
                <div className="pending-info">
                  <h4>{item.title}</h4>
                  <p>Profesor: {item.professor}</p>
                </div>
                <div className="pending-actions">
                  <Link 
                    to={item.type === 'planning' ? `/planning/${item.id}` : `/evidence/${item.id}`}
                    className="btn-secondary"
                  >
                    Revisar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay items pendientes de revisión</p>
        )}
      </div>

      {/* Acciones rápidas */}
      <div className="quick-actions">
        <h2>Acciones Rápidas</h2>
        <div className="actions-grid">
          <Link to="/planning?status=pending" className="action-card">
            <h3>Revisar Planeaciones</h3>
            <p>Aprobar o solicitar ajustes en planeaciones pendientes</p>
          </Link>

          <Link to="/evidence?status=pending" className="action-card">
            <h3>Validar Evidencias</h3>
            <p>Revisar y aprobar evidencias de capacitación</p>
          </Link>

          <Link to="/reports" className="action-card">
            <h3>Generar Reportes</h3>
            <p>Reportes de cumplimiento y avances</p>
          </Link>

          <Link to="/users" className="action-card">
            <h3>Ver Profesores</h3>
            <p>Gestionar información de profesores</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;