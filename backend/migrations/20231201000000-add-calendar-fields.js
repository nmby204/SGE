'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Iniciando migración: Agregando campos de calendario a las tablas...');
    
    try {
      // ✅ AGREGAR CAMPOS A DIDACTIC_PLANNINGS
      console.log('📊 Agregando campos a didactic_plannings...');
      
      await queryInterface.addColumn('didactic_plannings', 'submission_date', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });

      await queryInterface.addColumn('didactic_plannings', 'review_deadline', {
        type: Sequelize.DATE,
        allowNull: true
      });

      await queryInterface.addColumn('didactic_plannings', 'next_review_date', {
        type: Sequelize.DATE,
        allowNull: true
      });

      console.log('✅ Campos agregados a didactic_plannings');

      // ✅ AGREGAR CAMPOS A EVIDENCES
      console.log('📋 Agregando campos a evidences...');
      
      await queryInterface.addColumn('evidences', 'review_deadline', {
        type: Sequelize.DATE,
        allowNull: true
      });

      await queryInterface.addColumn('evidences', 'reminder_sent', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      });

      console.log('✅ Campos agregados a evidences');

      // ✅ AGREGAR CAMPOS A PARTIAL_PROGRESS
      console.log('📈 Agregando campos a partial_progress...');
      
      await queryInterface.addColumn('partial_progress', 'due_date', {
        type: Sequelize.DATE,
        allowNull: true
      });

      await queryInterface.addColumn('partial_progress', 'next_checkpoint', {
        type: Sequelize.DATE,
        allowNull: true
      });

      console.log('✅ Campos agregados a partial_progress');

      // ✅ ACTUALIZAR DATOS EXISTENTES CON FECHAS POR DEFECTO
      console.log('🔄 Actualizando datos existentes...');
      
      // Para planeaciones existentes, establecer submission_date como createdAt si es null
      await queryInterface.sequelize.query(`
        UPDATE didactic_plannings 
        SET submission_date = created_at 
        WHERE submission_date IS NULL
      `);

      // Para evidencias existentes, establecer review_deadline como 3 días después de la fecha
      await queryInterface.sequelize.query(`
        UPDATE evidences 
        SET review_deadline = date + INTERVAL '3 days'
        WHERE review_deadline IS NULL
      `);

      // Para progresos existentes, establecer next_checkpoint como 15 días después de created_at
      await queryInterface.sequelize.query(`
        UPDATE partial_progress 
        SET next_checkpoint = created_at + INTERVAL '15 days'
        WHERE next_checkpoint IS NULL
      `);

      console.log('✅ Datos existentes actualizados');

      console.log('🎉 Migración completada exitosamente!');
      console.log('📋 Resumen de campos agregados:');
      console.log('   - didactic_plannings: submission_date, review_deadline, next_review_date');
      console.log('   - evidences: review_deadline, reminder_sent');
      console.log('   - partial_progress: due_date, next_checkpoint');

    } catch (error) {
      console.error('❌ Error durante la migración:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Revirtiendo migración: Eliminando campos de calendario...');
    
    try {
      // ❌ ELIMINAR CAMPOS DE PARTIAL_PROGRESS
      console.log('📈 Eliminando campos de partial_progress...');
      
      await queryInterface.removeColumn('partial_progress', 'due_date');
      await queryInterface.removeColumn('partial_progress', 'next_checkpoint');

      console.log('✅ Campos eliminados de partial_progress');

      // ❌ ELIMINAR CAMPOS DE EVIDENCES
      console.log('📋 Eliminando campos de evidences...');
      
      await queryInterface.removeColumn('evidences', 'review_deadline');
      await queryInterface.removeColumn('evidences', 'reminder_sent');

      console.log('✅ Campos eliminados de evidences');

      // ❌ ELIMINAR CAMPOS DE DIDACTIC_PLANNINGS
      console.log('📊 Eliminando campos de didactic_plannings...');
      
      await queryInterface.removeColumn('didactic_plannings', 'submission_date');
      await queryInterface.removeColumn('didactic_plannings', 'review_deadline');
      await queryInterface.removeColumn('didactic_plannings', 'next_review_date');

      console.log('✅ Campos eliminados de didactic_plannings');

      console.log('✅ Migración revertida exitosamente!');

    } catch (error) {
      console.error('❌ Error revirtiendo la migración:', error);
      throw error;
    }
  }
};