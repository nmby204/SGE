import React, { useState, useEffect } from 'react';
import { calendarService } from '../../services/calendarService';
import LoadingSpinner from '../Common/LoadingSpinner';
import './CalendarWidget.css';

const CalendarWidget = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCalendarEvents();
  }, []);

  const loadCalendarEvents = async () => {
    try {
      setLoading(true);
      const response = await calendarService.getUpcomingEvents(5);
      
      // Los eventos ahora vienen en formato diferente
      if (response.events && Array.isArray(response.events)) {
        setEvents(response.events);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Error loading calendar events:', error);
      setError('Error al cargar eventos del calendario');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'planning':
        return '📚';
      case 'evidence':
        return '📋';
      case 'progress':
        return '📊';
      default:
        return '📅';
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'planning':
        return '#3b82f6'; // azul
      case 'evidence':
        return '#10b981'; // verde
      case 'progress':
        return '#f59e0b'; // amarillo
      default:
        return '#6b7280'; // gris
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner text="Cargando eventos..." />;
  }

  if (error) {
    return (
      <div className="calendar-widget error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="calendar-widget">
      <div className="calendar-header">
        <h3>📅 Próximos Eventos</h3>
        <button 
          onClick={loadCalendarEvents}
          className="refresh-btn"
          title="Actualizar eventos"
        >
          🔄
        </button>
      </div>

      <div className="events-list">
        {events.length === 0 ? (
          <div className="no-events">
            <p>No hay eventos próximos</p>
            <small>Los eventos se generan automáticamente al crear planeaciones, evidencias y progresos</small>
          </div>
        ) : (
          events.map((event) => (
            <div 
              key={event.id} 
              className="event-item"
              style={{ borderLeftColor: getEventColor(event.type) }}
            >
              <div className="event-icon">
                {getEventIcon(event.type)}
              </div>
              <div className="event-content">
                <h4 className="event-title">{event.title}</h4>
                <p className="event-description">{event.description}</p>
                <div className="event-meta">
                  <span className="event-date">
                    {formatDate(event.start)}
                  </span>
                  <span className={`event-status status-${event.status}`}>
                    {event.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="calendar-footer">
        <small>
          {events.length > 0 && `Mostrando ${events.length} evento(s)`}
        </small>
      </div>
    </div>
  );
};

export default CalendarWidget;