/**
 * IndexedDBService - Centralized service for local persistence with large data support.
 * Essential for PWA offline functionality.
 */
export class IndexedDBService {
    constructor() {
        this.dbName = 'gpace_db';
        this.version = 1;
        this.db = null;
    }

    /**
     * Initialize the database and create object stores
     */
    async init() {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Sync Queue for offline operations
                if (!db.objectStoreNames.contains('sync_queue')) {
                    db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
                }

                // Tasks Cache
                if (!db.objectStoreNames.contains('tasks')) {
                    db.createObjectStore('tasks', { keyPath: 'id' });
                }

                // Calendar Events Cache
                if (!db.objectStoreNames.contains('calendar_events')) {
                    db.createObjectStore('calendar_events', { keyPath: 'id' });
                }
                
                // Subject Marks Cache
                if (!db.objectStoreNames.contains('subject_marks')) {
                    db.createObjectStore('subject_marks', { keyPath: 'id' });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (event) => {
                console.error('[IndexedDB] Database error:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * Add an item to the sync queue
     * @param {string} action - 'create', 'update', 'delete'
     * @param {string} collection - 'tasks', 'calendar', 'marks'
     * @param {object} payload - The data to be synced
     */
    async addToQueue(action, collection, payload) {
        await this.init();
        const tx = this.db.transaction('sync_queue', 'readwrite');
        const store = tx.objectStore('sync_queue');
        
        return new Promise((resolve, reject) => {
            const request = store.add({
                action,
                collection,
                payload,
                timestamp: Date.now(),
                status: 'pending'
            });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get all pending items in the sync queue
     */
    async getPendingQueue() {
        await this.init();
        const tx = this.db.transaction('sync_queue', 'readonly');
        const store = tx.objectStore('sync_queue');
        
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => {
                const pending = request.result.filter(item => item.status === 'pending');
                resolve(pending);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Update the status of a queue item
     */
    async updateQueueStatus(id, status) {
        await this.init();
        const tx = this.db.transaction('sync_queue', 'readwrite');
        const store = tx.objectStore('sync_queue');
        
        const getRequest = store.get(id);
        getRequest.onsuccess = () => {
            const data = getRequest.result;
            data.status = status;
            store.put(data);
        };
    }

    /**
     * Cache items for offline viewing
     */
    async cacheItems(storeName, items) {
        await this.init();
        const tx = this.db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        
        items.forEach(item => store.put(item));
        
        return new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
}

const indexedDBService = new IndexedDBService();
export default indexedDBService;
