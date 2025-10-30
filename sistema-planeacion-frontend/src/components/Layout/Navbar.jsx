import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './styles/navbar.css';

const Navbar = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsUserDropdownOpen(false);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
    setIsUserDropdownOpen(false);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      admin: 'Administrador',
      coordinator: 'Coordinador',
      professor: 'Profesor'
    };
    return roleMap[role] || role;
  };

  return (
    <>
      <nav className="navbar">
        {/* Marca */}
        <div className="nav-brand">
          <Link to="/dashboard">Sistema de Planeación</Link>
        </div>

        {/* Navegación principal */}
        <div className="nav-links">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/planning" className="nav-link">Planeaciones</Link>
          <Link to="/progress" className="nav-link">Avances</Link>
          <Link to="/evidence" className="nav-link">Evidencias</Link>
          
          {(hasRole('admin') || hasRole('coordinator')) && (
            <Link to="/reports" className="nav-link">Reportes</Link>
          )}

          {(hasRole('admin') || hasRole('coordinator')) && (
            <Link to="/users" className="nav-link">Usuarios</Link>
          )}
        </div>

        {/* Área de usuario con dropdown */}
        <div className="nav-user" ref={dropdownRef}>
          <div className="user-info" onClick={toggleUserDropdown}>
            <span>{user?.name}</span>
            <span className="role-badge">{user?.role?.charAt(0).toUpperCase()}</span>
          </div>

          {/* Menú desplegable del usuario */}
          <div className={`user-dropdown ${isUserDropdownOpen ? 'show' : ''}`}>
            <div className="dropdown-header">
              <strong>{user?.name}</strong>
              <span>{getRoleDisplay(user?.role)}</span>
            </div>
            
            <div className="dropdown-links">
              <button 
                onClick={openProfileModal}
                className="dropdown-link"
              >
                👤 Mi Perfil
              </button>
              
              
              <button 
                onClick={handleLogout}
                className="dropdown-link logout"
              >
                🚪 Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Botón de cerrar sesión (solo desktop) */}
          <button onClick={handleLogout} className="logout-btn">
            🚪 Salir
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
            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
              📊 Dashboard
            </Link>
            
            <Link to="/planning" onClick={() => setIsMenuOpen(false)}>
              📚 Planeaciones
            </Link>
            
            {hasRole('professor') && (
              <Link to="/planning/create" onClick={() => setIsMenuOpen(false)}>
                ➕ Nueva Planeación
              </Link>
            )}
            
            <Link to="/progress" onClick={() => setIsMenuOpen(false)}>
              📈 Avances
            </Link>
            
            <Link to="/evidence" onClick={() => setIsMenuOpen(false)}>
              📋 Evidencias
            </Link>
            
            {hasRole('professor') && (
              <Link to="/evidence/create" onClick={() => setIsMenuOpen(false)}>
                ➕ Nueva Evidencia
              </Link>
            )}
            
            {(hasRole('admin') || hasRole('coordinator')) && (
              <Link to="/reports" onClick={() => setIsMenuOpen(false)}>
                📊 Reportes
              </Link>
            )}
            
            {(hasRole('admin') || hasRole('coordinator')) && (
              <Link to="/users" onClick={() => setIsMenuOpen(false)}>
                👥 Usuarios
              </Link>
            )}
            
            <button onClick={openProfileModal}>
              👤 Mi Perfil
            </button>
            
            <div className="user-mobile-info">
              <strong>{user?.name}</strong>
              <span>{getRoleDisplay(user?.role)}</span>
            </div>
            
            <button onClick={handleLogout}>
              🚪 Cerrar Sesión
            </button>
          </div>
        )}
      </nav>

      {/* Modal de Perfil */}
      {isProfileModalOpen && (
        <div className="modal-overlay" onClick={closeProfileModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👤 Información del Perfil</h2>
              <button className="modal-close" onClick={closeProfileModal}>
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="profile-info">
                <div className="profile-avatar">
                  <div className="avatar-circle">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                
                <div className="profile-details">
                  <div className="profile-field">
                    <label>Nombre completo:</label>
                    <span>{user?.name || 'No disponible'}</span>
                  </div>
                  
                  <div className="profile-field">
                    <label>Correo electrónico:</label>
                    <span>{user?.email || 'No disponible'}</span>
                  </div>
                  
                  <div className="profile-field">
                    <label>Rol en el sistema:</label>
                    <span className="role-tag">{getRoleDisplay(user?.role)}</span>
                  </div>
                  
                  <div className="profile-field">
                    <label>Estado:</label>
                    <span className="status-active">🟢 Activo</span>
                  </div>
                  
                  <div className="profile-field">
                    <label>ID de usuario:</label>
                    <span className="user-id">{user?.id || 'No disponible'}</span>
                  </div>
                </div>
              </div>
              
              <div className="profile-actions">
                
                <button className="btn-secondary" onClick={closeProfileModal}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;