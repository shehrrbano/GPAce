/**
 * SecureStorage.js
 * Encrypted storage for sensitive data like API keys and tokens.
 * Part of Batch 4: Storage Layer Abstraction.
 * 
 * Features:
 * - Browser-native encryption using SubtleCrypto API
 * - Automatic key derivation from user/session seed
 * - Fallback to obfuscation if SubtleCrypto unavailable
 * - Seamless integration with StorageService
 * 
 * IMPORTANT: This is client-side encryption and provides protection against
 * casual inspection. For truly sensitive data, use server-side storage.
 * 
 * Usage:
 *   import SecureStorage from './SecureStorage.js';
 *   
 *   // Store sensitive data
 *   await SecureStorage.setSecure('apiKey', 'sk-xxxxx');
 *   
 *   // Retrieve sensitive data
 *   const apiKey = await SecureStorage.getSecure('apiKey');
 */

import storageService from './StorageService.js';

const CRYPTO_SALT = 'GPAce_Secure_2024';
const SECURE_PREFIX = 'secure_';

class SecureStorage {
    constructor() {
        this.cryptoAvailable = this._checkCryptoSupport();
        this.keyCache = new Map();

        if (!this.cryptoAvailable) {
            console.warn('[SecureStorage] SubtleCrypto not available, using obfuscation fallback');
        }
    }

    /**
     * Store a value securely (encrypted)
     * @param {string} key - Storage key
     * @param {string} value - Value to encrypt and store
     * @returns {Promise<boolean>} Success status
     */
    async setSecure(key, value) {
        if (!value) {
            return storageService.remove(SECURE_PREFIX + key);
        }

        try {
            const encrypted = await this._encrypt(value);
            return storageService.set(SECURE_PREFIX + key, encrypted, { raw: true });
        } catch (error) {
            console.error(`[SecureStorage] Encryption failed for key "${key}":`, error);
            return false;
        }
    }

    /**
     * Retrieve and decrypt a securely stored value
     * @param {string} key - Storage key
     * @param {string} defaultValue - Default if key doesn't exist
     * @returns {Promise<string|null>} Decrypted value or default
     */
    async getSecure(key, defaultValue = null) {
        try {
            const encrypted = storageService.get(SECURE_PREFIX + key, null, { raw: true });

            if (!encrypted) {
                return defaultValue;
            }

            const decrypted = await this._decrypt(encrypted);
            return decrypted || defaultValue;
        } catch (error) {
            console.error(`[SecureStorage] Decryption failed for key "${key}":`, error);
            return defaultValue;
        }
    }

    /**
     * Remove a securely stored value
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    removeSecure(key) {
        return storageService.remove(SECURE_PREFIX + key);
    }

    /**
     * Check if a secure key exists
     * @param {string} key - Storage key
     * @returns {boolean} Whether the key exists
     */
    hasSecure(key) {
        return storageService.has(SECURE_PREFIX + key);
    }

    /**
     * List all secure storage keys
     * @returns {string[]} Array of secure keys (without prefix)
     */
    secureKeys() {
        return storageService.keys()
            .filter(k => k.startsWith(SECURE_PREFIX))
            .map(k => k.replace(SECURE_PREFIX, ''));
    }

    /**
     * Migrate a legacy plain-text key to secure storage
     * @param {string} legacyKey - Original localStorage key
     * @param {string} newKey - New secure storage key
     * @returns {Promise<boolean>} Success status
     */
    async migrateLegacyKey(legacyKey, newKey) {
        const plainValue = storageService.get(legacyKey);

        if (plainValue) {
            const success = await this.setSecure(newKey, plainValue);
            if (success) {
                storageService.remove(legacyKey);
                console.log(`[SecureStorage] Migrated "${legacyKey}" to secure storage`);
                return true;
            }
        }

        return false;
    }

    // ============================================
    // Private Encryption Methods
    // ============================================

    /**
     * Check if SubtleCrypto is available
     * @private
     */
    _checkCryptoSupport() {
        return typeof window !== 'undefined' &&
            window.crypto &&
            window.crypto.subtle;
    }

