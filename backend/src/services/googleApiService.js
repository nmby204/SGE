import { google } from 'googleapis';

class GoogleApiService {
  constructor() {
    this.oauth2Client = null;
    this.initializeAuth();
  }

  initializeAuth() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  setCredentials(tokens) {
    this.oauth2Client.setCredentials(tokens);
  }

  // Servicios individuales
  getDriveService() {
    return google.drive({ version: 'v3', auth: this.oauth2Client });
  }

  getCalendarService() {
    return google.calendar({ version: 'v3', auth: this.oauth2Client });
  }
}

export const googleApiService = new GoogleApiService();