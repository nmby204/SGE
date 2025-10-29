const googleDriveService = require('../services/googleDriveService');

exports.uploadFile = async (req, res) => {
  try {
    console.log('📥 === DRIVE CONTROLLER - UPLOAD INICIADO ===');
    console.log('📁 Archivo recibido en controller:', req.file ? {
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    } : 'NO HAY ARCHIVO');

    if (!req.file) {
      console.log('❌ No se proporcionó archivo');
      return res.status(400).json({ error: 'No file provided' });
    }

    console.log('🔄 Pasando archivo a GoogleDriveService...');
    const result = await googleDriveService.uploadFile(req.file);
    
    console.log('✅ Subida completada exitosamente');
    console.log('📊 Resultado a enviar al frontend:', result);

    res.status(200).json({
      success: true,
      message: 'File uploaded to Google Drive successfully',
      data: result
    });

    console.log('✅ === DRIVE CONTROLLER - UPLOAD COMPLETADO ===');

  } catch (error) {
    console.error('❌ === ERROR EN DRIVE CONTROLLER ===');
    console.error('📛 Error:', error.message);
    console.error('🔍 Detalles:', error.response?.data || error);
    console.error('📋 Stack:', error.stack);
    console.error('❌ === FIN ERROR ===');

    res.status(500).json({ 
      error: 'Error uploading file to Google Drive',
      details: error.message 
    });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    console.log('🗑️ Eliminando archivo:', req.params.fileId);
    
    await googleDriveService.deleteFile(req.params.fileId);
    
    res.status(200).json({
      success: true,
      message: 'File deleted from Google Drive successfully'
    });
  } catch (error) {
    console.error('Error in deleteFile controller:', error);
    res.status(500).json({ 
      error: 'Error deleting file from Google Drive',
      details: error.message 
    });
  }
};

exports.getFile = async (req, res) => {
  try {
    console.log('🔍 Obteniendo archivo:', req.params.fileId);
    
    const file = await googleDriveService.getFile(req.params.fileId);
    
    res.status(200).json({
      success: true,
      data: file
    });
  } catch (error) {
    console.error('Error in getFile controller:', error);
    res.status(500).json({ 
      error: 'Error getting file from Google Drive',
      details: error.message 
    });
  }
};