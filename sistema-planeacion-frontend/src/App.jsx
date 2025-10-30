import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import PlanningList from './pages/planning/PlanningList';
import CreatePlanning from './pages/planning/CreatePlanning';
import EditPlanning from './pages/planning/EditPlanning'; // ✅ IMPORTAR EL NUEVO COMPONENTE
import PlanningDetail from './pages/planning/PlanningDetail';
import ProgressList from './pages/progress/ProgressList';
import CreateProgress from './pages/progress/CreateProgress';
import EvidenceList from './pages/evidence/EvidenceList';
import CreateEvidence from './pages/evidence/CreateEvidence';
import ReportsDashboard from './pages/reports/ReportsDashboard';
import UserList from './pages/users/UserList';
import Navbar from './components/Layout/Navbar';
import LoadingSpinner from './components/Common/LoadingSpinner';
import './App.css';

// Componente para rutas protegidas
const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Componente para redirección inicial
const RootRedirect = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Si está autenticado, redirigir al dashboard
  return <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Ruta raíz - redirige según autenticación */}
            <Route path="/" element={<RootRedirect />} />
            
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Rutas protegidas con layout */}
            <Route path="/*" element={
              <ProtectedRoute>
                <LayoutWrapper />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

const LayoutWrapper = () => {
  const { user } = useAuth();
  
  return (
    <div className="layout">
      <Navbar user={user} />
      <main className="main-content">
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Planeaciones */}
          <Route path="planning" element={<PlanningList />} />
          <Route path="planning/create" element={
            <ProtectedRoute roles={['professor']}>
              <CreatePlanning />
            </ProtectedRoute>
          } />
          {/* ✅ NUEVA RUTA PARA EDITAR PLANEACIONES */}
          <Route path="planning/edit/:id" element={
            <ProtectedRoute roles={['professor']}>
              <EditPlanning />
            </ProtectedRoute>
          } />
          <Route path="planning/:id" element={<PlanningDetail />} />
          
          {/* Avances */}
          <Route path="progress" element={<ProgressList />} />
          <Route path="progress/create" element={<CreateProgress />} />
          
          {/* Evidencias */}
          <Route path="evidence" element={<EvidenceList />} />
          <Route path="evidence/create" element={
            <ProtectedRoute roles={['professor']}>
              <CreateEvidence />
            </ProtectedRoute>
          } />
          
          {/* Reportes */}
          <Route path="reports" element={
            <ProtectedRoute roles={['admin', 'coordinator']}>
              <ReportsDashboard />
            </ProtectedRoute>
          } />
          
          {/* Usuarios */}
          <Route path="users" element={
            <ProtectedRoute roles={['admin', 'coordinator']}>
              <UserList />
            </ProtectedRoute>
          } />
          
          {/* Ruta por defecto para rutas no encontradas dentro del layout */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;