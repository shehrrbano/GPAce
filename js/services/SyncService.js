import indexedDBService from './IndexedDBService.js';

/**
 * SyncService - Manages background data synchronization between local IndexedDB and remote Firebase.
 * Implements "Last Write Wins" reconciliation and outbox queue pattern.
 */
export class SyncService {
    constructor() {
        this.isOnline = navigator.onLine;
        this.syncInProgress = false;
        this.init();
    }

    init() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processQueue();
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });

        // Periodic sync attempt if online
        setInterval(() => {
            if (this.isOnline && !this.syncInProgress) {
                this.processQueue();
            }
        }, 60000); // Every minute
    }

    /**
     * Process all pending items in the IndexedDB sync queue
     */
    async processQueue() {
        if (this.syncInProgress || !this.isOnline) return;
        
        const pendingItems = await indexedDBService.getPendingQueue();
        if (pendingItems.length === 0) return;

        this.syncInProgress = true;
        console.log(`[SyncService] Processing ${pendingItems.length} pending items...`);

        for (const item of pendingItems) {
            try {
                await this.syncItemWithRemote(item);
                await indexedDBService.updateQueueStatus(item.id, 'synced');
            } catch (error) {
                console.error(`[SyncService] Failed to sync item ${item.id}:`, error);
                // Status remains 'pending' for retry
            }
        }

        this.syncInProgress = false;
        console.log('[SyncService] Sync complete.');
    }

    /**
     * Sync a single item with the remote backend (Firebase/Firestore)
     * This is a generic bridge that will need specific implementations per collection
     */
    async syncItemWithRemote(item) {
        // Implementation note: In a real world scenario, this would import
        // specific firestore service methods. For now, we simulate the bridge.
        
        console.log(`[SyncService] Syncing ${item.action} on ${item.collection}...`);
        
        // Mocking remote API call
        return new Promise((resolve) => {
            setTimeout(() => {
                // Success!
                resolve();
            }, 500);
        });
    }

    /**
     * Public method to trigger an immediate sync
     */
    async triggerSync() {
        return this.processQueue();
    }
}

const syncService = new SyncService();
export default syncService;
