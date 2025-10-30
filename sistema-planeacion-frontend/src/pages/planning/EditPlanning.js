import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { planningService } from '../../services/planningService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import PlanningForm from './PlanningForm';

const EditPlanning = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [planning, setPlanning] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPlanning();
  }, [id]);

  const loadPlanning = async () => {
    try {
      const data = await planningService.getPlanningById(id);
      
      // Verificar que el usuario sea el dueño y pueda editar
      if (data.professor?.id !== user?.id) {
        alert('No tienes permisos para editar esta planeación');
        navigate('/planning');
        return;
      }

      // Verificar que esté en estado editable
      if (data.status !== 'pending' && data.status !== 'adjustments_required') {
        alert('Solo se pueden editar planeaciones pendientes o que requieren ajustes');
        navigate('/planning');
        return;
      }

      setPlanning(data);
    } catch (error) {
      console.error('Error cargando planeación:', error);
      alert('Error al cargar la planeación');
      navigate('/planning');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await planningService.updatePlanning(id, formData);
      alert('Planeación actualizada exitosamente');
      navigate('/planning');
    } catch (error) {
      console.error('Error actualizando planeación:', error);
      alert('Error al actualizar la planeación');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Cargando planeación..." />;
  }

  if (!planning) {
    return <div>Planeación no encontrada</div>;
  }

  return (
    <div className="edit-planning">
      <div className="page-header">
        <h1>Editar Planeación</h1>
        <button 
          onClick={() => navigate('/planning')} 
          className="btn-secondary"
        >
          Volver
        </button>
      </div>

      <PlanningForm
        planning={planning}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        isEdit={true}
      />
    </div>
  );
};

export default EditPlanning;