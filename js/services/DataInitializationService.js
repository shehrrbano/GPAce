/**
 * DataInitializationService.js
 * 
 * Centralized data initialization service for all pages.
 * Combines the best of both approaches:
 * - Real-time Firestore listeners (from TaskService)
 * - Version comparison logic (from firestore.js)
 * 
 * This ensures consistent data loading across grind.html, extracted.html, and workspace.html
 */

// Reordered imports: Auth first to ensure singleton instantiation
import { auth as centralizedAuth } from '../auth.js';
import storageService from './StorageService.js';
import taskSystem from '../core/TaskSystem.js';

// Expose globally for legacy code
if (typeof window !== 'undefined') {
    window.storageService = storageService;
    window.getStorage = () => storageService;
}

import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { SemesterService } from './SemesterService.js';
// Duplicate import removed
import { loadSubjectsFromFirestore } from '../firestore.js';

// Safeguard against redeclaration if module is loaded multiple times
if (typeof window.DataInitializationService === 'undefined') {
    class DataInitializationService {
        constructor() {
            this.initialized = false;
            this.auth = centralizedAuth;
            this.db = null;
            this.subscriptions = new Map(); // projectId -> unsubscribe function
            this.taskService = taskSystem;
            this._initPromise = null;
        }

        /**
         * Main initialization method - call this from all pages
         * @param {Object} options - Optional configuration
         * @returns {Promise<boolean>} Success status
         */
        async init(options = {}) {
            if (this._initPromise) return this._initPromise;

            this._initPromise = (async () => {
                if (this.initialized) {
                    console.log('[DataInitService] Already initialized');
                    return true;
                }

                console.log('[DataInitService] Starting data initialization...');

                try {
                    // Step 1: Ensure Firebase is initialized
                    await this._ensureFirebase();

                    // Step 2: Wait for authentication
                    const user = await this._waitForAuth();

                    if (!user) {
                        console.log('[DataInitService] No user authenticated, using local data only');
                        this._loadLocalData();
                        this.initialized = true;
                        this._emitInitialized(false);
                        return true;
                    }

                    console.log(`[DataInitService] Authenticated as: ${user.email}`);

                    // Step 3: Load subjects
                    await this._loadSubjects();

                    // Step 4: Subscribe to tasks for all subjects
                    await this._subscribeToAllTasks();

                    // Step 5: Mark as initialized
                    this.initialized = true;

                    console.log('[DataInitService] ✅ Data initialization complete');
                    this._emitInitialized(true);

                    return true;

                } catch (error) {
                    console.error('[DataInitService] Initialization error:', error);
                    this._initPromise = null; // Allow retry on failure
                    return false;
                }
            })();

            return this._initPromise;
        }

        /**
         * Ensure Firebase is initialized
         */
        async _ensureFirebase() {
            try {
                if (!this.auth) {
                    const app = getApps().length > 0 ? getApp() : null;
                    if (!app) {
                        console.error('[DataInitService] Firebase not initialized - expected to be initialized by page');
                        throw new Error('Firebase app not found');
                    }
                    this.auth = getAuth(app);
                }
                
                const app = getApps().length > 0 ? getApp() : null;
                this.db = getFirestore(app);
                console.log('[DataInitService] Firebase references obtained');
            } catch (error) {
                console.error('[DataInitService] Firebase setup error:', error);
                throw error;
            }
        }

        /**
         * Wait for authentication state
         * @returns {Promise<User|null>}
         */
        async _waitForAuth(timeoutMs = 5000) {
            return new Promise((resolve) => {
                // If already signed in, return immediately
                if (this.auth.currentUser) {
                    resolve(this.auth.currentUser);
                    return;
                }

                const timeoutId = setTimeout(() => {
                    console.log('[DataInitService] Auth wait timeout, proceeding without auth');
                    resolve(null);
                }, timeoutMs);

                const unsubscribe = onAuthStateChanged(this.auth, (user) => {
                    clearTimeout(timeoutId);
                    unsubscribe();
                    resolve(user);
                });
            });
        }

        /**
         * Load local data when no auth available
         */
        _loadLocalData() {
            try {
                // Use the imported storageService instance directly or fallback to window instance
                const storage = storageService || window.storageService || {
                    get: (k, d) => d // Safe fallback if somehow everything is missing
                };

                const subjects = storage.get('academicSubjects', []);
                console.log(`[DataInitService] Loaded ${subjects.length} subjects from local storage`);
            } catch (error) {
                console.error('[DataInitService] Error loading local data:', error);
            }
        }

        /**
         * Load subjects via SemesterService
         */
        async _loadSubjects() {
            try {
                console.log('[DataInitService] Loading subjects...');

                // Initialize SemesterService
                await SemesterService.initialize();

                // Also trigger Firestore load to ensure latest data
                const subjects = await loadSubjectsFromFirestore();

                if (subjects && subjects.length > 0) {
                    console.log(`[DataInitService] ✅ Loaded ${subjects.length} subjects`);
                } else {
                    console.log('[DataInitService] No subjects found');
                }

                return subjects || [];
            } catch (error) {
                console.error('[DataInitService] Subject loading error:', error);
                return [];
            }
        }

        /**
         * Subscribe to tasks for all subjects using TaskService
         */
        async _subscribeToAllTasks() {
            try {
                const subjects = SemesterService.getCurrentSubjects();
                console.log(`[DataInitService] Setting up task subscriptions for ${subjects.length} subjects...`);

                let successCount = 0;

                for (const subject of subjects) {
                    const projectId = subject.tag;

                    if (!projectId || projectId === 'undefined' || projectId === 'null') {
                        console.warn(`[DataInitService] Skipping invalid project ID: ${projectId}`);
                        continue;
                    }

                    try {
                        console.log(`[DataInitService] Subscribing to: ${projectId}`);

                        // Use this.taskService which was assigned in the constructor
                        const unsubscribe = this.taskService.subscribeToProject(projectId, (tasks) => {
                            console.log(`[DataInitService] ${projectId} updated: ${tasks.length} tasks`);
                            // Tasks are automatically saved to localStorage by TaskService
                        });

                        this.subscriptions.set(projectId, unsubscribe);
                        successCount++;

                    } catch (subError) {
                        console.error(`[DataInitService] Failed to subscribe to ${projectId}:`, subError);
                    }
                }

                console.log(`[DataInitService] ✅ Subscribed to ${successCount}/${subjects.length} projects`);

            } catch (error) {
                console.error('[DataInitService] Task subscription error:', error);
            }
        }

        /**
         * Emit initialization complete event
         */
        _emitInitialized(authenticated) {
            window.dispatchEvent(new CustomEvent('dataInitialized', {
                detail: {
                    timestamp: Date.now(),
                    authenticated: authenticated
                }
            }));
        }

        /**
         * Cleanup subscriptions
         */
        destroy() {
            console.log('[DataInitService] Cleaning up subscriptions...');

            for (const [projectId, unsubscribe] of this.subscriptions) {
                try {
                    unsubscribe();
                } catch (error) {
                    console.warn(`[DataInitService] Error unsubscribing from ${projectId}:`, error);
                }
            }

            this.subscriptions.clear();
            this.initialized = false;
            console.log('[DataInitService] Cleanup complete');
        }

        /**
         * Get initialization status
         */
        isInitialized() {
            return this.initialized;
        }
    }

    // Assign to window for global access
    window.DataInitializationService = DataInitializationService;
}

// Create and export singleton instance
const dataInitializationService = (typeof window !== 'undefined' && window.dataInitService)
    ? window.dataInitService
    : new window.DataInitializationService();

export default dataInitializationService;
export { dataInitializationService as DataInitializationService };

// Make available globally for non-module scripts
if (typeof window !== 'undefined') {
    window.dataInitService = dataInitializationService;
    window.SemesterService = SemesterService;
}
