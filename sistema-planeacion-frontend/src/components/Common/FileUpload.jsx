import React, { useState } from 'react';

const FileUpload = ({ onFileSelect, acceptedTypes = '.pdf,.jpg,.jpeg,.png,.docx', maxSize = 10 }) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file) => {
    // Validar tamaño
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      alert(`El archivo es demasiado grande. Máximo permitido: ${maxSize}MB`);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
  };

  return (
    <div className="file-upload">
      <div
        className={`upload-area ${dragOver ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="file-selected">
            <p>Archivo seleccionado: {selectedFile.name}</p>
            <button type="button" onClick={removeFile} className="remove-file-btn">
              Eliminar
            </button>
          </div>
        ) : (
          <>
            <p>Arrastra un archivo aquí o haz clic para seleccionar</p>
            <input
              type="file"
              onChange={handleFileSelect}
              accept={acceptedTypes}
              className="file-input"
            />
            <small>Formatos permitidos: PDF, JPG, PNG, DOCX (Máx. {maxSize}MB)</small>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;