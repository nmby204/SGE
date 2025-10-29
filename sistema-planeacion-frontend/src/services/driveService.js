import api from './api';

export const driveService = {
  uploadFile: async (file) => {
    console.log('🔄 driveService.uploadFile INICIADO');
    console.log('📄 Archivo:', file.name, file.size, file.type);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('📡 Haciendo POST a /api/drive/upload...');
      
      const response = await api.post('/drive/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data' 
        },
        timeout: 30000
      });
      
      console.log('✅ Response de /api/drive/upload:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Error desconocido en Drive');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('💥 Error en driveService.uploadFile:');
      console.error('   Mensaje:', error.message);
      console.error('   Response:', error.response?.data);
      console.error('   Status:', error.response?.status);
      console.error('   URL:', error.config?.url);
      throw error;
    }
  },

  deleteFile: async (fileId) => {
    const response = await api.delete(`/drive/files/${fileId}`);
    return response.data;
  },

  getFile: async (fileId) => {
    const response = await api.get(`/drive/files/${fileId}`);
    return response.data.data;
  },

  getFileViewUrl: (fileId) => {
    return `https://drive.google.com/file/d/${fileId}/view`;
  },

  getFileDownloadUrl: (fileId) => {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
};