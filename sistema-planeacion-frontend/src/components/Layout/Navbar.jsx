import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/dashboard">Sistema de Planeación</Link>
      </div>

      <div className="nav-links">
        {/* Dashboard */}
        <Link to="/dashboard" className="nav-link">Dashboard</Link>

        {/* Planeaciones - Visible para todos */}
        <Link to="/planning" className="nav-link">Planeaciones</Link>
        
        {/* Crear planeación - Solo profesores */}
        {hasRole('professor') && (
          <Link to="/planning/create" className="nav-link">Nueva Planeación</Link>
        )}

        {/* Avances */}
        <Link to="/progress" className="nav-link">Avances</Link>

        {/* Evidencias */}
        <Link to="/evidence" className="nav-link">Evidencias</Link>
        
        {/* Crear evidencia - Solo profesores */}
        {hasRole('professor') && (
          <Link to="/evidence/create" className="nav-link">Nueva Evidencia</Link>
        )}

        {/* Reportes - Solo coordinador y admin */}
        {(hasRole('admin') || hasRole('coordinator')) && (
          <Link to="/reports" className="nav-link">Reportes</Link>
        )}

        {/* Usuarios - Solo admin y coordinador */}
        {(hasRole('admin') || hasRole('coordinator')) && (
          <Link to="/users" className="nav-link">Usuarios</Link>
        )}
      </div>

      <div className="nav-user">
        <span className="user-info">
          {user?.name} ({user?.role})
        </span>
        <button onClick={handleLogout} className="logout-btn">
          Cerrar Sesión
        </button>
      </div>

      {/* Menú móvil */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        ☰
      </button>

      {isMenuOpen && (
        <div className="mobile-menu">
          <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
          <Link to="/planning" onClick={() => setIsMenuOpen(false)}>Planeaciones</Link>
          {hasRole('professor') && (
            <Link to="/planning/create" onClick={() => setIsMenuOpen(false)}>Nueva Planeación</Link>
          )}
          <Link to="/progress" onClick={() => setIsMenuOpen(false)}>Avances</Link>
          <Link to="/evidence" onClick={() => setIsMenuOpen(false)}>Evidencias</Link>
          {hasRole('professor') && (
            <Link to="/evidence/create" onClick={() => setIsMenuOpen(false)}>Nueva Evidencia</Link>
          )}
          {(hasRole('admin') || hasRole('coordinator')) && (
            <Link to="/reports" onClick={() => setIsMenuOpen(false)}>Reportes</Link>
          )}
          {(hasRole('admin') || hasRole('coordinator')) && (
            <Link to="/users" onClick={() => setIsMenuOpen(false)}>Usuarios</Link>
          )}
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;