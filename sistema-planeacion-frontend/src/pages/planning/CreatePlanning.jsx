import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { planningService } from '../../services/planningService';
import FileUpload from '../../components/Common/FileUpload';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const CreatePlanning = () => {
  const [formData, setFormData] = useState({
    courseName: '', // Cambiamos courseId por courseName
    partial: '',
    cycle: '2024-2025',
    content: '',
    objectives: '',
    methodology: '',
    evaluation: '',
    resources: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const planningData = {
        ...formData,
        file: file
      };

      await planningService.createPlanning(planningData);
      alert('Planeación creada exitosamente');
      navigate('/planning');
    } catch (error) {
      console.error('Error creando planeación:', error);
      setError(error.response?.data?.message || 'Error al crear la planeación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-planning">
      <div className="page-header">
        <h1>Crear Nueva Planeación Didáctica</h1>
        <button onClick={() => navigate('/planning')} className="btn-secondary">
          Volver a Planeaciones
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="planning-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="courseName">Nombre de la Materia *</label>
            <input
              type="text"
              id="courseName"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              required
              placeholder="Ej: Matemáticas Básicas, Programación I, etc."
            />
          </div>

          <div className="form-group">
            <label htmlFor="partial">Parcial *</label>
            <select
              id="partial"
              name="partial"
              value={formData.partial}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar parcial</option>
              <option value="1">Parcial 1</option>
              <option value="2">Parcial 2</option>
              <option value="3">Parcial 3</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="cycle">Ciclo Escolar *</label>
            <input
              type="text"
              id="cycle"
              name="cycle"
              value={formData.cycle}
              onChange={handleChange}
              required
              placeholder="Ej: 2024-2025"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="content">Contenido Temático *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Describa el contenido temático de la planeación..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="objectives">Objetivos de Aprendizaje *</label>
          <textarea
            id="objectives"
            name="objectives"
            value={formData.objectives}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Establezca los objetivos de aprendizaje..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="methodology">Metodología *</label>
          <textarea
            id="methodology"
            name="methodology"
            value={formData.methodology}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Describa la metodología de enseñanza..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="evaluation">Estrategias de Evaluación *</label>
          <textarea
            id="evaluation"
            name="evaluation"
            value={formData.evaluation}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Describa las estrategias de evaluación..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="resources">Recursos Didácticos</label>
          <textarea
            id="resources"
            name="resources"
            value={formData.resources}
            onChange={handleChange}
            rows="3"
            placeholder="Liste los recursos didácticos a utilizar..."
          />
        </div>

        <div className="form-group">
          <label>Archivo Adjunto (Opcional)</label>
          <FileUpload onFileSelect={handleFileSelect} />
          <small>Puede subir un archivo PDF, Word o imagen con la planeación completa</small>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/planning')}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Creando Planeación...' : 'Crear Planeación'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePlanning;