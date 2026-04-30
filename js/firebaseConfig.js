/**
 * Firebase Configuration Module
 * Centralizes Firebase config to prevent duplicate initialization errors.
 * 
 * Usage:
 *   import { firebaseConfig, getOrCreateFirebaseApp } from './firebaseConfig.js';
 *   import { initializeApp, getApps } from 'firebase/app';
 *   
 *   const app = getOrCreateFirebaseApp(initializeApp, getApps);
 */

import { secretManager } from './config/SecretManager.js';

export const firebaseConfig = {
  apiKey: "REDACTED", // Loaded dynamically
  authDomain: "mzm-gpace.firebaseapp.com",
  projectId: "mzm-gpace",
  storageBucket: "mzm-gpace.firebasestorage.app",
  messagingSenderId: "949014366726",
  appId: "REDACTED" // Loaded dynamically
};

let initPromise = null;

/**
 * Get existing Firebase app or create a new one
 * Prevents duplicate initialization errors
 */
export async function getOrCreateFirebaseApp(initializeApp, getApps = null) {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Load secrets if redacted
      if (firebaseConfig.apiKey === 'REDACTED') {
        firebaseConfig.apiKey = await secretManager.getFirebaseKey();
        // Also load appId from secretManager in a real scenario
        firebaseConfig.appId = "1:949014366726:web:3aa05a6e133e2066c45187"; 
      }

      // Check for existing apps
      if (typeof getApps === 'function') {
        const existingApps = getApps();
        if (existingApps.length > 0) {
          return existingApps[0];
        }
      }

      if (typeof initializeApp === 'function') {
        console.log("[FirebaseConfig] Initializing new Firebase app...");
        return initializeApp(firebaseConfig);
      }

      return null;
    } catch (e) {
      console.error("[FirebaseConfig] Error with Firebase app initialization:", e);
      initPromise = null; // Reset on failure so we can retry
      return null;
    }
  })();

  return initPromise;
}

// Default export for convenience
export default {
  config: firebaseConfig,
  getOrCreateApp: getOrCreateFirebaseApp
};
