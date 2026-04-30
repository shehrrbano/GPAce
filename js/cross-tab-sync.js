// Cross-Tab Synchronization Module

class CrossTabSync {
    constructor(namespace = 'gpace') {
        this.namespace = namespace;
        this.channel = new BroadcastChannel(this.namespace);
        this.listeners = new Map();

        // Debugging: Log when the CrossTabSync is initialized
        console.log(`🔗 CrossTabSync initialized for namespace: ${this.namespace}`);

        // Listen for messages from other tabs
        this.channel.onmessage = (event) => {
            const { type, data } = event.data;
            console.log(`📡 Received cross-tab message: ${type}`, data);
            this.handleMessage(type, data);
        };

        // Setup global reload trigger
        this.setupReloadTrigger();


        this.on('priority-update', (data) => {
            console.log('🔄 Priority tasks updated in another tab:', data);

            // If we're on a page that displays priority tasks, reload them
            if (typeof window.displayPriorityTask === 'function') {
                console.log('Reloading priority tasks display...');
                window.displayPriorityTask();
            }
        });

        // Listen for task links updates
        this.on('task-links-update', (data) => {
            console.log('🔄 Task links updated in another tab:', data);

            // If the links container for this task is currently expanded, refresh it
            if (data && data.taskId) {
                const container = document.getElementById(`links-${data.taskId}`);
                if (container && container.classList.contains('expanded') &&
                    window.taskLinksManager && typeof window.taskLinksManager.renderLinks === 'function') {
                    console.log('Refreshing links display for task:', data.taskId);
                    window.taskLinksManager.renderLinks(data.taskId, container);
                }
            }
        });

        // Set up task update listener for priority calculator page
        this.setupTaskUpdateListener();
    }

    /**
     * Set up listener for task updates to reload the page when necessary
     * This was previously in an inline script in priority-calculator.html
     */
    setupTaskUpdateListener() {
        // Only set up if we're on the priority calculator page
        if (window.location.pathname.includes('priority-calculator.html')) {
            console.log('Setting up task update listener for priority calculator');

            // Add cross-tab synchronization for page reload
            this.onUserAction('task-update', (data) => {
                console.log('🔄 Task update received for project:', data.projectId);
                console.log('🔄 Reloading page due to task update');
                location.reload();
            });
        }
    }

    // New method to setup reload trigger
    setupReloadTrigger() {
        // Check for reload requests on page load
        this.checkReloadRequest();

        // Listen for storage events that might indicate a reload request
        window.addEventListener('storage', (event) => {
            if (event.key === `${this.namespace}-reload-request`) {
                this.checkReloadRequest();
            }
        });



    }

    // Check if there's a pending reload request
    checkReloadRequest() {
        const reloadRequest = storageService.get(`${this.namespace}-reload-request`);
        if (reloadRequest) {
            try {
                const requestData = JSON.parse(reloadRequest);
                const currentPath = window.location.pathname;

                // Check if this page should reload
                if (requestData.paths.some(path => currentPath.includes(path))) {
                    console.log('🔄 Reload requested for this page:', requestData);

                    // Prevent infinite reload loops by checking the timestamp
                    const lastReload = storageService.get(`${this.namespace}-last-reload-time`);
                    const now = Date.now();

                    if (!lastReload || (now - parseInt(lastReload)) > 10000) { // 10 second cooldown
                        // Store the reload time
                        storageService.set(`${this.namespace}-last-reload-time`, now.toString());

                        // Remove the reload request
                        storageService.remove(`${this.namespace}-reload-request`);

                        // RE-ENABLED: Reload the page for cross-tab sync
                        // Phase 2 Nuclear Rebuild - December 12, 2025
                        console.log('🔄 Reloading page for cross-tab sync...');
                        location.reload();
                    } else {
                        console.warn('🛑 Reload prevented - too frequent. Last reload was less than 10 seconds ago.');
                        storageService.remove(`${this.namespace}-reload-request`);
                    }
                }
            } catch (error) {
                console.error('Error processing reload request:', error);
                storageService.remove(`${this.namespace}-reload-request`);
            }
        }
    }

