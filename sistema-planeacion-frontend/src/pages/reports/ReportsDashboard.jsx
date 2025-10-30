import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './ReportsDashboard.css';

const ReportsDashboard = () => {
  const [activeTab, setActiveTab] = useState('planning');
  const [planningData, setPlanningData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [trainingData, setTrainingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    cycle: '2024-2025',
    partial: '1',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadReportData();
  }, [activeTab, filters]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'planning':
          const planningReport = await reportService.getPlanningCompliance({
            cycle: filters.cycle,
            partial: filters.partial
          });
          setPlanningData(planningReport);
          break;
        
        case 'progress':
          const progressReport = await reportService.getPartialProgressReport({
            partial: filters.partial
          });
          setProgressData(progressReport);
          break;
        
        case 'training':
          const trainingReport = await reportService.getTrainingCoursesReport({
            startDate: filters.startDate,
            endDate: filters.endDate
          });
          setTrainingData(trainingReport);
          break;
      }
    } catch (error) {
      console.error('Error cargando reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleExport = async (reportType) => {
    try {
      const blob = await reportService.exportToExcel(reportType, filters);
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `reporte-${reportType}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      alert('Reporte exportado exitosamente');
    } catch (error) {
      console.error('Error exportando reporte:', error);
      alert('Error al exportar el reporte');
    }
  };

  const renderPlanningReport = () => {
    if (!planningData) return <p>No hay datos disponibles</p>;

    return (
      <div className="report-content">
        <div className="report-stats">
          <div className="stat-card">
            <h3>Tasa de Cumplimiento</h3>
            <p className="stat-number">{planningData.complianceRate || 0}%</p>
          </div>
          <div className="stat-card">
            <h3>Total Planeaciones</h3>
            <p className="stat-number">{planningData.total || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Aprobadas</h3>
            <p className="stat-number">{planningData.approved || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Pendientes</h3>
            <p className="stat-number">{planningData.pending || 0}</p>
          </div>
        </div>

        <button 
          onClick={() => handleExport('planning')}
          className="btn-primary"
        >
          Exportar a Excel
        </button>
      </div>
    );
  };

  const renderProgressReport = () => {
    if (!progressData) return <p>No hay datos disponibles</p>;

    return (
      <div className="report-content">
        <div className="report-stats">
          <div className="stat-card">
            <h3>Progreso Promedio</h3>
            <p className="stat-number">{progressData.averageProgress || 0}%</p>
          </div>
          <div className="stat-card">
            <h3>Cumplidos</h3>
            <p className="stat-number">{progressData.fulfilled || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Parciales</h3>
            <p className="stat-number">{progressData.partial || 0}</p>
          </div>
          <div className="stat-card">
            <h3>No Cumplidos</h3>
            <p className="stat-number">{progressData.unfulfilled || 0}</p>
          </div>
        </div>

        <button 
          onClick={() => handleExport('progress')}
          className="btn-primary"
        >
          Exportar a Excel
        </button>
      </div>
    );
  };

  const renderTrainingReport = () => {
    if (!trainingData) return <p>No hay datos disponibles</p>;

    return (
      <div className="report-content">
        <div className="report-stats">
          <div className="stat-card">
            <h3>Total Cursos</h3>
            <p className="stat-number">{trainingData.totalCourses || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Horas Totales</h3>
            <p className="stat-number">{trainingData.totalHours || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Aprobados</h3>
            <p className="stat-number">{trainingData.approvedCourses || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Pendientes</h3>
            <p className="stat-number">{trainingData.pendingCourses || 0}</p>
          </div>
        </div>

        <button 
          onClick={() => handleExport('training')}
          className="btn-primary"
        >
          Exportar a Excel
        </button>
      </div>
    );
  };

  return (
    <div className="reports-dashboard">
      <div className="page-header">
        <h1>Reportes y Estadísticas</h1>
      </div>

      {/* Pestañas */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'planning' ? 'active' : ''}`}
          onClick={() => setActiveTab('planning')}
        >
          Cumplimiento de Planeaciones
        </button>
        <button 
          className={`tab ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          Avances Parciales
        </button>
        <button 
          className={`tab ${activeTab === 'training' ? 'active' : ''}`}
          onClick={() => setActiveTab('training')}
        >
          Cursos de Capacitación
        </button>
      </div>

      {/* Filtros */}
      <div className="report-filters">
        {activeTab === 'planning' && (
          <>
            <input
              type="text"
              placeholder="Ciclo escolar"
              value={filters.cycle}
              onChange={(e) => handleFilterChange('cycle', e.target.value)}
            />
            <select 
              value={filters.partial} 
              onChange={(e) => handleFilterChange('partial', e.target.value)}
            >
              <option value="1">Parcial 1</option>
              <option value="2">Parcial 2</option>
              <option value="3">Parcial 3</option>
            </select>
          </>
        )}

        {activeTab === 'progress' && (
          <select 
            value={filters.partial} 
            onChange={(e) => handleFilterChange('partial', e.target.value)}
          >
            <option value="1">Parcial 1</option>
            <option value="2">Parcial 2</option>
            <option value="3">Parcial 3</option>
          </select>
        )}

        {activeTab === 'training' && (
          <>
            <input
              type="date"
              placeholder="Fecha inicial"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
            <input
              type="date"
              placeholder="Fecha final"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </>
        )}

        <button onClick={loadReportData} className="btn-secondary">
          Actualizar
        </button>
      </div>

      {/* Contenido del reporte */}
      <div className="report-container">
        {loading ? (
          <LoadingSpinner text="Generando reporte..." />
        ) : (
          <>
            {activeTab === 'planning' && renderPlanningReport()}
            {activeTab === 'progress' && renderProgressReport()}
            {activeTab === 'training' && renderTrainingReport()}
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsDashboard;