import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Cargando...' }) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'spinner-small';
      case 'large': return 'spinner-large';
      default: return 'spinner-medium';
    }
  };

  return (
    <div className="loading-container">
      <div className={`spinner ${getSizeClass()}`}></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;