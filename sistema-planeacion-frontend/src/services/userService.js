import api from './api';

export const userService = {
  // Obtener todos los usuarios
  getUsers: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    const response = await api.get(`/users?${params}`);
    return response.data;
  },

  // Obtener solo profesores
  getProfessors: async () => {
    const response = await api.get('/users/professors');
    return response.data;
  },

  // Obtener usuario por ID
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Actualizar usuario
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Eliminar usuario
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};