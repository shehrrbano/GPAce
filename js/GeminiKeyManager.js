/**
 * GeminiKeyManager.js
 * Centralized Multi-API-Key Failover System for Gemini API
 * 
 * Features:
 * - Supports up to 10 Gemini API keys
 * - Automatic rotation on failure (429, quota, invalid key, timeout)
 * - Health tracking per key
 * - Daily quota reset at midnight local time
 * - Exponential backoff with max 3 retries per key
 * - UI status indicators
 * - Import/Export keys as JSON
 * - Singleton pattern for app-wide usage
 * 
 * @author GPAce Team
 * @version 1.0.0
 */

import storageService from './services/StorageService.js';

// Storage keys
const STORAGE_KEY = 'grind_gemini_keys_v2';
const DAILY_RESET_KEY = 'grind_gemini_daily_reset';

/**
 * Key object structure:
 * {
 *   id: string,           // Unique identifier (e.g., 'primary', 'backup_1')
 *   key: string,          // The actual API key
 *   name: string,         // Display name
 *   dailyQuota: number,   // Max requests per day (estimate)
 *   usageToday: number,   // Requests used today
 *   healthy: boolean,     // Is key currently healthy?
 *   lastError: string,    // Last error message
 *   lastUsed: number,     // Timestamp of last use
 *   failCount: number     // Consecutive failures
 * }
 */

class GeminiKeyManager {
    constructor() {
        // Singleton pattern
        if (GeminiKeyManager.instance) {
            return GeminiKeyManager.instance;
        }
        GeminiKeyManager.instance = this;

        this.keys = [];
        this.currentIndex = 0;
        this.isInitialized = false;
        this.maxRetriesPerKey = 3;
        this.backoffBaseMs = 1000;

        // Error patterns to trigger rotation
        this.rotationTriggers = [
            '429',
            'quota',
            'QUOTA_EXCEEDED',
            'RESOURCE_EXHAUSTED',
            'invalid api key',
            'API_KEY_INVALID',
            '500',
            '503',
            'timeout',
            'network error',
            'Failed to fetch'
        ];

        // Initialize
        this.init();
    }

    /**
     * Initialize the key manager
     */
    init() {
        console.log('[GeminiKeyManager] Initializing...');

        // Check for daily reset
        this.checkDailyReset();

        // Load keys from its own storage first
        this.loadFromStorage();

        // Then sync from Settings page (adds any missing keys)
        this.migrateLegacyKeys();

        this.isInitialized = true;

        // Log detailed status
        console.log(`[GeminiKeyManager] Ready with ${this.keys.length} keys`);
        console.log(`[GeminiKeyManager] Healthy keys: ${this.getHealthyKeys().length}`);
        console.log(`[GeminiKeyManager] Current key: ${this.getCurrentKey()?.name || 'None'}`);

        // Log all keys for debugging
        this.keys.forEach((k, i) => {
            console.log(`[GeminiKeyManager]   Key ${i + 1}: ${k.name} | healthy: ${k.healthy} | failCount: ${k.failCount} | key: ${k.key.substring(0, 10)}...`);
        });
    }

    /**
     * Check if it's a new day and reset usage counters
     */
    checkDailyReset() {
        const today = new Date().toDateString();
        const lastReset = storageService.get(DAILY_RESET_KEY);

        if (lastReset !== today) {
            console.log('[GeminiKeyManager] New day detected, resetting daily counters');
            this.keys.forEach(key => {
                key.usageToday = 0;
                key.failCount = 0;
                // Reset health if it was quota-related
                if (key.lastError?.toLowerCase().includes('quota')) {
                    key.healthy = true;
                    key.lastError = null;
                }
            });
            storageService.set(DAILY_RESET_KEY, today);
            this.saveToStorage();
        }
    }

