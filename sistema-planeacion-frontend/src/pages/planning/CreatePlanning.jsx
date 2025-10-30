import React, { useState, useEffect } from 'react';
import { planningService } from '../../services/planningService';
import { driveService } from '../../services/driveService';
import FileUpload from '../../components/Common/FileUpload';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Modal from '../../components/Common/Modal';
import './styles/planning.css';

const CreatePlanning = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    courseName: '',
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
  const [useGoogleDrive, setUseGoogleDrive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Reset form cuando se abre/cierra el modal
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      courseName: '',
      partial: '',
      cycle: '2024-2025',
      content: '',
      objectives: '',
      methodology: '',
      evaluation: '',
      resources: ''
    });
    setFile(null);
    setUseGoogleDrive(false);
    setError('');
    setUploadProgress(0);
  };

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
    setUploadProgress(0);

    console.log('=== FRONTEND DEBUG ===');
    console.log('📁 File:', file);
    console.log('✅ useGoogleDrive:', useGoogleDrive);
    console.log('🔍 Checkbox marcado?:', useGoogleDrive);
    console.log('💾 Tiene file?:', !!file);
    console.log('📝 FormData:', formData);
    console.log('=====================');

    try {
      let planningData = { ...formData };

      // ✅ OPCIÓN 1: Subir a Google Drive
      if (useGoogleDrive && file) {
        console.log('🚀 INICIANDO SUBIDA A GOOGLE DRIVE...');
        
        try {
          setUploadProgress(10);
          console.log('📤 Llamando a driveService.uploadFile...');
          
          const driveResult = await driveService.uploadFile(file);
          
          console.log('✅ driveResult recibido:', driveResult);
          setUploadProgress(70);
          
          planningData = {
            ...formData,
            fileUrl: driveResult.webViewLink,
            driveFileId: driveResult.fileId,
            fileName: file.name,
            storageType: 'google_drive'
          };
          
          console.log('🎯 Datos para Google Drive:', planningData);
          
        } catch (driveError) {
          console.error('💥 ERROR en driveService.uploadFile:', driveError);
          console.error('Detalle completo:', driveError.response?.data);
          console.error('Status:', driveError.response?.status);
          setError(`Error subiendo a Google Drive: ${driveError.message}. Usando método local...`);
          // Fallback a local
          planningData = { 
            ...formData, 
            file: file, 
            storageType: 'local' 
          };
        }
      } 
      // ✅ OPCIÓN 2: Método original (local/multer)
      else if (file) {
        console.log('📂 Usando almacenamiento LOCAL (checkbox no marcado o sin archivo)');
        planningData = { 
          ...formData, 
          file: file, 
          storageType: 'local' 
        };
      } else {
        console.log('📭 No hay archivo para subir');
        planningData = { 
          ...formData, 
          storageType: 'none' 
        };
      }

      setUploadProgress(90);
      console.log('📨 Enviando al backend...', planningData);
      const result = await planningService.createPlanning(planningData);
      setUploadProgress(100);

      console.log('✅ Respuesta del backend:', result);
      
      alert('Planeación creada exitosamente');
      onSuccess?.(result);
      onClose?.();
      
    } catch (error) {
      console.error('❌ Error final:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Error al crear la planeación');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose?.();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title="Crear Nueva Planeación Didáctica"
      size="xlarge"
    >
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* ✅ Barra de progreso para Google Drive */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <span>
            {useGoogleDrive && file ? 'Subiendo a Google Drive...' : 'Procesando...'} 
            {uploadProgress}%
          </span>
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
            rows="3"
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
            rows="3"
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
            rows="3"
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
            rows="3"
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
            rows="2"
            placeholder="Liste los recursos didácticos a utilizar..."
          />
        </div>

        <div className="form-group">
          <label>Archivo Adjunto (Opcional)</label>
          <FileUpload onFileSelect={handleFileSelect} />
          <small>Puede subir un archivo PDF, Word o imagen con la planeación completa</small>
          
          {/* ✅ Opción para Google Drive */}
          {file && (
            <div className="drive-option">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={useGoogleDrive}
                  onChange={(e) => {
                    console.log('🔘 Checkbox cambiado:', e.target.checked);
                    setUseGoogleDrive(e.target.checked);
                  }}
                />
                <span>📁 Usar Google Drive para almacenamiento</span>
              </label>
              <small className="text-muted">
                {useGoogleDrive 
                  ? 'El archivo se guardará en la nube de Google Drive (más seguro)' 
                  : 'El archivo se guardará en el servidor local'
                }
              </small>
              {useGoogleDrive && (
                <div className="drive-info">
                  <small>✅ Google Drive está configurado y listo para usar</small>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={handleClose}
            disabled={loading}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                {useGoogleDrive && file ? 'Subiendo a Drive...' : 'Creando Planeación...'}
              </>
            ) : 'Crear Planeación'}
          </button>
        </div>
      </form>

      
    </Modal>
  );
};

export default CreatePlanning;