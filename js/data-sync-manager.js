/**
 * data-sync-manager.js
 * Manages data synchronization between localStorage and Firestore
 * 
 * Provides:
 * - Automatic background sync
 * - Conflict resolution
 * - Offline support with queue
 * - Cross-tab synchronization
 */

import { getStorage } from '../services/StorageService.js';
import DataRepository from './services/DataRepository.js';

// ============================================
// Constants
// ============================================
const SYNC_INTERVAL = 30000; // 30 seconds
const SYNC_QUEUE_KEY = 'dataSyncQueue';
const LAST_SYNC_KEY = 'lastSyncTimestamp';

// ============================================
// DataSyncManager Class
// ============================================
class DataSyncManager {
    constructor() {
        this.syncInterval = null;
        this.isOnline = navigator.onLine;
        this.isSyncing = false;
        this.syncQueue = [];

        this.init();
    }

    /**
     * Initialize the sync manager
     */
    init() {
        // Load pending sync queue
        this.loadSyncQueue();

        // Listen for online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Listen for storage events (cross-tab sync)
        window.addEventListener('storage', (e) => this.handleStorageChange(e));

        // Start background sync if online
        if (this.isOnline) {
            this.startBackgroundSync();
        }

        console.log('[DataSyncManager] Initialized');
    }

    /**
     * Handle coming online
     */
    handleOnline() {
        console.log('[DataSyncManager] Online - starting sync');
        this.isOnline = true;
        this.processSyncQueue();
        this.startBackgroundSync();
    }

    /**
     * Handle going offline
     */
    handleOffline() {
        console.log('[DataSyncManager] Offline - queuing changes');
        this.isOnline = false;
        this.stopBackgroundSync();
    }

    /**
     * Handle storage changes from other tabs
     * @param {StorageEvent} event 
     */
    handleStorageChange(event) {
        if (!event.key) return;

        // Ignore sync-related keys
        if (event.key === SYNC_QUEUE_KEY || event.key === LAST_SYNC_KEY) return;

        console.log('[DataSyncManager] Storage changed in another tab:', event.key);

        // Emit custom event for components to react
        window.dispatchEvent(new CustomEvent('dataSyncUpdate', {
            detail: { key: event.key, newValue: event.newValue, oldValue: event.oldValue }
        }));
    }

    /**
     * Load sync queue from storage
     */
    loadSyncQueue() {
        const storage = getStorage();
        this.syncQueue = storage.get(SYNC_QUEUE_KEY, []);
    }

    /**
     * Save sync queue to storage
     */
    saveSyncQueue() {
        const storage = getStorage();
        storage.set(SYNC_QUEUE_KEY, this.syncQueue);
    }

    /**
     * Add item to sync queue
     * @param {Object} item - Item to sync
     */
    queueSync(item) {
        const queueItem = {
            ...item,
            timestamp: Date.now(),
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };

        this.syncQueue.push(queueItem);
        this.saveSyncQueue();

        // Try to sync immediately if online
        if (this.isOnline && !this.isSyncing) {
            this.processSyncQueue();
        }
    }

    /**
     * Process pending sync queue
     */
    async processSyncQueue() {
        if (this.isSyncing || this.syncQueue.length === 0) return;

        this.isSyncing = true;
        console.log(`[DataSyncManager] Processing ${this.syncQueue.length} queued items`);

        const failedItems = [];

        for (const item of this.syncQueue) {
            try {
                await this.syncItem(item);
            } catch (error) {
                console.error('[DataSyncManager] Failed to sync item:', error);
                failedItems.push(item);
            }
        }

        // Update queue with failed items only
        this.syncQueue = failedItems;
        this.saveSyncQueue();

        this.isSyncing = false;

        // Update last sync timestamp
        const storage = getStorage();
        storage.set(LAST_SYNC_KEY, Date.now());
    }

    /**
     * Sync a single item to Firestore
     * @param {Object} item - Item to sync
     */
    async syncItem(item) {
        // Check if save function is available via DataRepository
        if (item.type === 'tasks') {
            // We expect item to have projectId. If not, we can't save.
            if (item.projectId) {
                await DataRepository.saveTasks(item.projectId, item.data);
                return;
            }
        }

        if (item.type === 'subjects') {
            await DataRepository.saveSubjects(item.data);
            return;
        }

        // Fallback to old dynamic lookup for other types
        const saveFunc = this.getSaveFunction(item.type);
        if (!saveFunc) {
            console.warn(`[DataSyncManager] No save function for type: ${item.type}`);
            return;
        }

        await saveFunc(item.data);
    }

    /**
     * Get appropriate save function for item type
     * @param {string} type - Type of data
     * @returns {Function|null}
     */
    getSaveFunction(type) {
        const saveFunctions = {
            'flashcards': window.saveFlashcardsToFirestore,
            'settings': window.saveSettingsToFirestore,
            'subjectMarks': window.saveSubjectMarksToFirestore,
            'subjectWeightages': window.saveSubjectWeightagesToFirestore
        };

        return saveFunctions[type] || null;
    }

    /**
     * Start background sync interval
     */
    startBackgroundSync() {
        if (this.syncInterval) return;

        this.syncInterval = setInterval(() => {
            if (this.isOnline && !this.isSyncing) {
                this.processSyncQueue();
            }
        }, SYNC_INTERVAL);

        console.log('[DataSyncManager] Background sync started');
    }

