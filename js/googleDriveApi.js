/**
 * GoogleDriveService.js
 * Unified service for Google Drive integration.
 * Hardened secrets and centralized storage usage.
 * 
 * FIX: Corrected token restore ordering so `isAuthorized` is set
 * BEFORE the `google-drive-initialized` event fires. Added
 * `google-drive-authorized` event and `gdrive_was_connected` persistence flag.
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
        this.tokenExpiry = 0;
        this._tokenRefreshTimer = null;

        // Promise to wait for initialization
        this.readyPromise = null;
        this.resolveReady = null;
        this.readyPromise = new Promise((resolve) => {
            this.resolveReady = resolve;
        });

        this.silentAuthFailed = false;
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
                // Still resolve to avoid hanging the app
                if (this.resolveReady) this.resolveReady();
                window.dispatchEvent(new CustomEvent('google-drive-initialized'));
                resolve();
                return;
            }

            gapi.load('client', async () => {
                try {
                    console.log('[GoogleDrive] GAPI client loaded, initializing...');
                    
                    // --- FIX: Restore persisted token FIRST, before anything fires ---
                    const savedToken = storageService.get('gdrive_access_token');
                    const savedExpiry = storageService.get('gdrive_token_expiry', 0);
                    
                    // Restore if token has at least 5 minutes left
                    if (savedToken && savedExpiry > Date.now() + 300000) {
                        console.log('[GoogleDrive] Found valid saved access token — restoring session silently');
                        this.accessToken = savedToken;
                        this.tokenExpiry = savedExpiry;
                        this.isAuthorized = true;
                        this.silentAuthFailed = false;
                    } else if (savedToken) {
                        console.log('[GoogleDrive] Saved token found but expired — will need re-auth');
                        // Clean up stale token
                        storageService.remove('gdrive_access_token');
                        storageService.remove('gdrive_token_expiry');
                    }
                    // --- END FIX ---

                    // Attempt to initialize gapi client
                    try {
                        const key = (this.apiKey || '').trim();
                        if (!key || key.length < 20) {
                            throw new Error('Invalid or missing API Key for Google Drive');
                        }

                        await gapi.client.init({
                            // apiKey omitted to avoid 400 errors; we use accessToken for Drive ops
                        });
                        
                        try {
                            await gapi.client.load('drive', 'v3');
                            console.log('[GoogleDrive] GAPI client initialized and Drive API loaded');
                        } catch (loadErr) {
                            console.error('[GoogleDrive] Failed to load Drive discovery doc:', loadErr);
                        }

                    } catch (initErr) {
                        console.warn('[GoogleDrive] GAPI client.init failed, trying fallback...', initErr);
                        try {
                            await gapi.client.init({});
                            try {
                                await gapi.client.load('drive', 'v3');
                            } catch (fallbackLoadErr) {
                                console.warn('[GoogleDrive] Fallback key also failed to load Drive API');
                            }
                        } catch (fallbackErr) {
                            console.error('[GoogleDrive] GAPI initialization failed completely:', fallbackErr);
                        }
                    }

                    // Set GAPI token if we have a restored session
                    if (this.isAuthorized && this.accessToken) {
                        try {
                            if (typeof gapi !== 'undefined' && gapi.client && typeof gapi.client.setToken === 'function') {
                                gapi.client.setToken({ access_token: this.accessToken });
                            }
                        } catch (e) {
                            console.warn('[GoogleDrive] Could not set GAPI token from restore:', e);
                        }
                        // Schedule proactive refresh
                        this._scheduleTokenRefresh();
                    }

                    // Mark as initialized and fire events
                    this.isInitialized = true;
                    if (this.resolveReady) this.resolveReady();
                    window.dispatchEvent(new CustomEvent('google-drive-initialized'));
                    
                    // --- FIX: Fire authorized event AFTER restoring session ---
                    if (this.isAuthorized) {
                        console.log('[GoogleDrive] Firing google-drive-authorized (restored session)');
                        window.dispatchEvent(new CustomEvent('google-drive-authorized', { 
                            detail: { token: this.accessToken, restored: true } 
                        }));
                        // Also fire the legacy event for backward compat
                        window.dispatchEvent(new CustomEvent('google-drive-authenticated', {
                            detail: { token: this.accessToken, restored: true }
                        }));
                    }
                    // --- END FIX ---

                    // Initialize GIS Token Client
                    if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
                        this.tokenClient = google.accounts.oauth2.initTokenClient({
                            client_id: this.clientId.trim(),
                            scope: this.SCOPES,
                            callback: (resp) => {
                                console.log('[GoogleDrive] GIS callback received:', resp?.error || 'success');
                                
                                if (resp.error) {
                                    if (resp.error === 'interaction_required' || resp.error === 'access_denied') {
                                        console.debug('[GoogleDrive] Silent auth interaction_required — user must click Connect');
                                        // Only mark failed if we don't already have a valid session
                                        if (!this.isAuthorized) {
                                            this.silentAuthFailed = true;
                                        }
                                    } else {
                                        console.error('[GoogleDrive] Auth error:', resp.error);
                                    }
                                    
                                    if (this._authResolve) {
                                        this._authResolve(null);
                                    }
                                    this._authResolve = null;
                                    this._authReject = null;
                                    this._authPromise = null;
                                    return;
                                }

                                this.accessToken = resp.access_token;
                                this.tokenExpiry = Date.now() + (resp.expires_in * 1000);
                                this.isAuthorized = true;
                                this.silentAuthFailed = false;
                                
                                // Persist token and connection flag
                                storageService.set('gdrive_access_token', this.accessToken);
                                storageService.set('gdrive_token_expiry', this.tokenExpiry);
                                storageService.set('gdrive_was_connected', true); // <-- persist connection state
                                
                                if (typeof gapi !== 'undefined' && gapi.client) {
                                    try { gapi.client.setToken({ access_token: this.accessToken }); } catch(e) {}
                                }

                                // Schedule proactive token refresh
                                this._scheduleTokenRefresh();

                                // Fire both events
                                window.dispatchEvent(new CustomEvent('google-drive-authorized', { detail: { token: this.accessToken } }));
                                window.dispatchEvent(new CustomEvent('google-drive-authenticated', { detail: { token: this.accessToken } }));
                                
                                if (this._authResolve) {
                                    this._authResolve(this.accessToken);
                                    this._authResolve = null;
                                    this._authReject = null;
                                    this._authPromise = null;
                                }
                            },
                        });
                    }

                    // ALWAYS resolve to prevent hanging the app initialization
                    resolve();
                } catch (err) {
                    console.error('[GoogleDrive] _initClient critical error:', err);
                    this.isInitialized = true;
                    if (this.resolveReady) this.resolveReady();
                    window.dispatchEvent(new CustomEvent('google-drive-initialized'));
                    resolve();
                }
            });
        });
    }

    /**
     * Schedule a proactive token refresh 5 minutes before expiry
     * @private
     */
    _scheduleTokenRefresh() {
        if (this._tokenRefreshTimer) {
            clearTimeout(this._tokenRefreshTimer);
            this._tokenRefreshTimer = null;
        }
        
        if (!this.tokenExpiry || !this.isAuthorized) return;
        
        const refreshIn = Math.max(0, this.tokenExpiry - Date.now() - 300000); // 5 min before expiry
        if (refreshIn <= 0) {
            // Already expired or about to expire — do silent refresh now
            this._doSilentRefresh();
            return;
        }
        
        console.log(`[GoogleDrive] Scheduling silent token refresh in ${Math.round(refreshIn / 60000)} minutes`);
        this._tokenRefreshTimer = setTimeout(() => {
            this._doSilentRefresh();
        }, refreshIn);
    }

    /**
     * Attempt a silent background token refresh
     * @private
     */
    async _doSilentRefresh() {
        if (!this.isInitialized || !this.tokenClient) {
            console.debug('[GoogleDrive] Skipping silent refresh: not initialized yet');
            return;
        }
        console.log('[GoogleDrive] Performing proactive silent token refresh...');
        try {
            await this.authorize(true);
        } catch (e) {
            console.warn('[GoogleDrive] Proactive silent refresh failed:', e);
        }
    }

    /**
     * Attempt to restore a previously authorized session.
     * Called by external code (e.g., auth.js) to avoid requiring manual "Connect Drive".
     */
    async restorePersistedSession() {
        await this.waitForReady();
        
        // Already authorized — nothing to do
        if (this.isAuthorized && this.accessToken && this.tokenExpiry > Date.now() + 60000) {
            return true;
        }
        
        // Check if user was previously connected (flag persists even when token expires)
        const wasConnected = storageService.get('gdrive_was_connected', false);
        if (!wasConnected) {
            console.debug('[GoogleDrive] User was never connected — skipping auto-restore');
            return false;
        }
        
        // Token may have expired, but user consented before — try silent auth
        if (!this.silentAuthFailed && this.tokenClient) {
            console.log('[GoogleDrive] User was previously connected — attempting silent re-auth...');
            const token = await this.authorize(true);
            if (token) {
                console.log('[GoogleDrive] Silent re-auth succeeded — session restored');
                return true;
            }
        }
        
        console.debug('[GoogleDrive] Could not silently restore session');
        return false;
    }

    async handleFirebaseSignIn(result) {
        await this.waitForReady();
        
        // If Firebase provided a Google access token, use it directly
        if (result && result.credential && result.credential.accessToken) {
            console.log('[GoogleDrive] Using access token from Firebase login');
            this.accessToken = result.credential.accessToken;
            this.tokenExpiry = Date.now() + 3500000;
            if (gapi?.client) {
                try { gapi.client.setToken({ access_token: this.accessToken }); } catch(e) {}
            }
            this.isAuthorized = true;
            this.silentAuthFailed = false;
            storageService.set('gdrive_access_token', this.accessToken);
            storageService.set('gdrive_token_expiry', this.tokenExpiry);
            storageService.set('gdrive_was_connected', true);
            this._scheduleTokenRefresh();
            window.dispatchEvent(new CustomEvent('google-drive-authorized', { detail: { token: this.accessToken } }));
            window.dispatchEvent(new CustomEvent('google-drive-authenticated'));
            return;
        }

        // If already authorized, no need to re-auth
        if (this.isAuthorized && this.accessToken && this.tokenExpiry > Date.now() + 60000) {
            console.debug('[GoogleDrive] handleFirebaseSignIn: already authorized, skipping silent auth');
            return;
        }

        // Try to restore persisted session (this handles the "was connected before" case)
        const restored = await this.restorePersistedSession();
        if (!restored && !this.silentAuthFailed) {
            console.log('[GoogleDrive] Triggering background authorization...');
            this.authorize(true).catch(e => console.debug('[GoogleDrive] Silent auth failed on Firebase sign-in:', e));
        }
    }

    async handleFirebaseSignOut() {
        this.accessToken = null;
        this.tokenExpiry = 0;
        this.isAuthorized = false;
        if (this._tokenRefreshTimer) {
            clearTimeout(this._tokenRefreshTimer);
            this._tokenRefreshTimer = null;
        }
        storageService.remove('gdrive_access_token');
        storageService.remove('gdrive_token_expiry');
        storageService.remove('gdrive_was_connected'); // Clear connection flag on explicit sign-out
        if (typeof gapi !== 'undefined' && gapi.client) {
            try { gapi.client.setToken(null); } catch(e) {}
        }
        window.dispatchEvent(new CustomEvent('google-drive-signed-out'));
    }

    async checkAuthStatus() {
        await this.waitForReady();
        if (!this.isAuthorized) return false;
        
        try {
            await gapi.client.drive.about.get({ fields: 'user' });
            return true;
        } catch (e) {
            console.warn('[GoogleDrive] Token invalid or expired — will need re-auth');
            this.isAuthorized = false;
            return false;
        }
    }

    async authorize(silent = false) {
        await this.waitForReady();
        
        // If already authorized and token is valid, just return
        if (this.isAuthorized && this.accessToken && this.tokenExpiry > Date.now() + 60000) {
            return this.accessToken;
        }

        // If a silent request is being asked but we already know it fails, skip
        if (silent && this.silentAuthFailed) {
            console.debug('[GoogleDrive] Skipping silent authorize: previous attempt failed interaction_required');
            return null;
        }

        // If tokenClient is not available yet (scripts still loading), don't attempt
        if (!this.tokenClient) {
            console.warn('[GoogleDrive] tokenClient not ready yet');
            return null;
        }

        // If a request is already in progress, wait for it
        if (this._authPromise) return this._authPromise;

        this._authPromise = new Promise((resolve, reject) => {
            this._authResolve = resolve;
            this._authReject = reject;

            try {
                if (silent) {
                    console.debug('[GoogleDrive] Attempting silent token refresh...');
                    this.tokenClient.requestAccessToken({ prompt: '' }); // empty prompt = auto (no popup)
                } else {
                    console.log('[GoogleDrive] Requesting user-interactive token...');
                    this.tokenClient.requestAccessToken({ prompt: 'select_account' });
                }
                
                // Set a timeout to prevent hanging
                setTimeout(() => {
                    if (this._authResolve) {
                        console.debug('[GoogleDrive] Auth request timed out');
                        const res = this._authResolve;
                        this._authResolve = null;
                        this._authReject = null;
                        this._authPromise = null;
                        if (silent) resolve(null);
                        else reject(new Error('Auth timeout'));
                    }
                }, 30000);

            } catch (err) {
                console.warn('[GoogleDrive] Token request exception:', err);
                this._authResolve = null;
                this._authReject = null;
                this._authPromise = null;
                if (silent) resolve(null);
                else reject(err);
            }
        }).finally(() => {
            this._authPromise = null;
        });

        return this._authPromise;
    }

    // --- API Methods ---

    async getTaskFiles(taskId) {
        await this.waitForReady();
        console.log('[GoogleDrive] getTaskFiles called with taskId:', taskId);
        if (!this.isAuthorized || !this.accessToken || this.tokenExpiry < Date.now()) {
            console.log('[GoogleDrive] Not authorized or expired, attempting silent authorize...');
            const token = await this.authorize(true);
            if (!token) {
                console.warn('[GoogleDrive] Silent authorization failed for getTaskFiles. User must sign in.');
                return [];
            }
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
        await this.waitForReady();

        if (!this.isAuthorized || !this.accessToken || this.tokenExpiry < Date.now() + 60000) {
            if (!this.silentAuthFailed) {
                console.debug('[GoogleDrive] refreshing token for query...');
                await this.authorize(true);
            }
        }

        if (!this.isAuthorized) {
            console.debug('[GoogleDrive] Query skipped: Not authorized and silent refresh not possible');
            return [];
        }

        try {
            let files = [];
            
            if (typeof gapi.client.drive !== 'undefined') {
                const response = await gapi.client.drive.files.list({
                    q: queryStr,
                    fields: 'files(id, name, mimeType, webViewLink, webContentLink, thumbnailLink, createdTime, iconLink, appProperties)',
                });
                files = response.result.files || [];
            } else {
                const query = encodeURIComponent(queryStr);
                const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,webViewLink,webContentLink,thumbnailLink,createdTime,iconLink,appProperties)`, {
                    headers: { 'Authorization': 'Bearer ' + this.accessToken }
                });
                
                if (response.status === 401 && retry) {
                    console.warn('[GoogleDrive] 401 detected in fetch, retrying after silent re-auth...');
                    this.isAuthorized = false;
                    const newToken = await this.authorize(true);
                    if (newToken) return this._executeDriveQuery(queryStr, false);
                    else throw new Error('Unauthorized');
                }

                if (!response.ok) throw new Error(`Query failed: ${response.status}`);
                const data = await response.json();
                files = data.files || [];
            }

            return files;

        } catch (err) {
            if ((err.status === 401 || (err.result?.error?.code === 401)) && retry) {
                console.warn('[GoogleDrive] 401 detected in GAPI, retrying after silent re-auth...');
                this.isAuthorized = false;
                const newToken = await this.authorize(true);
                if (newToken) return this._executeDriveQuery(queryStr, false);
            }
            console.error('[GoogleDrive] Query error:', err);
            return [];
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
                    category: materialType
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
                appProperties: { taskId: taskId }
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

export default googleDriveService;
export { googleDriveService };
window.googleDriveAPI = googleDriveService; // Backwards compatibility

// Auto-initialize on load
googleDriveService.init().catch(err => {
    console.error('[GoogleDrive] Auto-init failed:', err);
});
