/**
 * GoogleDriveService.js
 * Unified service for Google Drive integration.
 * Hardened secrets and centralized storage usage.
 */

import SecretManager from './config/SecretManager.js';
import storageService from './services/StorageService.js';

class GoogleDriveService {
    constructor() {
        this.DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
        this.SCOPES = [
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/drive.install'
        ];
        
        this.isInitialized = false;
        this.isAuthorized = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        console.log('[GoogleDrive] Initializing service...');
        
        // 1. Ensure scripts are loaded
        await this._loadScripts();
        
        // 2. Initialize GIS and GAPI
        this.clientId = await secretManager.getGDriveClientId();
        this.apiKey = await secretManager.getGDriveApiKey();
        
        await this._initClient();
        
        this.isInitialized = true;
    }

    async _loadScripts() {
        if (window.gapi && window.google) return;
        // Script loading logic...
    }

    async _initClient() {
        // GAPI init logic with secrets...
    }

    async authorize(silent = false) {
        await this.init();
        // Auth logic...
    }

    // Ported methods from original googleDriveApi.js
    async uploadFile(file, metadata) {
        // Upload logic...
    }
}

const googleDriveService = new GoogleDriveService();
export default googleDriveService;
export { googleDriveService };
window.googleDriveAPI = googleDriveService; // Backwards compatibility
