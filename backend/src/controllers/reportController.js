const { DidacticPlanning, PartialProgress, Evidence, User, Course } = require('../models');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const getPlanningCompliance = async (req, res) => {
  try {
    const { cycle, partial } = req.query;
    const where = {};

    if (cycle) where.cycle = cycle;
    if (partial) where.partial = parseInt(partial);

    const plannings = await DidacticPlanning.findAll({
      where,
      include: [
        { model: User, as: 'professor', attributes: ['id', 'name'] },
        { model: Course, as: 'course' }
      ]
    });

    const compliance = {
      total: plannings.length,
      approved: plannings.filter(p => p.status === 'approved').length,
      pending: plannings.filter(p => p.status === 'pending').length,
      adjustments_required: plannings.filter(p => p.status === 'adjustments_required').length,
      complianceRate: plannings.length > 0 ? 
        (plannings.filter(p => p.status === 'approved').length / plannings.length) * 100 : 0
    };

    res.json(compliance);
  } catch (error) {
    console.error('Get planning compliance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPartialProgressReport = async (req, res) => {
  try {
    const { partial, courseId } = req.query;
    const where = {};

    if (partial) where.partial = parseInt(partial);

    const progress = await PartialProgress.findAll({
      where,
      include: [{
        model: DidacticPlanning,
        as: 'planning',
        where: courseId ? { courseId } : {},
        include: [
          { model: User, as: 'professor', attributes: ['id', 'name'] },
          { model: Course, as: 'course' }
        ]
      }]
    });

    const report = {
      total: progress.length,
      averageProgress: progress.reduce((acc, curr) => acc + curr.progressPercentage, 0) / progress.length || 0,
      statusBreakdown: {
        fulfilled: progress.filter(p => p.status === 'fulfilled').length,
        partial: progress.filter(p => p.status === 'partial').length,
        unfulfilled: progress.filter(p => p.status === 'unfulfilled').length
      },
      byProfessor: {},
      byCourse: {}
    };

    // Group by professor
    progress.forEach(p => {
      const professorName = p.planning.professor.name;
      if (!report.byProfessor[professorName]) {
        report.byProfessor[professorName] = {
          total: 0,
          fulfilled: 0,
          averageProgress: 0
        };
      }
      report.byProfessor[professorName].total++;
      if (p.status === 'fulfilled') report.byProfessor[professorName].fulfilled++;
      report.byProfessor[professorName].averageProgress += p.progressPercentage;
    });

    // Calculate averages
    Object.keys(report.byProfessor).forEach(professor => {
      report.byProfessor[professor].averageProgress /= report.byProfessor[professor].total;
    });

    res.json(report);
  } catch (error) {
    console.error('Get partial progress report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTrainingCoursesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = { status: 'approved' };

    if (startDate && endDate) {
      where.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const evidences = await Evidence.findAll({
      where,
      include: [{
        model: User,
        as: 'professor',
        attributes: ['id', 'name']
      }]
    });

    const report = {
      totalCourses: evidences.length,
      totalHours: evidences.reduce((acc, curr) => acc + curr.hours, 0),
      byProfessor: {},
      byInstitution: {}
    };

    evidences.forEach(evidence => {
      // Group by professor
      const professorName = evidence.professor.name;
      if (!report.byProfessor[professorName]) {
        report.byProfessor[professorName] = {
          courses: 0,
          hours: 0
        };
      }
      report.byProfessor[professorName].courses++;
      report.byProfessor[professorName].hours += evidence.hours;

      // Group by institution
      const institution = evidence.institution;
      if (!report.byInstitution[institution]) {
        report.byInstitution[institution] = {
          courses: 0,
          hours: 0
        };
      }
      report.byInstitution[institution].courses++;
      report.byInstitution[institution].hours += evidence.hours;
    });

    res.json(report);
  } catch (error) {
    console.error('Get training courses report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const exportToExcel = async (req, res) => {
  try {
    const { reportType, ...filters } = req.query;

    let data;
    switch (reportType) {
      case 'planning':
        data = await getPlanningComplianceData(filters);
        break;
      case 'progress':
        data = await getProgressReportData(filters);
        break;
      case 'training':
        data = await getTrainingReportData(filters);
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');

    // Add headers and data based on report type
    worksheet.addRow(Object.keys(data[0] || {}));
    data.forEach(row => {
      worksheet.addRow(Object.values(row));
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export to Excel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper functions for Excel export
async function getPlanningComplianceData(filters) {
  // Implementation for planning compliance data
  return [];
}

async function getProgressReportData(filters) {
  // Implementation for progress report data
  return [];
}

async function getTrainingReportData(filters) {
  // Implementation for training report data
  return [];
}

module.exports = {
  getPlanningCompliance,
  getPartialProgressReport,
  getTrainingCoursesReport,
  exportToExcel
};