/**
 * BootstrapManager.js
 * Centralized entry point for application initialization.
 * Prevents race conditions and duplicate service initializations.
 */
class BootstrapManager {
    constructor() {
        this.booting = false;
        this.booted = false;
        this.pageName = 'unknown';
    }

    /**
     * Main entry point for page initialization
     * @param {string} pageName - Identifier for the current page
     */
    async boot(pageName = 'unknown') {
        if (this.booted) {
            console.warn(`[Bootstrap] App already booted for ${this.pageName}, ignoring request from ${pageName}`);
            return;
        }
        if (this.booting) {
            console.warn(`[Bootstrap] Boot already in progress for ${this.pageName}, ignoring request from ${pageName}`);
            return;
        }

        this.pageName = pageName;
        this.booting = true;
        console.group(`[Bootstrap] Starting app sequence for: ${pageName}`);
        const startTime = performance.now();
        
        try {
            // PHASE 0: Environment & Low-level
            console.log('[Bootstrap] Phase 0: Environment');
            // SemesterService is critical for data mapping
            if (window.SemesterService) {
                await window.SemesterService.initialize();
            }

            // PHASE 1: UI Infrastructure
            // Core UI elements that don't depend on data/auth
            console.log('[Bootstrap] Phase 1: UI Infrastructure');
            
            // SideDrawer init
            if (window.sideDrawer) {
                console.log('[Bootstrap] Initializing SideDrawer...');
                await window.sideDrawer.init();
            }

            // Common Header & components (InjectHeader)
            if (window.initializeCommonComponents) {
                console.log('[Bootstrap] Initializing Common Components...');
                await window.initializeCommonComponents();
            }

            // Secondary UI components
            this._safeInit('ConflictModal');
            this._safeInit('RecoveryModal');
            this._safeInit('SyncStatusIndicator');

            // PHASE 2: Data & Authentication
            // Services that require Auth state and fetch remote data
            console.log('[Bootstrap] Phase 2: Data & Auth');
            
            if (window.dataInitService) {
                console.log('[Bootstrap] Initializing Data Service...');
                // dataInitService.init handles Auth wait and Project subscriptions
                await window.dataInitService.init();
            }

            // Google Drive (Lazy init if available)
            if (window.googleDriveAPI) {
                console.log('[Bootstrap] Initializing Google Drive Service...');
                await window.googleDriveAPI.init().catch(err => console.debug('[Bootstrap] Drive init deferred:', err));
            }

            // PHASE 3: Application Core
            // Business logic engines that depend on initialized data
            console.log('[Bootstrap] Phase 3: App Core');
            
            if (window.TaskSystem) {
                console.log('[Bootstrap] Initializing Task System...');
                await window.TaskSystem.init();
            }

            // PHASE 4: Page Specific Controllers
            console.log('[Bootstrap] Phase 4: Controllers');
            this._safeInit('grindController');
            this._safeInit('instantFeedbackController');
            this._safeInit('researcherController');
            this._safeInit('tasksController');
            this._safeInit('relaxedModeController');

            const endTime = performance.now();
            this.booted = true;
            console.log(`[Bootstrap] ✅ App sequence complete (${(endTime - startTime).toFixed(2)}ms)`);
            
            // Dispatch global event for page-specific logic
            window.dispatchEvent(new CustomEvent('appBooted', { detail: { pageName } }));

        } catch (error) {
            console.error('[Bootstrap] ❌ Boot failed:', error);
        } finally {
            console.groupEnd();
            this.booting = false;
        }
    }

    /**
     * Safely initialize a window-level component if it exists
     * @param {string} name 
     */
    async _safeInit(name) {
        const component = window[name];
        if (component && typeof component.init === 'function') {
            console.log(`[Bootstrap] Initializing ${name}...`);
            try {
                await component.init();
            } catch (e) {
                console.warn(`[Bootstrap] Error initializing ${name}:`, e);
            }
        } else if (component && typeof component.initialize === 'function') {
             console.log(`[Bootstrap] Initializing ${name}...`);
             try {
                await component.initialize();
            } catch (e) {
                console.warn(`[Bootstrap] Error initializing ${name}:`, e);
            }
        }
    }

    /**
     * Check if the app has completed the boot sequence
     */
    isBooted() {
        return this.booted;
    }
}

// Create Singleton instance
const bootstrapManager = new BootstrapManager();

// Expose to window for global access (legacy support)
window.bootstrapManager = bootstrapManager;

// Safe Auto-Boot: Detect pages that rely on auto-initialization
if (typeof document !== 'undefined') {
    const autoBoot = () => {
        // Skip if already booted or booting (grind.html handles its own)
        if (bootstrapManager.booted || bootstrapManager.booting) return;
        
        // Don't auto-boot on grind.html as it has specialized manual boot
        if (window.location.pathname.includes('grind.html')) return;
        
        console.log('[Bootstrap] Auto-booting for current page...');
        bootstrapManager.boot(window.location.pathname.split('/').pop() || 'index');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoBoot);
    } else {
        autoBoot();
    }
}

export default bootstrapManager;
