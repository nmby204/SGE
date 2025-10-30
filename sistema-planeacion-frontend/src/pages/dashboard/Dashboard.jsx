import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import CoordinatorDashboard from './CoordinatorDashboard';
import ProfessorDashboard from './ProfessorDashboard';
import LoadingSpinner from '../../components/Common/LoadingSpinner';


const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Cargando dashboard..." />;
  }

  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'coordinator':
        return <CoordinatorDashboard />;
      case 'professor':
        return <ProfessorDashboard />;
      default:
        return <div>Rol no reconocido</div>;
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Bienvenido, {user?.name}</p>
      </div>
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;