    // Method to request page reloads across all tabs
    // RE-ENABLED: Phase 2 Nuclear Rebuild - December 12, 2025
    requestPageReload(paths) {
        // Store reload request in localStorage
        storageService.set(`${this.namespace}-reload-request`, JSON.stringify({
            timestamp: Date.now(),
            paths: Array.isArray(paths) ? paths : [paths]
        }));

        // Broadcast to trigger storage event in other tabs
        this.channel.postMessage({
            type: 'reload-request',
            data: { paths: Array.isArray(paths) ? paths : [paths] }
        });

        console.log('🔄 Requesting page reload for paths:', paths);
    }

    // Send a message to all tabs (including the current one)
    send(type, data) {
        this.channel.postMessage({ type, data });
        // Also store in localStorage as a fallback
        storageService.set(`${this.namespace}-${type}`, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    }

    // Register a listener for a specific message type
    on(type, callback) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, []);
        }
        this.listeners.get(type).push(callback);
    }

    // Handle incoming messages
    handleMessage(type, data) {
        const typeListeners = this.listeners.get(type) || [];
        typeListeners.forEach(listener => listener(data));
    }

    // Fallback storage event listener for cross-tab communication
    setupStorageListener() {
        window.addEventListener('storage', (event) => {
            if (event.key && event.key.startsWith(`${this.namespace}-`)) {
                try {
                    const storedData = JSON.parse(event.newValue);
                    const messageType = event.key.replace(`${this.namespace}-`, '');
                    this.handleMessage(messageType, storedData.data);
                } catch (error) {
                    console.error('Error parsing storage event:', error);
                }
            }
        });
    }

    // Synchronize state across tabs
    syncState(key, initialState = null) {
        // Initialize state if not exists
        if (initialState !== null && !storageService.get(key)) {
            storageService.set(key, initialState);
        }

        // Broadcast state changes
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = (storageKey, value) => {
            if (storageKey === key) {
                this.send(key, JSON.parse(value));
            }
            originalSetItem.call(localStorage, storageKey, value);
        };

        // Listen for state changes
        this.on(key, (newState) => {
            // Update local storage without triggering another broadcast
            localStorage.setItem = originalSetItem;
            storageService.set(key, newState);
            localStorage.setItem = this.overriddenSetItem;
        });

        // Return current state
        return storageService.get(key, 'null');
    }

    // Method to synchronize specific app states
    syncAppState(stateKey, updateCallback) {
        // Listen for changes in this specific state
        this.on(stateKey, (newState) => {
            updateCallback(newState);
        });

        // Return current state
        return storageService.get(stateKey, 'null');
    }

    // Broadcast user actions across tabs
    broadcastAction(actionType, actionData) {
        this.send('user-action', { type: actionType, data: actionData });
    }

    // Listen for specific user actions
    onUserAction(actionType, callback) {
        this.on('user-action', (action) => {
            if (action.type === actionType) {
                callback(action.data);
            }
        });
    }

    // Method to test cross-tab communication
    testCommunication() {
        const testMessage = {
            timestamp: Date.now(),
            tabId: this.generateTabId()
        };

        console.log('🧪 Sending test communication across tabs', testMessage);

        this.send('cross-tab-test', testMessage);
    }

    // Generate a unique tab identifier
    generateTabId() {
        return Math.random().toString(36).substr(2, 9);
    }

    // Add a method to check Broadcast Channel and localStorage support
    checkBrowserSupport() {
        const support = {
            broadcastChannel: !!window.BroadcastChannel,
            localStorage: this.isLocalStorageAvailable()
        };

        console.log('🌐 Browser Support:', support);
        return support;
    }

    // Check if localStorage is available
    isLocalStorageAvailable() {
        try {
            storageService.set('test', 'test');
            storageService.remove('test');
            return true;
        } catch (e) {
            return false;
        }
    }

    // Initialize debugging and support checks
    initDebug() {
        // Test communication on initialization
        this.testCommunication();

        // Check browser support
        this.checkBrowserSupport();

        // Listen for test messages
        this.on('cross-tab-test', (testData) => {
            console.log('✅ Cross-Tab Test Received:', testData);
        });
    }
}

// Export a singleton instance
window.crossTabSync = new CrossTabSync();
window.crossTabSync.setupStorageListener();
window.crossTabSync.initDebug();  // Initialize debugging

export default window.crossTabSync;

