import React, { useState, useEffect } from 'react';
import { calendarService } from '../../services/calendarService';
import LoadingSpinner from '../Common/LoadingSpinner';

const CalendarWidget = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUpcomingEvents();
  }, []);

  const loadUpcomingEvents = async () => {
    try {
      const data = await calendarService.getUpcomingEvents(5);
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error cargando eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner size="small" text="Cargando eventos..." />;
  }

  return (
    <div className="calendar-widget">
      <h3>📅 Próximos Eventos</h3>
      
      {events.length === 0 ? (
        <p className="no-events">No hay eventos próximos</p>
      ) : (
        <div className="events-list">
          {events.map((event) => (
            <div key={event.id} className="event-item">
              <div className="event-summary">
                <strong>{event.summary}</strong>
              </div>
              <div className="event-time">
                {formatDate(event.start.dateTime || event.start.date)}
              </div>
              {event.location && (
                <div className="event-location">
                  📍 {event.location}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;