    /**
     * Load keys from localStorage
     */
    loadFromStorage() {
        try {
            const data = storageService.get(STORAGE_KEY);
            if (data) {
                this.keys = data.keys || [];
                this.currentIndex = data.currentIndex || 0;
                console.log(`[GeminiKeyManager] Loaded ${this.keys.length} keys from storage`);
            }
        } catch (e) {
            console.warn('[GeminiKeyManager] Failed to load from storage:', e);
            this.keys = [];
        }
    }

    /**
     * Save keys to localStorage
     */
    saveToStorage() {
        try {
            const data = {
                keys: this.keys,
                currentIndex: this.currentIndex,
                lastUpdated: Date.now()
            };
            storageService.set(STORAGE_KEY, data);
        } catch (e) {
            console.warn('[GeminiKeyManager] Failed to save to storage:', e);
        }
    }

    /**
     * Sync keys from Settings storage (geminiApiKey, geminiApiKey2, etc.)
     * This ALWAYS runs to pick up any new keys added via Settings UI
     * Checks multiple storage locations due to various storage mechanisms used
     */
    async migrateLegacyKeys() {
        console.log('[GeminiKeyManager] Syncing with Settings page keys...');

        // Define key mappings
        const keyDefs = [
            { id: 'primary', storageKey: 'geminiApiKey', name: 'Primary Key' },
            { id: 'backup_1', storageKey: 'geminiApiKey2', name: 'Backup Key 1' },
            { id: 'backup_2', storageKey: 'geminiApiKey3', name: 'Backup Key 2' }
        ];

        let addedCount = 0;
        let updatedCount = 0;

        for (const keyDef of keyDefs) {
            try {
                let keyValue = null;

                // Try multiple storage locations in order of preference:
                // 1. SecureStorage (encrypted) - window.SecureStorage.getSecure()
                if (!keyValue && window.SecureStorage && typeof window.SecureStorage.getSecure === 'function') {
                    try {
                        keyValue = await window.SecureStorage.getSecure(keyDef.storageKey, null);
                        if (keyValue) console.log(`[GeminiKeyManager] Found ${keyDef.name} via SecureStorage`);
                    } catch (e) { /* ignore */ }
                }

                // 2. StorageService with gpace_ prefix + secure_ prefix (full path for encrypted)
                if (!keyValue) {
                    const fullSecureKey = `gpace_secure_${keyDef.storageKey}`;
                    const encrypted = storageService.get(fullSecureKey);
                    if (encrypted) {
                        // This is encrypted, we need SecureStorage to decrypt it
                        if (window.SecureStorage && typeof window.SecureStorage.getSecure === 'function') {
                            keyValue = await window.SecureStorage.getSecure(keyDef.storageKey, null);
                            if (keyValue) console.log(`[GeminiKeyManager] Found ${keyDef.name} via encrypted storage`);
                        }
                    }
                }

                // 3. StorageService with gpace_ prefix (non-encrypted)
                if (!keyValue) {
                    const gpaceKey = `gpace_${keyDef.storageKey}`;
                    keyValue = storageService.get(gpaceKey);
                    if (keyValue) {
                        // Parse if it's JSON-stringified
                        try { keyValue = JSON.parse(keyValue); } catch (e) { /* not JSON */ }
                        if (keyValue) console.log(`[GeminiKeyManager] Found ${keyDef.name} via gpace_ prefix`);
                    }
                }

                // 4. Raw localStorage (legacy)
                if (!keyValue) {
                    keyValue = storageService.get(keyDef.storageKey);
                    if (keyValue) console.log(`[GeminiKeyManager] Found ${keyDef.name} via raw localStorage`);
                }

                // Process found key
                if (keyValue && typeof keyValue === 'string' && keyValue.trim()) {
                    const trimmedKey = keyValue.trim();

                    // Check if this key already exists by ID
                    const existing = this.keys.find(k => k.id === keyDef.id);

                    if (existing) {
                        if (existing.key !== trimmedKey) {
                            existing.key = trimmedKey;
                            existing.healthy = true;
                            existing.failCount = 0;
                            existing.lastError = null;
                            updatedCount++;
                            console.log(`[GeminiKeyManager] Updated key: ${keyDef.name}`);
                        } else {
                            // Even if key is same, ensure it is healthy now since we are syncing
                            existing.healthy = true;
                            existing.failCount = 0;
                            console.log(`[GeminiKeyManager] Key ${keyDef.name} confirmed healthy via sync`);
                        }
                    } else {
                        // Add new key
                        this.keys.push({
                            id: keyDef.id,
                            key: trimmedKey,
                            name: keyDef.name,
                            dailyQuota: 1500,
                            usageToday: 0,
                            healthy: true,
                            lastError: null,
                            lastUsed: null,
                            failCount: 0
                        });
                        addedCount++;
                        console.log(`[GeminiKeyManager] Added key from Settings: ${keyDef.name}`);
                    }
                }
            } catch (e) {
                console.warn(`[GeminiKeyManager] Failed to sync ${keyDef.storageKey}:`, e);
            }
        }

        if (addedCount > 0 || updatedCount > 0) {
            this.saveToStorage();
            console.log(`[GeminiKeyManager] Sync complete. Total keys: ${this.keys.length}, Added: ${addedCount}, Updated: ${updatedCount}`);
        } else if (this.keys.length === 0) {
            console.warn('[GeminiKeyManager] No keys found in any storage location!');
            console.log('[GeminiKeyManager] Checked: SecureStorage, gpace_secure_*, gpace_*, raw localStorage');
        } else {
            console.log(`[GeminiKeyManager] Keys already in sync. Total: ${this.keys.length}`);
        }
    }

