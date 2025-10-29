const { google } = require('googleapis');

class GoogleDriveService {
  constructor() {
    console.log('🔄 Inicializando GoogleDriveService...');
    this.drive = google.drive('v3');
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_DRIVE_CLIENT_ID,
      process.env.GOOGLE_DRIVE_CLIENT_SECRET,
      process.env.GOOGLE_DRIVE_REDIRECT_URI
    );
    
    // Configurar credenciales de refresh token
    this.oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN
    });

    console.log('✅ GoogleDriveService inicializado');
    console.log('🔑 Client ID:', process.env.GOOGLE_DRIVE_CLIENT_ID ? '✅ Configurado' : '❌ Faltante');
    console.log('🔄 Refresh Token:', process.env.GOOGLE_DRIVE_REFRESH_TOKEN ? '✅ Configurado' : '❌ Faltante');
  }

  async uploadFile(file) {
    try {
      console.log('📤 === INICIANDO SUBIDA A GOOGLE DRIVE ===');
      console.log('📄 Archivo:', file.originalname);
      console.log('📏 Tamaño:', file.size, 'bytes');
      console.log('📝 MIME Type:', file.mimetype);

      const { originalname, buffer, mimetype } = file;

      console.log('🔄 Creando archivo en Google Drive...');
      const response = await this.drive.files.create({
        auth: this.oauth2Client,
        requestBody: {
          name: `planning_${Date.now()}_${originalname}`,
          mimeType: mimetype,
          parents: process.env.GOOGLE_DRIVE_FOLDER_ID ? [process.env.GOOGLE_DRIVE_FOLDER_ID] : []
        },
        media: {
          mimeType: mimetype,
          body: buffer
        }
      });

      console.log('✅ Archivo creado en Drive. ID:', response.data.id);
      console.log('🔗 WebViewLink:', response.data.webViewLink);

      console.log('🔓 Haciendo archivo público...');
      // Hacer el archivo público
      await this.drive.permissions.create({
        auth: this.oauth2Client,
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });

      console.log('✅ Archivo hecho público');
      
      const result = {
        fileId: response.data.id,
        webViewLink: response.data.webViewLink,
        webContentLink: response.data.webContentLink
      };

      console.log('🎯 Resultado final:', result);
      console.log('✅ === SUBIDA A GOOGLE DRIVE COMPLETADA ===');

      return result;
    } catch (error) {
      console.error('❌ === ERROR EN GOOGLE DRIVE ===');
      console.error('📛 Error:', error.message);
      console.error('🔍 Detalles:', error.response?.data || error);
      console.error('📋 Stack:', error.stack);
      console.error('❌ === FIN ERROR ===');
      throw error;
    }
  }

  async deleteFile(fileId) {
    try {
      console.log('🗑️ Eliminando archivo de Drive:', fileId);
      await this.drive.files.delete({
        auth: this.oauth2Client,
        fileId: fileId
      });
      console.log('✅ Archivo eliminado de Drive');
      return { success: true };
    } catch (error) {
      console.error('❌ Error eliminando de Google Drive:', error);
      throw error;
    }
  }

  async getFile(fileId) {
    try {
      console.log('🔍 Obteniendo archivo de Drive:', fileId);
      const response = await this.drive.files.get({
        auth: this.oauth2Client,
        fileId: fileId,
        fields: 'id, name, webViewLink, webContentLink, mimeType, createdTime'
      });
      console.log('✅ Archivo obtenido de Drive');
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo archivo de Google Drive:', error);
      throw error;
    }
  }
}

module.exports = new GoogleDriveService();