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
        const { getStorage, STORAGE_KEYS } = await import('../services/StorageService.js');
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
async function initializeCommonComponents() {
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

    // Initialize service worker for alarms
    await initializeAlarmServiceWorker(STORAGE_KEYS);

    // Request notification permission
    requestNotificationPermission();

    // Inject navigation if NavigationComponent is available
    await injectNavigationIfAvailable();

    // Inject Side Drawer component
    injectSideDrawer();
}

/**
 * Injects required stylesheets if missing
 */
function injectStylesheets() {
    const stylesheets = [
        { id: 'design-tokens-css', href: 'css/design-tokens.css' },
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
        .top-nav {
            transition: transform 0.3s ease-in-out !important;
            will-change: transform;
        }
        .top-nav.nav-hidden {
            transform: translateY(-100%) !important;
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
        const registration = await navigator.serviceWorker.register('/js/alarm-service-worker.js');
        console.log('[InjectHeader] Alarm Service Worker registered');

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
    // Check if sideDrawer.js is already loaded or already present in DOM
    if (window.sideDrawer || document.querySelector('script[src="js/sideDrawer.js"]')) {
        // If loaded but not initialized, init it
        if (window.sideDrawer && typeof window.sideDrawer.init === 'function' && !window.sideDrawer.initialized) {
            window.sideDrawer.init();
        }
        return;
    }

    const script = document.createElement('script');
    script.src = 'js/sideDrawer.js';
    script.type = 'module'; // sideDrawer.js uses ESM exports now
    script.onload = () => {
        if (window.sideDrawer && typeof window.sideDrawer.init === 'function') {
            window.sideDrawer.init();
        }
    };
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

    // Always setup scroll-hide for navigation (works with static or injected nav)
    setupScrollHide();
}

/**
 * Sets up scroll-to-hide behavior for navigation
 * - Navigation auto-hides after 2 seconds of inactivity
 * - Only shows when actively scrolling up
 * - Always visible at the very top of the page
 */
function setupScrollHide() {
    const nav = document.querySelector('.top-nav');
    if (!nav) {
        console.debug('[InjectHeader] No .top-nav found for scroll-hide');
        return;
    }

    let lastScrollY = window.scrollY;
    let ticking = false;
    let hideTimer = null;
    const scrollThreshold = 10;
    const autoHideDelay = 2000; // 2 seconds

    // Function to hide the nav (only if not at the very top)
    function hideNav() {
        if (window.scrollY > 0) {
            nav.classList.add('nav-hidden');
        }
    }

    // Function to show the nav
    function showNav() {
        nav.classList.remove('nav-hidden');
    }

    // Start or reset the auto-hide timer
    function startAutoHideTimer() {
        if (hideTimer) {
            clearTimeout(hideTimer);
        }
        hideTimer = setTimeout(hideNav, autoHideDelay);
    }

    // Stop the auto-hide timer
    function stopAutoHideTimer() {
        if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimer = null;
        }
    }

    function handleScroll() {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;

        // At the very top - always show, no auto-hide
        if (currentScrollY <= 0) {
            showNav();
            stopAutoHideTimer();
            lastScrollY = currentScrollY;
            ticking = false;
            return;
        }

        // Trigger show/hide based on scroll direction
        if (Math.abs(scrollDelta) >= scrollThreshold) {
            if (scrollDelta < 0) {
                // Scrolling UP - show nav, then start timer to hide after 2s
                showNav();
                startAutoHideTimer();
            } else {
                // Scrolling DOWN - hide immediately
                hideNav();
                stopAutoHideTimer(); // No need for timer when already hidden
            }
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(handleScroll);
            ticking = true;
        }
    }, { passive: true });

    // Start auto-hide timer on page load (will hide after 2 seconds)
    startAutoHideTimer();

    console.log('[InjectHeader] Scroll-hide behavior initialized with auto-hide');
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCommonComponents);
} else {
    initializeCommonComponents();
}