    /**
     * Add a new API key
     * @param {Object} keyData - Key configuration object
     */
    addKey(keyData) {
        // Validate required fields
        if (!keyData.key || !keyData.key.trim()) {
            throw new Error('API key is required');
        }

        // Check for duplicates
        const exists = this.keys.find(k => k.key === keyData.key.trim());
        if (exists) {
            console.warn('[GeminiKeyManager] Key already exists, updating...');
            Object.assign(exists, keyData);
            this.saveToStorage();
            return exists;
        }

        const newKey = {
            id: keyData.id || `key_${Date.now()}`,
            key: keyData.key.trim(),
            name: keyData.name || `Key ${this.keys.length + 1}`,
            dailyQuota: keyData.dailyQuota || 1500,
            usageToday: keyData.usageToday || 0,
            healthy: keyData.healthy !== false,
            lastError: keyData.lastError || null,
            lastUsed: keyData.lastUsed || null,
            failCount: keyData.failCount || 0
        };

        this.keys.push(newKey);
        this.saveToStorage();
        console.log(`[GeminiKeyManager] Added key: ${newKey.name}`);

        return newKey;
    }

    /**
     * Remove a key by ID
     * @param {string} keyId - Key ID to remove
     */
    removeKey(keyId) {
        const index = this.keys.findIndex(k => k.id === keyId);
        if (index > -1) {
            const removed = this.keys.splice(index, 1)[0];
            console.log(`[GeminiKeyManager] Removed key: ${removed.name}`);

            // Adjust current index if needed
            if (this.currentIndex >= this.keys.length) {
                this.currentIndex = 0;
            }

            this.saveToStorage();
            return removed;
        }
        return null;
    }

    /**
     * Get all healthy keys
     */
    getHealthyKeys() {
        return this.keys.filter(k => k.healthy);
    }

    /**
     * Get the current active key
     * @returns {Object|null} Current key object or null if none available
     */
    getCurrentKey() {
        const healthyKeys = this.getHealthyKeys();
        if (healthyKeys.length === 0) {
            // Try to find any key that hasn't exceeded fail count
            const recoverableKeys = this.keys.filter(k => k.failCount < this.maxRetriesPerKey);
            if (recoverableKeys.length > 0) {
                return recoverableKeys[0];
            }
            
            // EMERGENCY FALLBACK: If all keys are marked unhealthy, try the first one anyway
            // This prevents being stuck in "exhausted" state if network was down
            if (this.keys.length > 0) {
                console.warn('[GeminiKeyManager] All keys marked unhealthy. Trying first key as fallback.');
                this.keys[0].healthy = true;
                this.keys[0].failCount = 0;
                return this.keys[0];
            }
            
            return null;
        }

        // Get current from healthy keys
        const index = this.currentIndex % healthyKeys.length;
        return healthyKeys[index];
    }

    /**
     * Get the current API key string
     * @returns {string|null} API key string or null
     */
    getKey() {
        const current = this.getCurrentKey();
        return current ? current.key : null;
    }

    /**
     * Rotate to the next available key
     * @returns {boolean} True if rotation succeeded, false if no more keys
     */
    rotate() {
        const healthyKeys = this.getHealthyKeys();

        if (healthyKeys.length <= 1) {
            console.warn('[GeminiKeyManager] No more keys to rotate to');
            return false;
        }

        const prevIndex = this.currentIndex;
        this.currentIndex = (this.currentIndex + 1) % healthyKeys.length;

        const newKey = healthyKeys[this.currentIndex];
        console.log(`[GeminiKeyManager] Rotated from key ${prevIndex + 1} to key ${this.currentIndex + 1} (${newKey?.name})`);

        this.saveToStorage();
        return true;
    }

    /**
     * Mark current key as having an error
     * @param {Error|string} error - The error that occurred
     */
    markError(error) {
        const current = this.getCurrentKey();
        if (!current) return;

        const errorMessage = error?.message || String(error);
        current.failCount++;
        current.lastError = errorMessage;

        // Check if error is a rotation trigger
        const shouldRotate = this.rotationTriggers.some(trigger =>
            errorMessage.toLowerCase().includes(trigger.toLowerCase())
        );

        console.log(`[GeminiKeyManager] Key ${current.name} error (${current.failCount}/${this.maxRetriesPerKey}): ${errorMessage}`);

        // Mark as unhealthy if max retries reached
        if (current.failCount >= this.maxRetriesPerKey) {
            current.healthy = false;
            console.log(`[GeminiKeyManager] Key ${current.name} marked as unhealthy`);
        }

        this.saveToStorage();

        // Auto-rotate if needed
        if (shouldRotate || current.failCount >= this.maxRetriesPerKey) {
            return this.rotate();
        }

        return false;
    }

    /**
     * Mark current key as successful
     */
    markSuccess() {
        const current = this.getCurrentKey();
        if (!current) return;

        current.usageToday++;
        current.failCount = 0;
        current.healthy = true;
        current.lastUsed = Date.now();
        current.lastError = null;

        this.saveToStorage();
    }

    /**
     * Execute a function with automatic key rotation and retry
     * @param {Function} fn - Async function that takes an API key as parameter
     * @param {Object} options - Options for retry behavior
     * @returns {Promise} Result of the function
     */
    async withKeyRotation(fn, options = {}) {
        const { maxTotalRetries = 9, label = 'API call' } = options;

        let totalAttempts = 0;
        let lastError = null;

        while (totalAttempts < maxTotalRetries) {
            const key = this.getKey();

            if (!key) {
                throw new Error('All Gemini API keys exhausted. Please add more keys or try again tomorrow.');
            }

            const currentKeyObj = this.getCurrentKey();
            const keyLabel = currentKeyObj?.name || `Key ${this.currentIndex + 1}`;

            try {
                totalAttempts++;
                console.log(`[GeminiKeyManager] ${label} attempt ${totalAttempts} with ${keyLabel}`);

                const result = await fn(key);

                // Success!
                this.markSuccess();
                return result;

            } catch (error) {
                lastError = error;
                const errorMsg = error?.message || String(error);
                console.warn(`[GeminiKeyManager] ${keyLabel} failed: ${errorMsg}`);

                // Mark error and potentially rotate
                const rotated = this.markError(error);

                if (!rotated && this.getHealthyKeys().length === 0) {
                    // No more keys
                    throw new Error(`All Gemini API keys failed. Last error: ${errorMsg}`);
                }

                // Exponential backoff before retry
                const backoffMs = Math.min(this.backoffBaseMs * Math.pow(2, totalAttempts - 1), 10000);
                console.log(`[GeminiKeyManager] Waiting ${backoffMs}ms before retry...`);
                await this.sleep(backoffMs);
            }
        }

        throw lastError || new Error('Max retries exceeded');
    }

    /**
     * Sleep helper
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get status summary for UI display
     * @returns {Object} Status object
     */
    getStatus() {
        const healthyKeys = this.getHealthyKeys();
        const totalQuota = this.keys.reduce((sum, k) => sum + k.dailyQuota, 0);
        const usedQuota = this.keys.reduce((sum, k) => sum + k.usageToday, 0);
        const remainingQuota = totalQuota - usedQuota;
        const percentRemaining = totalQuota > 0 ? (remainingQuota / totalQuota) * 100 : 0;

        return {
            totalKeys: this.keys.length,
            healthyKeys: healthyKeys.length,
            currentKeyIndex: this.currentIndex + 1,
            currentKeyName: this.getCurrentKey()?.name || 'None',
            totalQuota,
            usedQuota,
            remainingQuota,
            percentRemaining: Math.round(percentRemaining),
            isLowQuota: percentRemaining < 20,
            allExhausted: healthyKeys.length === 0
        };
    }

    /**
     * Export keys as JSON (for backup)
     * @returns {string} JSON string of keys
     */
    exportKeys() {
        const exportData = this.keys.map(k => ({
            id: k.id,
            key: k.key,
            name: k.name,
            dailyQuota: k.dailyQuota
        }));
        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Import keys from JSON
     * @param {string} jsonString - JSON string of keys
     */
    importKeys(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            if (!Array.isArray(imported)) {
                throw new Error('Invalid format: expected array');
            }

            let importedCount = 0;
            for (const keyData of imported) {
                if (keyData.key) {
                    this.addKey(keyData);
                    importedCount++;
                }
            }

            console.log(`[GeminiKeyManager] Imported ${importedCount} keys`);
            return importedCount;
        } catch (e) {
            console.error('[GeminiKeyManager] Import failed:', e);
            throw new Error('Failed to import keys: ' + e.message);
        }
    }

    /**
     * Test a specific key's connectivity
     * @param {string} apiKey - API key to test
     * @returns {Promise<Object>} Test result
     */
    async testKey(apiKey) {
        try {
            const { GoogleGenerativeAI } = await import('https://esm.run/@google/generative-ai');
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

            const result = await model.generateContent('Say "OK" if you can read this.');
            const response = await result.response;
            const text = response.text();

            return {
                success: true,
                message: 'Key is valid and working',
                response: text.substring(0, 50)
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Key test failed',
                error: error
            };
        }
    }

    /**
     * Reset all keys (clear fail counts, restore health)
     */
    resetAllKeys() {
        this.keys.forEach(key => {
            key.healthy = true;
            key.failCount = 0;
            key.lastError = null;
        });
        this.currentIndex = 0;
        this.saveToStorage();
        console.log('[GeminiKeyManager] All keys reset');
    }

    /**
     * Force a sync from Settings page keys
     * Call this after user saves API keys in Settings
     */
    async syncFromSettings() {
        await this.migrateLegacyKeys();
        return this.getStatus();
    }
}

// Create singleton instance
const geminiKeyManager = new GeminiKeyManager();

// Expose globally for non-module scripts
window.GeminiKeyManager = GeminiKeyManager;
window.geminiKeyManager = geminiKeyManager;

// Also expose a sync function globally for easy access
window.syncGeminiKeys = async () => {
    await geminiKeyManager.syncFromSettings();
    console.log('[GeminiKeyManager] Manual sync complete:', geminiKeyManager.getStatus());
};

// Export for ES modules
export { GeminiKeyManager, geminiKeyManager };
export default geminiKeyManager;

