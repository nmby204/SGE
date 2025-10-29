import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Modal from '../../components/Common/Modal';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: ''
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const { user: currentUser, hasRole } = useAuth();

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      const data = await userService.getUsers(filters);
      setUsers(data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
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

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await userService.deleteUser(userToDelete.id);
      alert('Usuario eliminado exitosamente');
      setDeleteModalOpen(false);
      loadUsers(); // Recargar lista
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      alert('Error al eliminar el usuario');
    }
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      admin: { class: 'role-admin', text: 'Administrador' },
      coordinator: { class: 'role-coordinator', text: 'Coordinador' },
      professor: { class: 'role-professor', text: 'Profesor' }
    };
    
    const roleInfo = roleMap[role] || { class: 'role-default', text: role };
    return <span className={`role-badge ${roleInfo.class}`}>{roleInfo.text}</span>;
  };

  const getStatusBadge = (isActive) => {
    return isActive ? 
      <span className="status-badge status-approved">Activo</span> :
      <span className="status-badge status-rejected">Inactivo</span>;
  };

  // Solo admin puede eliminar usuarios
  const canDelete = hasRole('admin');
  // Solo admin puede ver todos los usuarios, coordinador solo ve profesores
  const filteredUsers = hasRole('admin') ? users : users.filter(u => u.role === 'professor');

  if (loading) {
    return <LoadingSpinner text="Cargando usuarios..." />;
  }

  return (
    <div className="user-list">
      <div className="page-header">
        <h1>Gestión de Usuarios</h1>
        {hasRole('admin') && (
          <Link to="/register" className="btn-primary">
            Nuevo Usuario
          </Link>
        )}
      </div>

      {/* Filtros */}
      <div className="filters">
        <select 
          value={filters.role} 
          onChange={(e) => handleFilterChange('role', e.target.value)}
        >
          <option value="">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="coordinator">Coordinador</option>
          <option value="professor">Profesor</option>
        </select>

        <button onClick={loadUsers} className="btn-secondary">
          Aplicar Filtros
        </button>
      </div>

      {/* Lista de usuarios */}
      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha de Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <strong>{user.name}</strong>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{getStatusBadge(user.isActive)}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="user-actions">
                      <Link 
                        to={`/users/${user.id}`}
                        className="btn-secondary small"
                      >
                        Ver
                      </Link>
                      
                      {hasRole('admin') && user.id !== currentUser.id && (
                        <button 
                          onClick={() => openDeleteModal(user)}
                          className="btn-danger small"
                          disabled={!canDelete}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-table">
                  No se encontraron usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Eliminación"
        size="small"
      >
        {userToDelete && (
          <div>
            <p>
              ¿Está seguro de que desea eliminar al usuario <strong>{userToDelete.name}</strong>?
            </p>
            <p className="warning-text">
              Esta acción no se puede deshacer y el usuario perderá el acceso al sistema.
            </p>
            
            <div className="form-actions">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDelete}
                className="btn-danger"
              >
                Eliminar Usuario
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserList;