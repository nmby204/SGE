// src/components/Location/LocationWidget.js
import React, { useState, useEffect } from 'react';
import { geoService } from '../../services/geoService';
import './LocationWidget.css';

const LocationWidget = () => {
  const [universityLocation, setUniversityLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUniversityLocation();
  }, []);

  const loadUniversityLocation = async () => {
    try {
      const location = await geoService.getUniversityLocation();
      setUniversityLocation(location);
    } catch (err) {
      console.error('Error cargando ubicación:', err);
      setError('No se pudo cargar la ubicación');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="location-widget">
        <div className="location-loading">📍 Cargando ubicación...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="location-widget">
        <div className="location-error">❌ {error}</div>
      </div>
    );
  }

  return (
    <div className="location-widget">
      <h3>🏫 Ubicación de la Universidad</h3>
      <div className="location-content">
        <div className="location-info">
          <strong>{universityLocation?.name}</strong>
          <p className="location-address">{universityLocation?.address}</p>
          <div className="location-coordinates">
            <span>📍 Lat: {universityLocation?.latitude}°N</span>
            <span>📍 Lng: {universityLocation?.longitude}°W</span>
          </div>
          <div className="location-contact">
            <p>📞 418 182 5500</p>
            <p>🌐 utng.edu.mx</p>
          </div>
        </div>
        <div className="location-actions">
          <a 
            href={`https://maps.google.com/?q=${universityLocation?.latitude},${universityLocation?.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="map-link"
          >
            🗺️ Ver en Google Maps
          </a>
          <a 
            href="https://utng.edu.mx"
            target="_blank"
            rel="noopener noreferrer"
            className="website-link"
          >
            🌐 Sitio Web UTNG
          </a>
        </div>
      </div>
    </div>
  );
};

export default LocationWidget;