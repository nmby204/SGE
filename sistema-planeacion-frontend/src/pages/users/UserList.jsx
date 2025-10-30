import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Modal from '../../components/Common/Modal';
import './UserList.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: ''
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [viewUserModalOpen, setViewUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const { user: currentUser, hasRole } = useAuth();

  // Estado para nuevo usuario
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'professor'
  });

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

  const openAddUserModal = () => {
    setAddUserModalOpen(true);
  };

  const openViewUserModal = async (user) => {
    try {
      // Cargar información completa del usuario
      const userData = await userService.getUserById(user.id);
      setSelectedUser(userData);
      setViewUserModalOpen(true);
    } catch (error) {
      console.error('Error cargando usuario:', error);
      alert('Error al cargar la información del usuario');
    }
  };

  const closeViewUserModal = () => {
    setViewUserModalOpen(false);
    setSelectedUser(null);
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

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await userService.createUser(newUser);
      alert('Usuario creado exitosamente');
      setAddUserModalOpen(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'professor'
      });
      loadUsers(); // Recargar lista
    } catch (error) {
      console.error('Error creando usuario:', error);
      alert('Error al crear el usuario: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleNewUserChange = (field, value) => {
    setNewUser(prev => ({
      ...prev,
      [field]: value
    }));
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

  const getRoleDisplay = (role) => {
    const roleMap = {
      admin: 'Administrador',
      coordinator: 'Coordinador',
      professor: 'Profesor'
    };
    return roleMap[role] || role;
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
          <button onClick={openAddUserModal} className="btn-primary">
            ➕ Nuevo Usuario
          </button>
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
          🔄 Actualizar
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
                      <div className="user-avatar">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <strong>{user.name}</strong>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString('es-MX')}</td>
                  <td>
                    <div className="user-actions">
                      <button 
                        onClick={() => openViewUserModal(user)}
                        className="btn-secondary small"
                      >
                         Ver
                      </button>
                      
                      {hasRole('admin') && user.id !== currentUser.id && (
                        <button 
                          onClick={() => openDeleteModal(user)}
                          className="btn-danger small"
                          disabled={!canDelete}
                        >
                          🗑️ Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-table">
                  No se encontraron usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Agregar Usuario */}
      <Modal
        isOpen={addUserModalOpen}
        onClose={() => setAddUserModalOpen(false)}
        title="➕ Agregar Nuevo Usuario"
        size="medium"
      >
        <form onSubmit={handleAddUser} className="user-form">
          <div className="form-group">
            <label>Nombre completo *</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => handleNewUserChange('name', e.target.value)}
              placeholder="Ingrese el nombre completo"
              required
            />
          </div>

          <div className="form-group">
            <label>Correo electrónico *</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => handleNewUserChange('email', e.target.value)}
              placeholder="usuario@ejemplo.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña *</label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => handleNewUserChange('password', e.target.value)}
              placeholder="Mínimo 6 caracteres"
              minLength="6"
              required
            />
          </div>

          <div className="form-group">
            <label>Rol *</label>
            <select
              value={newUser.role}
              onChange={(e) => handleNewUserChange('role', e.target.value)}
            >
              <option value="professor">Profesor</option>
              <option value="coordinator">Coordinador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="form-actions">
            <button 
              type="button"
              onClick={() => setAddUserModalOpen(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="btn-primary"
            >
              Crear Usuario
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Ver Usuario */}
      <Modal
        isOpen={viewUserModalOpen}
        onClose={closeViewUserModal}
        title="👤 Información del Usuario"
        size="medium"
      >
        {selectedUser && (
          <div className="user-details">
            <div className="user-header">
              <div className="user-avatar-large">
                {selectedUser.name?.charAt(0).toUpperCase()}
              </div>
              <div className="user-basic-info">
                <h3>{selectedUser.name}</h3>
                <p>{selectedUser.email}</p>
              </div>
            </div>

            <div className="user-details-grid">
              <div className="detail-item">
                <label>Rol:</label>
                <span className={`role-tag role-${selectedUser.role}`}>
                  {getRoleDisplay(selectedUser.role)}
                </span>
              </div>

              <div className="detail-item">
                <label>Estado:</label>
                <span className={`status-tag ${selectedUser.isActive ? 'status-active' : 'status-inactive'}`}>
                  {selectedUser.isActive ? '🟢 Activo' : '🔴 Inactivo'}
                </span>
              </div>

              <div className="detail-item">
                <label>Fecha de registro:</label>
                <span>{new Date(selectedUser.createdAt).toLocaleDateString('es-MX', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>

              <div className="detail-item">
                <label>Última actualización:</label>
                <span>{new Date(selectedUser.updatedAt).toLocaleDateString('es-MX', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>

              <div className="detail-item full-width">
                <label>ID de usuario:</label>
                <span className="user-id">{selectedUser.id}</span>
              </div>
            </div>

            <div className="user-actions-modal">
              <button 
                onClick={closeViewUserModal}
                className="btn-secondary"
              >
                Cerrar
              </button>
              {hasRole('admin') && selectedUser.id !== currentUser.id && (
                <button 
                  onClick={() => {
                    closeViewUserModal();
                    openDeleteModal(selectedUser);
                  }}
                  className="btn-danger"
                >
                  Eliminar Usuario
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="🗑️ Confirmar Eliminación"
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