    /**
     * Stop background sync interval
     */
    stopBackgroundSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            console.log('[DataSyncManager] Background sync stopped');
        }
    }

    /**
     * Force immediate sync
     */
    async forceSync() {
        if (!this.isOnline) {
            console.warn('[DataSyncManager] Cannot force sync - offline');
            return false;
        }

        await this.processSyncQueue();
        return true;
    }

    /**
     * Get last sync timestamp
     * @returns {number|null}
     */
    getLastSyncTime() {
        const storage = getStorage();
        return storage.get(LAST_SYNC_KEY, null);
    }

    /**
     * Clear sync queue
     */
    clearQueue() {
        this.syncQueue = [];
        this.saveSyncQueue();
        console.log('[DataSyncManager] Sync queue cleared');
    }

    /**
     * Get current sync status
     * @returns {Object}
     */
    getStatus() {
        return {
            isOnline: this.isOnline,
            isSyncing: this.isSyncing,
            queueLength: this.syncQueue.length,
            lastSync: this.getLastSyncTime()
        };
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.stopBackgroundSync();
        window.removeEventListener('online', this.handleOnline);
        window.removeEventListener('offline', this.handleOffline);
        console.log('[DataSyncManager] Destroyed');
    }

    // ============================================
    // API methods expected by data-sync-integration.js
    // ============================================

    /**
     * Initialize data synchronization
     * @param {boolean} fullSync - Whether to perform a full sync
     * @returns {Promise<boolean>}
     */
    async initializeDataSync(fullSync = false) {
        console.log('[DataSyncManager] Initializing data sync, fullSync:', fullSync);
        console.log('[DataSyncManager] NOTE: Read operations now delegated to DataInitializationService');

        if (!this.isOnline) {
            console.warn('[DataSyncManager] Offline - skipping initial sync');
            return false;
        }

        try {
            if (fullSync) {
                // Delegate to DataInitializationService for read operations
                if (window.DataInitializationService) {
                    console.log('[DataSyncManager] Delegating data load to DataInitializationService...');
                    await window.DataInitializationService.init();
                } else {
                    console.error('[DataSyncManager] DataInitializationService not available, falling back to legacy loadFromFirestore');
                    // Fallback to old method if new service not available
                    await this.loadFromFirestore();
                }
            }

            // DataSyncManager's primary role: Process write queue
            await this.processSyncQueue();

            // Dispatch sync complete event
            window.dispatchEvent(new CustomEvent('dataSyncComplete', {
                detail: { timestamp: Date.now(), type: fullSync ? 'full' : 'incremental' }
            }));

            return true;
        } catch (error) {
            console.error('[DataSyncManager] Error during initializeDataSync:', error);
            return false;
        }
    }

    /**
     * Start periodic synchronization
     * Alias for startBackgroundSync() for API compatibility
     */
    startPeriodicSync() {
        this.startBackgroundSync();
    }

    /**
     * Stop periodic synchronization
     * Alias for stopBackgroundSync() for API compatibility
     */
    stopPeriodicSync() {
        this.stopBackgroundSync();
    }

    /**
     * Load data from Firestore to localStorage
     * NOTE: This method is now primarily for backward compatibility.
     * New code should use DataInitializationService instead.
     * @returns {Promise<void>}
     */
    async loadFromFirestore() {
        console.log('[DataSyncManager] Loading data from Firestore...');
        console.warn('[DataSyncManager LEGACY] loadFromFirestore is legacy. New code should use DataInitializationService.');

        try {
            // Load subjects if function available
            if (typeof window.loadSubjectsFromFirestore === 'function') {
                await window.loadSubjectsFromFirestore();
            }

            // Load subject marks if function available
            if (typeof window.loadSubjectMarksFromFirestore === 'function') {
                await window.loadSubjectMarksFromFirestore();
            }

            // Load subject weightages if function available
            if (typeof window.loadSubjectWeightagesFromFirestore === 'function') {
                await window.loadSubjectWeightagesFromFirestore();
            }

            // Load tasks for each subject (loadTasksFromFirestore requires a valid projectId)
            if (typeof window.loadTasksFromFirestore === 'function') {
                const storage = getStorage();
                const subjects = storage.get('academicSubjects', []);

                // Load tasks only for subjects with valid tags
                for (const subject of subjects) {
                    const projectId = subject?.tag;
                    if (projectId && projectId !== 'undefined' && projectId !== 'null') {
                        try {
                            await window.loadTasksFromFirestore(projectId);
                        } catch (taskError) {
                            console.debug(`[DataSyncManager] Failed to load tasks for ${projectId}:`, taskError.message);
                        }
                    }
                }
            }

            console.log('[DataSyncManager] Data loaded from Firestore');
        } catch (error) {
            console.error('[DataSyncManager] Error loading from Firestore:', error);
            throw error;
        }
    }

    /**
     * Save data to Firestore from localStorage
     * @returns {Promise<void>}
     */
    async saveToFirestore() {
        console.log('[DataSyncManager] Saving data to Firestore...');

        try {
            // Save subjects if function available
            if (typeof window.saveSubjectsToFirestore === 'function') {
                await window.saveSubjectsToFirestore();
            }

            // Save subject marks if function available
            if (typeof window.saveSubjectMarksToFirestore === 'function') {
                await window.saveSubjectMarksToFirestore();
            }

            // Save subject weightages if function available
            if (typeof window.saveSubjectWeightagesToFirestore === 'function') {
                await window.saveSubjectWeightagesToFirestore();
            }

            // Save tasks if function available
            if (typeof window.saveTasksToFirestore === 'function') {
                await window.saveTasksToFirestore();
            }

            console.log('[DataSyncManager] Data saved to Firestore');
        } catch (error) {
            console.error('[DataSyncManager] Error saving to Firestore:', error);
            throw error;
        }
    }
}

// Create and export singleton instance
const dataSyncManager = new DataSyncManager();
export default dataSyncManager;

// Make available globally for non-module scripts
if (typeof window !== 'undefined') {
    window.dataSyncManager = dataSyncManager;
}
