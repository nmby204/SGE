// Crea un archivo: get-refresh-token.js
const { google } = require('googleapis');
const readline = require('readline');

const oauth2Client = new google.auth.OAuth2(
  '12068877697-f25bqrt670nam09hn54k0f1ivrvdj0q2.apps.googleusercontent.com',
  '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',
  'http://localhost:5000/api/drive/auth/callback'
);

const scopes = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata'
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent' // Esto es importante para obtener refresh token
});

console.log('🔗 **Sigue estos pasos:**');
console.log('1. Abre este enlace en tu navegador:');
console.log(authUrl);
console.log('\n2. Inicia sesión con la cuenta de Google del proyecto');
console.log('3. Permite los permisos');
console.log('4. Copia el código de la URL de redirección');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('\n📋 **Pega el código aquí:** ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('\n✅ **¡Token obtenido exitosamente!**');
    console.log('\n📝 **Actualiza tu archivo .env:**');
    console.log('GOOGLE_DRIVE_REFRESH_TOKEN=' + tokens.refresh_token);
    
    if (tokens.access_token) {
      console.log('\n🔐 **Token de acceso también obtenido**');
    }
    
    rl.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
  }
});