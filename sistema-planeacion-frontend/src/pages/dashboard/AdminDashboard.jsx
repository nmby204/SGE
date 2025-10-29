import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import { userService } from '../../services/userService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import '../../styles/evidence-styles.css';


const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPlannings: 0,
    pendingReviews: 0,
    complianceRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // En una implementación real, aquí harías llamadas a endpoints específicos del dashboard
      const [users, planningsReport] = await Promise.all([
        userService.getUsers(),
        reportService.getPlanningCompliance()
      ]);

      setStats({
        totalUsers: users.length,
        totalPlannings: planningsReport.total || 0,
        pendingReviews: planningsReport.pending || 0,
        complianceRate: planningsReport.complianceRate || 0
      });

      // Datos de ejemplo para actividades recientes
      setRecentActivities([
        { id: 1, type: 'user', message: 'Nuevo profesor registrado', time: 'Hace 5 min' },
        { id: 2, type: 'planning', message: 'Planeación requiere revisión', time: 'Hace 15 min' },
        { id: 3, type: 'evidence', message: 'Evidencia aprobada', time: 'Hace 1 hora' }
      ]);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Cargando estadísticas..." />;
  }

  return (
    <div className="admin-dashboard">
      {/* Estadísticas rápidas */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Usuarios</h3>
          <p className="stat-number">{stats.totalUsers}</p>
          <Link to="/users" className="stat-link">Gestionar usuarios</Link>
        </div>

        <div className="stat-card">
          <h3>Planeaciones Totales</h3>
          <p className="stat-number">{stats.totalPlannings}</p>
          <Link to="/planning" className="stat-link">Ver planeaciones</Link>
        </div>

        <div className="stat-card">
          <h3>Revisiones Pendientes</h3>
          <p className="stat-number">{stats.pendingReviews}</p>
          <Link to="/planning" className="stat-link">Revisar</Link>
        </div>

        <div className="stat-card">
          <h3>Tasa de Cumplimiento</h3>
          <p className="stat-number">{stats.complianceRate}%</p>
          <Link to="/reports" className="stat-link">Ver reportes</Link>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="quick-actions">
        <h2>Acciones Rápidas</h2>
        <div className="actions-grid">
          <Link to="/users" className="action-card">
            <h3>Gestionar Usuarios</h3>
            <p>Agregar, editar o eliminar usuarios del sistema</p>
          </Link>

          <Link to="/reports" className="action-card">
            <h3>Ver Reportes</h3>
            <p>Reportes detallados y exportación de datos</p>
          </Link>

          <Link to="/planning" className="action-card">
            <h3>Revisar Planeaciones</h3>
            <p>Aprobar o solicitar ajustes en planeaciones</p>
          </Link>

          <Link to="/evidence" className="action-card">
            <h3>Revisar Evidencias</h3>
            <p>Validar evidencias de capacitación</p>
          </Link>
        </div>
      </div>

      {/* Actividades recientes */}
      <div className="recent-activities">
        <h2>Actividades Recientes</h2>
        <div className="activities-list">
          {recentActivities.map(activity => (
            <div key={activity.id} className="activity-item">
              <span className={`activity-type ${activity.type}`}></span>
              <div className="activity-content">
                <p>{activity.message}</p>
                <span className="activity-time">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;