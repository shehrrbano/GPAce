import storageService from './services/StorageService.js';

/**
 * Inject Header - Common header/navigation injection and app initialization
 * 
 * This script runs on every page and handles:
 * - Navigation bar injection (via NavigationComponent)
 * - Alarm audio element creation
 * - Firebase import map setup
 * - Service worker registration
 * - Notification permission request
 * 
 * Refactored to use centralized StorageAdapter.
 */

// Import StorageAdapter (non-module fallback included)
// Note: Since this file needs to work as both module and non-module,
// we use dynamic import with fallback
const getStorageAdapter = async () => {
    try {
        const { getStorage, STORAGE_KEYS } = await import('./services/StorageService.js');
        return { getStorage, STORAGE_KEYS };
    } catch {
        // Fallback for non-module contexts
        return {
            getStorage: () => window.StorageService || {
                get: (k, d) => { try { return JSON.parse(storageService.get(k)) ?? d; } catch { return d; } },
                set: (k, v) => storageService.set(k, v)
            },
            STORAGE_KEYS: {
                ALARMS: 'alarms'
            }
        };
    }
};

/**
 * Initialize common components on page load
 */
let _commonComponentsInitialized = false;
async function initializeCommonComponents() {
    // Idempotency guard: prevent running twice (BootstrapManager + auto-init)
    if (_commonComponentsInitialized) {
        console.debug('[InjectHeader] Already initialized, skipping duplicate call');
        return;
    }
    _commonComponentsInitialized = true;

    // Batch 12: Moving to common header even on React pages
    // if (window.location.pathname.includes('grind.html') || document.getElementById('root')) {
    //     console.log('[InjectHeader] React root detected, skipping common header injection');
    //     return;
    // }

    const STORAGE_KEYS = {
        ALARMS: 'alarms'
    };

    // Inject required CSS files
    injectStylesheets();

    // Inject scroll-hide CSS first (needed for navigation)
    injectScrollHideStyles();

    // Create audio element for alarm sound
    createAlarmAudioElement();

    // Add Firebase import map
    addFirebaseImportMap();

    // Load alarm handler module
    loadAlarmHandler();

    // Initialize service worker for alarms (Background)
    initializeAlarmServiceWorker(STORAGE_KEYS);

    // Request notification permission
    requestNotificationPermission();

    // Inject navigation if NavigationComponent is available (Background)
    injectNavigationIfAvailable();

    // Inject Side Drawer component
    injectSideDrawer();
}

/**
 * Injects required stylesheets if missing
 */
