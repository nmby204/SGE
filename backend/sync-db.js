const { sequelize } = require('./models');

async function forceSync() {
  try {
    console.log('🔄 Forzando resincronización de la base de datos...');
    
    // Cerrar conexiones existentes
    await sequelize.close();
    
    // Reabrir conexión
    await sequelize.authenticate();
    console.log('✅ Conexión reestablecida');
    
    // Sincronizar SIN alterar estructura
    await sequelize.sync({ force: false });
    console.log('✅ Base de datos sincronizada');
    
    // Verificar el modelo
    const DidacticPlanning = require('./models').DidacticPlanning;
    const attributes = Object.keys(DidacticPlanning.rawAttributes);
    console.log('📋 Atributos del modelo DidacticPlanning:', attributes);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

forceSync();