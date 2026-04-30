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
        this.SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.install https://www.googleapis.com/auth/drive.resource';
        
        this.isInitialized = false;
        this.isAuthorized = false;
        this.tokenClient = null;
        this.accessToken = null;

        // Promise to wait for initialization
        this.readyPromise = null;
        this.resolveReady = null;
        this.readyPromise = new Promise((resolve) => {
            this.resolveReady = resolve;
        });
    }

    /**
     * Wait for the service to be fully initialized
     */
    async waitForReady() {
        return this.readyPromise;
    }

    async initialize() {
        return this.init();
    }

    async init() {
        if (this.isInitialized) return;
        
        console.log('[GoogleDrive] Initializing service...');
        
        try {
            // 1. Ensure scripts are loaded
            await this._loadScripts();
            
            // 2. Initialize secrets
            this.clientId = await SecretManager.getGDriveClientId();
            this.apiKey = await SecretManager.getGDriveApiKey();
            
            // 3. Initialize GAPI and GIS
            await this._initClient();
            
            this.isInitialized = true;
            console.log('[GoogleDrive] Service initialized successfully');
            
            // Resolve the ready promise
            if (this.resolveReady) this.resolveReady();
            window.dispatchEvent(new CustomEvent('google-drive-initialized'));
            
        } catch (error) {
            console.error('[GoogleDrive] Initialization failed:', error);
            throw error;
        }
    }

    async _loadScripts() {
        const loadScript = (src) => new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });

        await Promise.all([
            loadScript('https://apis.google.com/js/api.js'),
            loadScript('https://accounts.google.com/gsi/client')
        ]);
    }

    async _initClient() {
        return new Promise((resolve) => {
            if (typeof gapi === 'undefined') {
                console.error('[GoogleDrive] gapi not loaded');
                resolve();
                return;
            }

            gapi.load('client', async () => {
                try {
                    console.log('[GoogleDrive] GAPI client loaded, initializing...');
                    
                    // Attempt to initialize client with discovery docs
                    try {
                        const key = (this.apiKey || '').trim();
                        console.log(`[GoogleDrive] Initializing with key: ${key.substring(0, 5)}...${key.substring(key.length - 4)} (Length: ${key.length})`);
                        
                        if (!key || key.length < 20) {
                            throw new Error('Invalid or missing API Key for Google Drive');
                        }

                        await gapi.client.init({
                            // apiKey: key, // Removed to avoid 400 errors on discovery doc fetch for restricted keys
                            // We use accessToken for all Drive operations anyway.
                        });
                        
                        // Load the Drive API specifically with error handling
                        try {
                            await gapi.client.load('drive', 'v3');
                            console.log('[GoogleDrive] GAPI client initialized and Drive API loaded');
                        } catch (loadErr) {
                            console.error('[GoogleDrive] Failed to load Drive discovery doc:', loadErr);
                            console.info('[GoogleDrive] This often happens if the API key is restricted or Google Drive API is not enabled in Cloud Console.');
                            // We don't rethrow here to allow GIS initialization to proceed
                        }

                        console.log('[GoogleDrive] gapi.client.init success');
                    } catch (initErr) {
                        console.warn('[GoogleDrive] GAPI client.init failed with primary key, trying fallback...', initErr);
                        try {
                            const fallbackKey = await SecretManager.getFirebaseKey();
                            await gapi.client.init({});
                            try {
                                await gapi.client.load('drive', 'v3');
                                console.log('[GoogleDrive] GAPI client initialized with fallback key');
                            } catch (fallbackLoadErr) {
                                console.warn('[GoogleDrive] Fallback key also failed to load Drive API');
                            }
                        } catch (fallbackErr) {
                            console.error('[GoogleDrive] GAPI initialization failed completely:', fallbackErr);
                            // Still try to setToken if we have one, REST might work
                        }
                    } finally {
                        this.isInitialized = true;
                        if (this.resolveReady) this.resolveReady();
                        window.dispatchEvent(new CustomEvent('google-drive-initialized'));
                    }


                    // Initialize GIS Token Client regardless of GAPI init status
                    if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
                        this.tokenClient = google.accounts.oauth2.initTokenClient({
                            client_id: this.clientId.trim(),
                            scope: this.SCOPES,
                            callback: (resp) => {
                                console.log('[GoogleDrive] GIS callback received:', resp);
                                if (resp.error) {
                                    console.error('[GoogleDrive] Auth error:', resp.error);
                                    if (this._authReject) this._authReject(resp);
                                    return;
                                }
                                this.accessToken = resp.access_token;
                                this.isAuthorized = true;
                                storageService.set('gdrive_access_token', this.accessToken);
                                
                                if (typeof gapi !== 'undefined' && gapi.client) {
                                    try { gapi.client.setToken({ access_token: this.accessToken }); } catch(e) {}
                                }

                                window.dispatchEvent(new CustomEvent('google-drive-authenticated', { detail: { token: this.accessToken } }));
                                
                                if (this._authResolve) {
                                    this._authResolve(this.accessToken);
                                    this._authResolve = null;
                                    this._authReject = null;
                                }
                            },
                        });
                    }

                    // Check for existing token in storage
                    const savedToken = storageService.get('gdrive_access_token');
                    if (savedToken) {
                        console.log('[GoogleDrive] Found saved access token');
                        this.accessToken = savedToken;
                        if (typeof gapi.client !== 'undefined' && typeof gapi.client.setToken === 'function') {
                            try {
                                gapi.client.setToken({ access_token: savedToken });
                            } catch (e) {
                                console.warn('[GoogleDrive] Failed to set token in GAPI client:', e);
                            }
                        }
                        this.isAuthorized = true;
                    }

                    // ALWAYS resolve to prevent hanging the app initialization
                    resolve();
                } catch (err) {
                    console.error('[GoogleDrive] _initClient critical error:', err);
                    resolve(); // Still resolve so app doesn't hang
                }
            });
        });
    }

    async handleFirebaseSignIn(result) {
        await this.waitForReady();
        
        // If Firebase provided a Google access token, use it!
        if (result && result.credential && result.credential.accessToken) {
            console.log('[GoogleDrive] Using access token from Firebase login');
            this.accessToken = result.credential.accessToken;
            gapi.client.setToken({ access_token: this.accessToken });
            this.isAuthorized = true;
            storageService.set('gdrive_access_token', this.accessToken);
            window.dispatchEvent(new CustomEvent('google-drive-authenticated'));
            return;
        }

        // Otherwise, trigger silent auth if we have a token, or wait for user action
        if (!this.isAuthorized) {
            console.log('[GoogleDrive] Triggering background authorization...');
            this.authorize(true); 
        }
    }

    async handleFirebaseSignOut() {
        this.accessToken = null;
        this.isAuthorized = false;
        storageService.remove('gdrive_access_token');
        if (typeof gapi !== 'undefined' && gapi.client) {
            gapi.client.setToken(null);
        }
    }

    async checkAuthStatus() {
        await this.waitForReady();
        if (!this.isAuthorized) return false;
        
        try {
            // Simple request to verify token
            await gapi.client.drive.about.get({ fields: 'user' });
            return true;
        } catch (e) {
            console.warn('[GoogleDrive] Token invalid or expired');
            this.isAuthorized = false;
            return false;
        }
    }

    async authorize(silent = false) {
        await this.init();
        
        // If already authorized, just return
        if (this.isAuthorized && this.accessToken) return this.accessToken;

        return new Promise((resolve, reject) => {
            // Store current resolvers to be called by the GIS callback
            this._authResolve = resolve;
            this._authReject = reject;

            try {
                if (silent) {
                    console.log('[GoogleDrive] Requesting silent token refresh...');
                    this.tokenClient.requestAccessToken({ prompt: 'none' });
                } else {
                    console.log('[GoogleDrive] Requesting user-interactive token...');
                    this.tokenClient.requestAccessToken({ prompt: '' });
                }
                
                // Set a timeout to prevent hanging forever
                setTimeout(() => {
                    if (!this.isAuthorized && this._authReject) {
                        this._authReject(new Error('Auth timeout'));
                        this._authResolve = null;
                        this._authReject = null;
                    }
                }, 60000); // 1 minute timeout for user interaction

            } catch (err) {
                console.error('[GoogleDrive] Token request failed:', err);
                reject(err);
            }
        });
    }

    // --- API Methods ---

    async getTaskFiles(taskId) {
        await this.waitForReady();
        console.log('[GoogleDrive] getTaskFiles called with taskId:', taskId);
        if (!this.isAuthorized) {
            console.log('[GoogleDrive] Not authorized, attempting to authorize...');
            await this.authorize();
        }

        try {
            return await this._executeDriveQuery(`appProperties has { key='taskId' and value='${taskId}' } and trashed = false`);
        } catch (err) {
            console.error('[GoogleDrive] getTaskFiles error:', err);
            return [];
        }
    }

    async getSubjectFiles(subjectTag) {
        await this.waitForReady();
        console.log('[GoogleDrive] getSubjectFiles called with subjectTag:', subjectTag);
        
        try {
            // Precise filter: subjectTag + (isLibraryItem OR specific reference keywords) - Exclude notes/slides globally
            const queryStr = `((appProperties has { key='subjectTag' and value='${subjectTag}' } and appProperties has { key='isLibraryItem' and value='true' }) or (name contains '${subjectTag}' and (name contains 'textbook' or name contains 'reference' or name contains 'manual' or name contains 'handbook' or name contains 'guide'))) and not name contains 'SourceNotes' and not name contains 'Chapter' and not name contains 'Slide' and not name contains 'Lesson' and trashed = false`;
            return await this._executeDriveQuery(queryStr);
        } catch (err) {
            console.error('[GoogleDrive] getSubjectFiles error:', err);
            return [];
        }
    }

    /**
     * Shared logic to execute a query with 401 retry logic
     */
    async _executeDriveQuery(queryStr, retry = true) {
        if (!this.isAuthorized) {
            console.log('[GoogleDrive] Not authorized, attempting to authorize...');
            await this.authorize(true); // Try silent first
        }

        try {
            if (typeof gapi.client.drive !== 'undefined') {
                const response = await gapi.client.drive.files.list({
                    q: queryStr,
                    fields: 'files(id, name, mimeType, webViewLink, webContentLink, thumbnailLink, createdTime, iconLink, appProperties)',
                });
                return response.result.files || [];
            }

            // Fallback to REST fetch
            const query = encodeURIComponent(queryStr);
            const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,webViewLink,webContentLink,thumbnailLink,createdTime,iconLink,appProperties)`, {
                headers: { 'Authorization': 'Bearer ' + this.accessToken }
            });
            
            if (response.status === 401 && retry) {
                console.warn('[GoogleDrive] 401 detected, retrying after re-auth...');
                this.isAuthorized = false;
                await this.authorize(false); // Interactive re-auth
                return this._executeDriveQuery(queryStr, false);
            }

            if (!response.ok) throw new Error(`Query failed: ${response.status}`);
            const data = await response.json();
            return data.files || [];

        } catch (err) {
            if (err.status === 401 && retry) {
                this.isAuthorized = false;
                await this.authorize(false);
                return this._executeDriveQuery(queryStr, false);
            }
            throw err;
        }
    }

    async uploadSubjectFile(file, subjectTag, materialType = 'general') {
        await this.waitForReady();
        if (!this.isAuthorized) await this.authorize();

        try {
            const metadata = {
                name: file.name,
                mimeType: file.type,
                appProperties: {
                    subjectTag: subjectTag,
                    isLibraryItem: 'true',
                    materialType: materialType,
                    category: materialType // Legacy compatibility
                }
            };

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', file);

            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: new Headers({ 'Authorization': 'Bearer ' + this.accessToken }),
                body: form
            });

            if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
            return await response.json();
        } catch (err) {
            console.error('[GoogleDrive] uploadSubjectFile error:', err);
            throw err;
        }
    }

    async uploadFile(file, taskId) {
        await this.waitForReady();
        if (!this.isAuthorized) await this.authorize();

        try {
            const metadata = {
                name: file.name,
                mimeType: file.type,
                appProperties: {
                    taskId: taskId
                }
            };

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', file);

            // Priority 1: Use GAPI client if available
            if (typeof gapi.client.drive !== 'undefined') {
                // GAPI client doesn't support multipart upload easily, so we use fetch anyway for uploads
                // but we keep the logic here for consistency
            }

            console.log('[GoogleDrive] Using REST fetch for file upload:', file.name);
            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: new Headers({ 'Authorization': 'Bearer ' + this.accessToken }),
                body: form
            });

            if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
            return await response.json();

        } catch (err) {
            console.error('[GoogleDrive] uploadFile error:', err);
            throw err;
        }
    }

    async deleteFile(fileId) {
        await this.waitForReady();
        if (!this.isAuthorized) await this.authorize();
        try {
            if (typeof gapi.client.drive !== 'undefined') {
                await gapi.client.drive.files.delete({ fileId: fileId });
                return true;
            }

            // Fallback
            const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + this.accessToken }
            });
            return response.ok;
        } catch (err) {
            console.error('[GoogleDrive] deleteFile error:', err);
            return false;
        }
    }

    // Alias for compatibility with components using the older fetchFiles name
    async fetchFiles(query = '') {
        return this.getTaskFiles(query);
    }
}

const googleDriveService = new GoogleDriveService();

// Auto-initialize when loaded
if (typeof window !== 'undefined') {
    googleDriveService.init().catch(err => console.warn('[GoogleDrive] Auto-init failed:', err));
}

export default googleDriveService;
export { googleDriveService };
window.googleDriveAPI = googleDriveService; // Backwards compatibility