function injectStylesheets() {
    const stylesheets = [
        { id: 'design-tokens-css', href: 'css/design-tokens.css' },
        { id: 'mobile-native-css', href: 'css/mobile-native.css' },
        { id: 'navigation-component-css', href: 'css/components/navigation.css' },
        { id: 'side-drawer-css', href: 'css/sideDrawer.css' },
        { id: 'bootstrap-icons', href: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css' }
    ];

    stylesheets.forEach(sheet => {
        if (!document.querySelector(`link[href="${sheet.href}"]`)) {
            const link = document.createElement('link');
            link.id = sheet.id;
            link.rel = 'stylesheet';
            link.href = sheet.href;
            document.head.appendChild(link);
            console.log(`[InjectHeader] Injected stylesheet: ${sheet.href}`);
        }
    });
}

/**
 * Injects CSS for scroll-hide navigation behavior
 */
function injectScrollHideStyles() {
    if (document.getElementById('nav-scroll-hide-styles')) return;

    const style = document.createElement('style');
    style.id = 'nav-scroll-hide-styles';
    style.textContent = `
        .pm-nav, .top-nav {
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
            will-change: transform;
        }
        .pm-nav.nav-hidden, .top-nav.nav-hidden {
            transform: translateY(-110%) !important;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Creates the alarm audio element
 */
function createAlarmAudioElement() {
    if (document.getElementById('alarm-sound')) return; // Already exists

    const alarmAudio = document.createElement('audio');
    alarmAudio.id = 'alarm-sound';
    alarmAudio.src = '/alarm-sounds/alexa-ringtone.mp3';
    alarmAudio.preload = 'auto';
    document.body.appendChild(alarmAudio);
}

/**
 * Adds Firebase import map for ES modules
 */
function addFirebaseImportMap() {
    // Check if import map already exists
    if (document.querySelector('script[type="importmap"]')) return;

    const moduleScript = document.createElement('script');
    moduleScript.type = 'importmap';
    moduleScript.textContent = JSON.stringify({
        imports: {
            'firebase/app': 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js',
            'firebase/firestore': 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js',
            'firebase/auth': 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'
        }
    });
    document.head.appendChild(moduleScript);
}

/**
 * Loads the alarm handler module
 */
function loadAlarmHandler() {
    if (document.querySelector('script[src="/js/alarm-handler.js"]')) return;

    const alarmHandler = document.createElement('script');
    alarmHandler.type = 'module';
    alarmHandler.src = '/js/alarm-handler.js';
    document.body.appendChild(alarmHandler);
}

/**
 * Initializes the alarm service worker
 */
async function initializeAlarmServiceWorker(STORAGE_KEYS) {
    if (!('serviceWorker' in navigator)) {
        console.log('[InjectHeader] Service workers not supported');
        return;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('[InjectHeader] PWA Service Worker registered');

        // Load alarms from storage and schedule active ones
        const alarms = storageService.get(STORAGE_KEYS.ALARMS || 'alarms', []);

        // Wait for the service worker to be active
        const activeWorker = registration.active || registration.waiting || registration.installing;

        if (activeWorker && activeWorker.state === 'activated') {
            scheduleAlarms(activeWorker, alarms);
        } else if (activeWorker) {
            activeWorker.addEventListener('statechange', (e) => {
                if (e.target.state === 'activated') {
                    scheduleAlarms(registration.active, alarms);
                }
            });
        }
    } catch (error) {
        console.error('[InjectHeader] Alarm Service Worker registration failed:', error);
    }
}

/**
 * Schedules active alarms with the service worker
 */
function scheduleAlarms(worker, alarms) {
    if (!worker) return;

    alarms.forEach(alarm => {
        if (alarm.active) {
            worker.postMessage({
                type: 'SET_ALARM',
                time: alarm.time,
                label: alarm.label
            });
        }
    });
}

/**
 * Injects the Side Drawer component script if missing
 */
function injectSideDrawer() {
    // If it's already there and initialized, we're good
    if (window.sideDrawer?.initialized) return;

    // Check if the script is already in the DOM (use partial match for flexibility)
    const existingScript = document.querySelector('script[src*="sideDrawer.js"]');
    
    if (existingScript) {
        // Script exists, it will handle its own auto-initialization on load/DOMReady
        console.debug('[InjectHeader] sideDrawer.js already present, skipping injection');
        return;
    }

    const script = document.createElement('script');
    script.src = 'js/sideDrawer.js';
    script.type = 'module';
    document.body.appendChild(script);
    console.debug('[InjectHeader] Dynamically injected sideDrawer.js');
}

/**
 * Requests notification permission if needed
 */
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        // Only request on user interaction to avoid browser warnings
        document.addEventListener('click', function requestPermission() {
            Notification.requestPermission();
            document.removeEventListener('click', requestPermission);
        }, { once: true });
    }
}

/**
 * Injects navigation using NavigationComponent
 * Replaces any existing static nav with the centralized NavigationComponent
 */
async function injectNavigationIfAvailable() {
    try {
        const { injectNavigation } = await import('./components/NavigationComponent.js');

        // Remove ANY existing navigation to prevent duplication
        document.querySelectorAll('.top-nav, .pm-nav').forEach(el => el.remove());
        
        console.log('[InjectHeader] Removed existing navs, replacing with NavigationComponent');

        // Inject the centralized navigation component
        injectNavigation();
        console.log('[InjectHeader] Navigation injected successfully');
    } catch (error) {
        // NavigationComponent not available, keep static nav if present
        console.debug('[InjectHeader] NavigationComponent not loaded:', error.message);
    }

    // Setup scroll-hide AFTER nav has been injected (retry if not found immediately)
    setupScrollHideWithRetry();
}

/**
 * Sets up scroll-to-hide behavior for navigation with retry logic.
 * Retries up to 10 times (50ms apart) to find the nav element
 * since NavigationComponent injects it asynchronously.
 */
function setupScrollHideWithRetry(attempts = 0) {
    const nav = document.querySelector('.pm-nav') || document.querySelector('.top-nav');
    if (!nav) {
        if (attempts < 20) {
            setTimeout(() => setupScrollHideWithRetry(attempts + 1), 50);
        } else {
            console.debug('[InjectHeader] No navigation element found for scroll-hide after retries');
        }
        return;
    }

    // CRITICAL: Ensure nav is always visible on initial load — remove any stale nav-hidden class
    nav.classList.remove('nav-hidden');

    // Guard: don't attach multiple scroll listeners to the same element
    if (nav.dataset.scrollHideBound) return;
    nav.dataset.scrollHideBound = 'true';

    let lastScrollY = window.scrollY;
    let ticking = false;
    const scrollThreshold = 10;

    function handleScroll() {
        const currentScrollY = window.scrollY;
        
        // Premium touch: add depth shadow when scrolled
        if (currentScrollY > 10) {
            nav.classList.add('nav-scrolled');
        } else {
            nav.classList.remove('nav-scrolled');
        }

        // Always visible at the very top of the page
        if (currentScrollY <= 60) {
            nav.classList.remove('nav-hidden');
            lastScrollY = currentScrollY;
            ticking = false;
            return;
        }

        const delta = currentScrollY - lastScrollY;

        // Hide when scrolling DOWN
        if (delta > scrollThreshold) {
            nav.classList.add('nav-hidden');
            lastScrollY = currentScrollY;
        } 
        // Show when scrolling UP
        else if (delta < -scrollThreshold) {
            nav.classList.remove('nav-hidden');
            lastScrollY = currentScrollY;
        }

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(handleScroll);
            ticking = true;
        }
    }, { passive: true });

    console.log('[InjectHeader] Smart scroll-hide behavior initialized on', nav.className);
}

// Export for module support
export { initializeCommonComponents };

// Expose to window for global access
if (typeof window !== 'undefined') {
    window.initializeCommonComponents = initializeCommonComponents;
}

/**
 * AUTO-INIT: Run immediately when the module loads.
 * This ensures the header is always injected regardless of whether
 * BootstrapManager.boot() is called (fixes the disappeared header bug).
 * BootstrapManager will call it again but initializeCommonComponents is idempotent.
 */
(function autoInit() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initializeCommonComponents());
    } else {
        // DOM already ready — run immediately
        initializeCommonComponents();
    }
})();
