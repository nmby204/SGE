import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'professor'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, user } = useAuth();
  const navigate = useNavigate();

  // Solo admin puede registrar
  if (user?.role !== 'admin') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>Acceso Denegado</h1>
          <p>Solo los administradores pueden registrar nuevos usuarios.</p>
          <Link to="/dashboard" className="btn-primary">Volver al Dashboard</Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validar contraseñas
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role
    };

    const result = await register(userData);

    if (result.success) {
      alert('Usuario registrado exitosamente');
      navigate('/users');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  if (loading) {
    return <LoadingSpinner text="Registrando usuario..." />;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Registrar Nuevo Usuario</h1>
        <p>Crear cuenta para coordinador o profesor</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre completo:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nombre del usuario"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="usuario@institucion.edu"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Rol:</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="professor">Profesor</option>
              <option value="coordinator">Coordinador</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Repite la contraseña"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar Usuario'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/dashboard">Volver al Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;