    /**
     * Get or derive encryption key
     * @private
     */
    async _getEncryptionKey() {
        // Check cache first
        if (this.keyCache.has('main')) {
            return this.keyCache.get('main');
        }

        if (!this.cryptoAvailable) {
            return null;
        }

        try {
            // Create a deterministic seed from browser fingerprint
            const seed = this._generateSeed();

            // Import seed as key material
            const keyMaterial = await window.crypto.subtle.importKey(
                'raw',
                new TextEncoder().encode(seed),
                'PBKDF2',
                false,
                ['deriveKey']
            );

            // Derive actual encryption key
            const key = await window.crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: new TextEncoder().encode(CRYPTO_SALT),
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt', 'decrypt']
            );

            this.keyCache.set('main', key);
            return key;
        } catch (error) {
            console.error('[SecureStorage] Key derivation failed:', error);
            return null;
        }
    }

    /**
     * Generate a deterministic seed for key derivation
     * @private
     */
    _generateSeed() {
        // Combine various browser characteristics for a semi-unique seed
        const components = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset().toString(),
            CRYPTO_SALT
        ];

        return components.join('|');
    }

    /**
     * Encrypt a string value
     * @private
     */
    async _encrypt(value) {
        if (!this.cryptoAvailable) {
            return this._obfuscate(value);
        }

        try {
            const key = await this._getEncryptionKey();
            if (!key) {
                return this._obfuscate(value);
            }

            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const encodedValue = new TextEncoder().encode(value);

            const encrypted = await window.crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                key,
                encodedValue
            );

            // Combine IV and encrypted data, encode as base64
            const combined = new Uint8Array(iv.length + encrypted.byteLength);
            combined.set(iv);
            combined.set(new Uint8Array(encrypted), iv.length);

            return 'ENC:' + btoa(String.fromCharCode(...combined));
        } catch (error) {
            console.error('[SecureStorage] Encryption error:', error);
            return this._obfuscate(value);
        }
    }

    /**
     * Decrypt a string value
     * @private
     */
    async _decrypt(encrypted) {
        // Check if it's obfuscated (fallback) or encrypted
        if (encrypted.startsWith('OBF:')) {
            return this._deobfuscate(encrypted);
        }

        if (!encrypted.startsWith('ENC:')) {
            // Legacy plain text - return as-is
            return encrypted;
        }

        if (!this.cryptoAvailable) {
            console.warn('[SecureStorage] Cannot decrypt without SubtleCrypto');
            return null;
        }

        try {
            const key = await this._getEncryptionKey();
            if (!key) {
                return null;
            }

            // Decode from base64
            const combined = Uint8Array.from(
                atob(encrypted.slice(4)),
                c => c.charCodeAt(0)
            );

            // Extract IV and encrypted data
            const iv = combined.slice(0, 12);
            const data = combined.slice(12);

            const decrypted = await window.crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                key,
                data
            );

            return new TextDecoder().decode(decrypted);
        } catch (error) {
            console.error('[SecureStorage] Decryption error:', error);
            return null;
        }
    }

    /**
     * Obfuscate value (fallback when crypto unavailable)
     * @private
     */
    _obfuscate(value) {
        // Simple XOR obfuscation with rotating key
        const key = CRYPTO_SALT;
        let result = '';

        for (let i = 0; i < value.length; i++) {
            result += String.fromCharCode(
                value.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }

        return 'OBF:' + btoa(result);
    }

    /**
     * Deobfuscate value
     * @private
     */
    _deobfuscate(obfuscated) {
        try {
            const encrypted = atob(obfuscated.slice(4));
            const key = CRYPTO_SALT;
            let result = '';

            for (let i = 0; i < encrypted.length; i++) {
                result += String.fromCharCode(
                    encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
                );
            }

            return result;
        } catch (error) {
            console.error('[SecureStorage] Deobfuscation error:', error);
            return null;
        }
    }
}

// Create singleton instance
const secureStorage = new SecureStorage();

// Export for ES modules
export { secureStorage, SecureStorage };
export default secureStorage;

// Register globally for backward compatibility
window.SecureStorage = secureStorage;

