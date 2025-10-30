import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './styles/navbar.css';

const Navbar = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
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

  const getRoleDisplay = (role) => {
    const roleMap = {
      admin: 'Administrador',
      coordinator: 'Coordinador',
      professor: 'Profesor'
    };
    return roleMap[role] || role;
  };

  return (
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
            <Link 
              to="/profile" 
              className="dropdown-link"
              onClick={() => setIsUserDropdownOpen(false)}
            >
              👤 Mi Perfil
            </Link>
            
            <Link 
              to="/settings" 
              className="dropdown-link"
              onClick={() => setIsUserDropdownOpen(false)}
            >
              ⚙️ Configuración
            </Link>
            
            {(hasRole('admin') || hasRole('coordinator')) && (
              <Link 
                to="/admin" 
                className="dropdown-link"
                onClick={() => setIsUserDropdownOpen(false)}
              >
                🛠️ Panel Admin
              </Link>
            )}
            
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
  );
};

export default Navbar;