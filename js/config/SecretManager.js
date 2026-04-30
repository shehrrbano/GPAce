/**
 * SecretManager.js
 * Centralized manager for API keys and sensitive tokens.
 * Uses SecureStorage for persistent encrypted storage.
 */

import { secureStorage } from '../services/SecureStorage.js';

const DEFAULTS = {
    firebase: {
        apiKey: 'AIzaSyCdxGGpfoWD_M_6BwWFqWZ-6MAOKTUjIrI',
        appId: '1:949014366726:web:3aa05a6e133e2066c45187'
    },
    gemini: {
        apiKey: 'AIzaSyD_NmyxJDO--WtvXIU41sRJ7XqZWLNUFd0'
    },
    googleDrive: {
        clientId: '949014366726-b6tfica8j4il3ldqpoffh9m5u66gjs8q.apps.googleusercontent.com',
        apiKey: 'AIzaSyBZrMVZqDkYfuHWJgLeHJYxoHEqXqYm0Yk'
    }
};

class SecretManager {
    constructor() {
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        // One-time seed: If secure storage is empty, populate with defaults
        // In a production app, we would NOT include defaults in the code.
        // For this hardening exercise, we move them here as a transition.
        
        console.log('[SecretManager] Checking for missing secrets...');
        if (!(await secureStorage.hasSecure('firebase_apiKey'))) {
            await secureStorage.setSecure('firebase_apiKey', DEFAULTS.firebase.apiKey);
        }
        if (!(await secureStorage.hasSecure('firebase_appId'))) {
            await secureStorage.setSecure('firebase_appId', DEFAULTS.firebase.appId);
        }
        if (!(await secureStorage.hasSecure('gemini_apiKey'))) {
            await secureStorage.setSecure('gemini_apiKey', DEFAULTS.gemini.apiKey);
        }
        if (!(await secureStorage.hasSecure('gdrive_clientId'))) {
            await secureStorage.setSecure('gdrive_clientId', DEFAULTS.googleDrive.clientId);
        }
        if (!(await secureStorage.hasSecure('gdrive_apiKey'))) {
            await secureStorage.setSecure('gdrive_apiKey', DEFAULTS.googleDrive.apiKey);
        }
        
        this.initialized = true;
    }

    async getFirebaseKey() {
        await this.init();
        return await secureStorage.getSecure('firebase_apiKey');
    }

    async getGeminiKey() {
        await this.init();
        return await secureStorage.getSecure('gemini_apiKey');
    }

    async getGDriveClientId() {
        await this.init();
        return await secureStorage.getSecure('gdrive_clientId');
    }

    async getGDriveApiKey() {
        await this.init();
        return await secureStorage.getSecure('gdrive_apiKey');
    }
    
    async setGeminiKey(key) {
        await this.init();
        return await secureStorage.setSecure('gemini_apiKey', key);
    }
}

const secretManager = new SecretManager();
export default secretManager;
export { secretManager };
