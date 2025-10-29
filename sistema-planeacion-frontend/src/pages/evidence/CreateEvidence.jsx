import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { evidenceService } from '../../services/evidenceService';
import FileUpload from '../../components/Common/FileUpload';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import '../../styles/evidence-styles.css';

const CreateEvidence = () => {
  const [formData, setFormData] = useState({
    courseName: '',
    institution: '',
    date: '',
    hours: ''
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

    // Validar que se haya subido un archivo
    if (!file) {
      setError('Debe subir un archivo de evidencia');
      setLoading(false);
      return;
    }

    try {
      const evidenceData = {
        ...formData,
        file: file,
        hours: parseInt(formData.hours)
      };

      await evidenceService.createEvidence(evidenceData);
      alert('Evidencia registrada exitosamente');
      navigate('/evidence');
    } catch (error) {
      console.error('Error creando evidencia:', error);
      setError(error.response?.data?.message || 'Error al registrar la evidencia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-evidence">
      <div className="page-header">
        <h1>Registrar Evidencia de Capacitación</h1>
        <button onClick={() => navigate('/evidence')} className="btn-secondary">
          Volver a Evidencias
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="evidence-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="courseName">Nombre del Curso/Taller *</label>
            <input
              type="text"
              id="courseName"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              required
              placeholder="Ej: Curso de Actualización Docente"
            />
          </div>

          <div className="form-group">
            <label htmlFor="institution">Institución Emisora *</label>
            <input
              type="text"
              id="institution"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              required
              placeholder="Ej: Universidad Nacional"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Fecha del Curso *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="hours">Horas Acreditadas *</label>
            <input
              type="number"
              id="hours"
              name="hours"
              value={formData.hours}
              onChange={handleChange}
              required
              min="1"
              placeholder="Ej: 40"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Constancia o Documento Comprobatorio *</label>
          <FileUpload onFileSelect={handleFileSelect} />
          <small>Suba el documento que acredita la capacitación (PDF, imagen, constancia)</small>
        </div>

        <div className="form-note">
          <h4>Nota:</h4>
          <p>
            La evidencia será enviada para revisión por parte de la coordinación. 
            Recibirá una notificación cuando sea aprobada o si se requieren ajustes.
          </p>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/evidence')}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={loading || !file}
            className="btn-primary"
          >
            {loading ? 'Registrando Evidencia...' : 'Registrar Evidencia'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvidence;