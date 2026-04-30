/**
 * StorageService.js
 * Centralized localStorage abstraction with validation, versioning, and error handling.
 * Part of Batch 4: Storage Layer Abstraction.
 * 
 * Features:
 * - JSON parsing/stringification with error handling
 * - Default values for missing keys
 * - Schema validation (optional)
 * - Namespace prefixing to avoid collisions
 * - Migration support for schema changes
 * 
 * Usage:
 *   import StorageService from './StorageService.js';
 *   
 *   // Get with default value
 *   const theme = StorageService.get('theme', 'dark');
 *   
 *   // Set value (auto-stringifies objects)
 *   StorageService.set('userPrefs', { theme: 'dark', fontSize: 14 });
 *   
 *   // Remove key
 *   StorageService.remove('userPrefs');
 */

/**
 * Storage keys used across the application
 */
const STORAGE_KEYS = {
    // Theme
    THEME: 'theme',

    // Semester System
    CURRENT_SEMESTER: 'currentAcademicSemester',
    SEMESTERS: 'academicSemesters',
    SEMESTER_MIGRATION_DONE: 'semesterMigrationDone',

    // Legacy / Task related (now handled by TaskSystem, but here for compatibility)
    LEGACY_SUBJECTS: 'academicSubjects',
    TASKS_V5_PREFIX: 'tasks_v5.',
    PRIORITY_TASKS: 'priorityTasks',

    // Alarms
    ALARMS: 'alarms',

    // User preferences
    USER_PREFERENCES: 'userPreferences',
    
    // API Keys
    GEMINI_API_KEY: 'api.gemini',
    TODOIST_ACCESS_TOKEN: 'api.todoist'
};

const STORAGE_PREFIX = 'gpace_';
const SCHEMA_VERSION_KEY = 'gpace_schema_version';
const CURRENT_SCHEMA_VERSION = 1;

class StorageService {
    constructor() {
        this.prefix = STORAGE_PREFIX;
        this.schemaVersion = CURRENT_SCHEMA_VERSION;
        this.STORAGE_KEYS = STORAGE_KEYS; // For StorageAdapter compatibility
        this.listeners = new Map();

        // Check and run migrations on initialization
        this._checkMigrations();
    }

    /**
     * Get a value from localStorage
     * @param {string} key - The storage key (without prefix)
     * @param {*} defaultValue - Default value if key doesn't exist or parse fails
     * @param {Object} options - Optional settings
     * @param {boolean} options.raw - If true, don't JSON parse (return raw string)
     * @param {Function} options.validate - Validation function, returns boolean
     * @returns {*} The stored value or default
     */
    get(key, defaultValue = null, options = {}) {
        const fullKey = this._prefixKey(key);

        try {
            const raw = localStorage.getItem(fullKey);

            if (raw === null) {
                return defaultValue;
            }

            // Return raw string if requested
            if (options.raw) {
                return raw;
            }

            // Try to parse JSON, with graceful fallback for plain strings
            try {
                const parsed = JSON.parse(raw);

                // Validate if validator provided
                if (options.validate && typeof options.validate === 'function') {
                    if (!options.validate(parsed)) {
                        console.warn(`[StorageService] Validation failed for key: ${key}`);
                        return defaultValue;
                    }
                }

                return parsed;
            } catch (parseError) {
                // Handle plain string values that aren't valid JSON (legacy data)
                // Common for keys like 'theme' that may store 'dark' or 'light' as raw strings
                if (typeof raw === 'string' && raw.length > 0) {
                    // Check if it looks like a simple value (not a broken JSON object/array)
                    const trimmed = raw.trim();
                    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
                        // Return raw string value - it's likely a legacy plain string
                        return raw;
                    }
                }
                // For broken JSON objects/arrays, log and return default
                console.debug(`[StorageService] Could not parse key "${key}" as JSON, returning raw value`);
                return raw;
            }
        } catch (error) {
            console.warn(`[StorageService] Error reading key "${key}":`, error.message);
            return defaultValue;
        }
    }

    /**
     * Set a value in localStorage
     * @param {string} key - The storage key (without prefix)
     * @param {*} value - The value to store (will be JSON stringified)
     * @param {Object} options - Optional settings
     * @param {boolean} options.raw - If true, don't JSON stringify (store raw string)
     * @returns {boolean} Success status
     */
    set(key, value, options = {}) {
        const fullKey = this._prefixKey(key);

        try {
            // Guard against [object Object] by ensuring we don't accidentally call .toString() on an object
            // storageService.set should ALWAYS stringify objects unless options.raw is true
            let toStore;
            if (options.raw) {
                toStore = String(value);
            } else {
                toStore = typeof value === 'object' ? JSON.stringify(value) : JSON.stringify(value);
            }
            
            localStorage.setItem(fullKey, toStore);

            // Notify listeners
            this._notifyListeners(key, value);

            return true;
        } catch (error) {
            console.error(`[StorageService] Error writing key "${key}":`, error.message);

            // Handle quota exceeded
            if (error.name === 'QuotaExceededError') {
                console.error('[StorageService] Storage quota exceeded!');
                this._handleQuotaExceeded();
            }

            return false;
        }
    }

    /**
     * Remove a key from localStorage
     * @param {string} key - The storage key (without prefix)
     * @returns {boolean} Success status
     */
    remove(key) {
        const fullKey = this._prefixKey(key);

        try {
            localStorage.removeItem(fullKey);
            this._notifyListeners(key, undefined);
            return true;
        } catch (error) {
            console.error(`[StorageService] Error removing key "${key}":`, error.message);
            return false;
        }
    }

    /**
     * Check if a key exists in localStorage
     * @param {string} key - The storage key (without prefix)
     * @returns {boolean} Whether the key exists
     */
    has(key) {
        const fullKey = this._prefixKey(key);
        return localStorage.getItem(fullKey) !== null;
    }

    /**
     * Clear all prefixed keys from localStorage
     * @returns {number} Number of keys removed
     */
    clear() {
        const keysToRemove = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log(`[StorageService] Cleared ${keysToRemove.length} keys`);

        return keysToRemove.length;
    }

    /**
     * Get all keys with the GPAce prefix
     * @returns {string[]} Array of keys (without prefix)
     */
    keys() {
        const result = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                result.push(key.replace(this.prefix, ''));
            }
        }

        return result;
    }

    /**
     * Get storage usage statistics
     * @returns {Object} Usage statistics
     */
    getStats() {
        let totalSize = 0;
        let gpaceSize = 0;
        let gpaceCount = 0;

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                const value = localStorage.getItem(key);
                const size = (key.length + (value ? value.length : 0)) * 2; // UTF-16
                totalSize += size;

                if (key.startsWith(this.prefix)) {
                    gpaceSize += size;
                    gpaceCount++;
                }
            }
        }

        return {
            totalKeys: localStorage.length,
            gpaceKeys: gpaceCount,
            totalSizeBytes: totalSize,
            gpaceSizeBytes: gpaceSize,
            totalSizeKB: (totalSize / 1024).toFixed(2),
            gpaceSizeKB: (gpaceSize / 1024).toFixed(2)
        };
    }

    /**
     * Subscribe to changes on a specific key
     * @param {string} key - The storage key to watch
     * @param {Function} callback - Function to call on change
     * @returns {Function} Unsubscribe function
     */
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }

        this.listeners.get(key).add(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(key);
            if (callbacks) {
                callbacks.delete(callback);
            }
        };
    }

    /**
     * Migrate storage from legacy keys (without prefix) to new format
     * @param {Object} keyMappings - Map of oldKey -> newKey
     * @returns {number} Number of keys migrated
     */
    migrateLegacyKeys(keyMappings) {
        let migrated = 0;

        for (const [oldKey, newKey] of Object.entries(keyMappings)) {
            const oldValue = localStorage.getItem(oldKey);

            if (oldValue !== null) {
                // Copy to new key with prefix
                this.set(newKey, oldValue, { raw: true });

                // Remove old key
                localStorage.removeItem(oldKey);

                migrated++;
                console.log(`[StorageService] Migrated: ${oldKey} -> ${this.prefix}${newKey}`);
            }
        }

        return migrated;
    }

    // ============================================
    // Private Methods
    // ============================================

    /**
     * Add prefix to key
     * @private
     */
    _prefixKey(key) {
        // Don't double-prefix
        if (key.startsWith(this.prefix)) {
            return key;
        }
        return `${this.prefix}${key}`;
    }

    /**
     * Notify listeners of a change
     * @private
     */
    _notifyListeners(key, value) {
        const callbacks = this.listeners.get(key);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(value, key);
                } catch (error) {
                    console.error(`[StorageService] Listener error for key "${key}":`, error);
                }
            });
        }
    }

    /**
     * Check and run migrations
     * @private
     */
    _checkMigrations() {
        const storedVersion = parseInt(localStorage.getItem(SCHEMA_VERSION_KEY) || '0', 10);

        if (storedVersion < this.schemaVersion) {
            console.log(`[StorageService] Running migrations from v${storedVersion} to v${this.schemaVersion}`);
            this._runMigrations(storedVersion);
            localStorage.setItem(SCHEMA_VERSION_KEY, String(this.schemaVersion));
        }
    }

    /**
     * Run migrations between versions
     * @private
     */
    _runMigrations(fromVersion) {
        // Migration from v0 (legacy) to v1
        if (fromVersion < 1) {
            // Define legacy key mappings
            const legacyMappings = {
                'theme': 'theme',
                'calculatedPriorityTasks': 'calculatedPriorityTasks',
                'academicSubjects': 'academicSubjects',
                'academicSemesters': 'academicSemesters',
                'currentAcademicSemester': 'currentAcademicSemester',
                'workspaceContent': 'workspace.content',
                'flashcardDecks': 'flashcards.decks',
                'snippets': 'snippets',
                'geminiApiKey': 'api.gemini',
                'todoistAccessToken': 'api.todoist',
                'todoistState': 'todoist.state',
                'todoistProjects': 'todoist.projects'
            };

            const migrated = this.migrateLegacyKeys(legacyMappings);
            console.log(`[StorageService] Migration v0->v1: ${migrated} keys migrated`);
        }

        // Future migrations can be added here
        // if (fromVersion < 2) { ... }
    }

    /**
     * Handle quota exceeded error
     * @private
     */
    _handleQuotaExceeded() {
        // Log stats for debugging
        const stats = this.getStats();
        console.error('[StorageService] Storage stats:', stats);

        // Try to clean up old/temporary data
        const tempKeys = this.keys().filter(k =>
            k.startsWith('temp_') ||
            k.startsWith('cache_') ||
            k.includes('.backup')
        );

        tempKeys.forEach(key => this.remove(key));
        console.log(`[StorageService] Cleaned up ${tempKeys.length} temporary keys`);
    }
}

// Create singleton instance
const storageService = new StorageService();

// Add method aliases for StorageManager compatibility
storageService.setItem = (k, v) => storageService.set(k, v);
storageService.getItem = (k, d) => storageService.get(k, d);
storageService.removeItem = (k) => storageService.remove(k);

const getStorage = () => storageService;

// Export for ES modules
export { storageService, StorageService, STORAGE_KEYS, getStorage };
export default storageService;

// Register globally for backward compatibility
if (typeof window !== 'undefined') {
    window.storageService = storageService;
    window.StorageService = StorageService; // The class
    window.storageManager = storageService;
    window.getStorage = function() { return storageService; };
    window.StorageAdapter = { 
        getStorage: function() { return storageService; }, 
        storage: storageService, 
        STORAGE_KEYS: STORAGE_KEYS 
    };
}
