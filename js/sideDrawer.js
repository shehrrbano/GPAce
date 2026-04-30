/**
 * Side Drawer Component
 * Provides navigation and settings drawer functionality
 * 
 * Uses global StorageAdapter for consistent storage access
 */
import { storageService } from './services/StorageService.js';

class SideDrawer {
    constructor() {
        this.isOpen = false;
        this.storage = storageService;
        this.init();
        this.initializeAuth();
    }

    init() {
        // Create drawer HTML
        const drawer = document.createElement('div');
        drawer.className = 'side-drawer';
        drawer.innerHTML = `
            <div class="drawer-content">
                <button class="drawer-close">&times;</button>
                <div class="drawer-header">
                    <h3>Settings</h3>
                </div>
                <div class="drawer-body">
                    <div id="userProfile" class="user-profile">
                        <!-- Profile content will be dynamically updated -->
                    </div>
                    <button id="authButton" class="auth-button">
                        <i class="fas fa-sign-in-alt"></i>
                        Sign In
                    </button>
                    <div class="theme-section">
                        <h4>Theme</h4>
                        <div class="theme-buttons">
                            <button class="theme-btn light-theme" data-theme="light">
                                <i class="bi bi-sun-fill"></i>
                                Light
                            </button>
                            <button class="theme-btn dark-theme" data-theme="dark">
                                <i class="bi bi-moon-fill"></i>
                                Dark
                            </button>
                        </div>
                    </div>
                    <div class="drawer-links">
                        <a href="settings.html" class="drawer-link">
                            <i class="bi bi-gear"></i>
                            Settings
                        </a>
                        <a href="sleep-saboteurs.html" class="drawer-link">
                            <i class="bi bi-clock"></i>
                            Sleep Saboteurs
                        </a>
                        <a href="priority-calculator.html" class="drawer-link">
                            <i class="bi bi-calculator"></i>
                            Priority Calculator
                        </a>
                    </div>
                </div>
            </div>
        `;

        // Add drawer to body
        document.body.appendChild(drawer);

        // Ensure toggle button exists and is bound
        this.ensureToggleButton();

        // Event listeners
        this.setupEventListeners();

        // Watch for navigation replacement (inject-header.js may replace the nav)
        this.watchForNavigationChanges();
    }

    /**
     * Ensures the drawer toggle button exists in the DOM
     * Creates one if missing, or just binds events if it exists
     */
    ensureToggleButton() {
        const existingToggle = document.querySelector('.pm-drawer-toggle') || document.querySelector('.drawer-toggle');
        if (existingToggle) {
            console.log('[SideDrawer] Toggle button found, binding events');
            return;
        }

        console.debug('[SideDrawer] No toggle button found in DOM yet. Will wait for NavigationComponent or event.');
    }

    /**
     * Watches for navigation DOM changes and re-binds events
     * This handles the case where inject-header.js replaces the navigation
     */
    watchForNavigationChanges() {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                // Check if a new navigation was added
                if (mutation.type === 'childList') {
                    const addedNodes = Array.from(mutation.addedNodes);
                    const hasNewNav = addedNodes.some(node =>
                        node.nodeType === 1 && (
                            node.classList?.contains('pm-nav') ||
                            node.classList?.contains('top-nav') ||
                            node.querySelector?.('.pm-nav') ||
                            node.querySelector?.('.top-nav')
                        )
                    );

                    if (hasNewNav) {
                        console.log('[SideDrawer] New navigation detected, re-binding events');
                        // Small delay to ensure DOM is fully updated
                        setTimeout(() => {
                            this.ensureToggleButton();
                            this.setupEventListeners();
                        }, 50);
                    }
                }
            }
        });

        // Observe body for navigation changes
        observer.observe(document.body, { childList: true, subtree: true });

        // Store observer for potential cleanup
        this._navigationObserver = observer;
    }

    setupEventListeners() {
        const drawerToggles = document.querySelectorAll('.drawer-toggle');
        const drawerClose = document.querySelector('.drawer-close');
        const authButton = document.getElementById('authButton');

        // Global event for external components
        if (!window._drawerBound) {
            window.addEventListener('toggleSettingsDrawer', () => this.toggleDrawer());
            window._drawerBound = true;
        }

        // Use data attribute to prevent duplicate listeners
        drawerToggles.forEach(toggle => {
            if (!toggle.hasAttribute('data-drawer-bound')) {
                toggle.setAttribute('data-drawer-bound', 'true');
                toggle.addEventListener('click', () => this.toggleDrawer());
                console.log('[SideDrawer] Toggle button event listener bound');
            }
        });

        if (drawerClose && !drawerClose.hasAttribute('data-drawer-bound')) {
            drawerClose.setAttribute('data-drawer-bound', 'true');
            drawerClose.addEventListener('click', () => this.closeDrawer());
        }

        if (authButton && !authButton.hasAttribute('data-drawer-bound')) {
            authButton.setAttribute('data-drawer-bound', 'true');
            authButton.addEventListener('click', () => this.handleAuth());
        }

        // Theme buttons
        const themeButtons = document.querySelectorAll('.theme-btn');
        themeButtons.forEach(button => {
            if (!button.hasAttribute('data-drawer-bound')) {
                button.setAttribute('data-drawer-bound', 'true');
                button.addEventListener('click', () => this.handleThemeChange(button.dataset.theme));
            }
        });
    }

    async handleAuth() {
        const auth = window.auth; // Get auth instance from window

        if (auth.currentUser) {
            try {
                await window.signOutUser();
                console.log('User signed out successfully');
                // Refresh page after sign out
                location.reload();
            } catch (error) {
                console.error('Error signing out:', error);
            }
        } else {
            try {
                await window.signInWithGoogle();
                console.log('User signed in successfully');
                // Wait a moment for auth state to update
                setTimeout(() => {
                    console.log('🔄 Refreshing page to load user data...');
                    location.reload();
                }, 1000);
            } catch (error) {
                console.error('Error signing in:', error);
            }
        }
    }

    updateUIForUser(user) {
        const authButton = document.getElementById('authButton');
        const userProfile = document.getElementById('userProfile');

        if (authButton && userProfile) {
            // Update auth button
            authButton.innerHTML = `
                <img src="${user.photoURL || 'default-avatar.png'}" alt="${user.displayName}" class="user-avatar">
                <span class="user-name">${user.displayName || user.email}</span>
                <button id="sideDrawerSignOutBtn" class="logout-btn">Sign Out</button>
            `;

            // Add event listener to the sign out button
            const signOutBtn = document.getElementById('sideDrawerSignOutBtn');
            if (signOutBtn) {
                signOutBtn.addEventListener('click', () => this.handleAuth());
            }

            // Show user profile
            userProfile.style.display = 'flex';
            // Data initialization handled by DataInitializationService, not here
        }
    }

    updateUIForSignedOut() {
        const authButton = document.getElementById('authButton');
        const userProfile = document.getElementById('userProfile');

        if (authButton && userProfile) {
            // Reset auth button
            authButton.innerHTML = `
                <i class="fas fa-sign-in-alt"></i>
                Sign In
            `;

            // Hide user profile
            userProfile.style.display = 'none';
        }
    }

    initializeAuth() {
        // Listen for auth state changes with retry mechanism for async module loading
        const maxRetries = 20; // 20 retries * 100ms = 2 seconds max wait
        let retryCount = 0;

        const setupAuthListener = () => {
            if (window.auth && typeof window.auth.onAuthStateChanged === 'function') {
                console.log('[SideDrawer] Auth available, setting up state listener');
                window.auth.onAuthStateChanged(user => {
                    if (user) {
                        this.updateUIForUser(user);
                    } else {
                        this.updateUIForSignedOut();
                    }
                });
            } else if (retryCount < maxRetries) {
                // Auth module not yet loaded, retry after 100ms
                retryCount++;
                setTimeout(setupAuthListener, 100);
            } else {
                console.warn('[SideDrawer] Auth not available after maximum retries. Auth features will be limited.');
            }
        };

        setupAuthListener();
    }

    toggleDrawer() {
        const drawer = document.querySelector('.side-drawer');
        if (drawer) {
            this.isOpen = !this.isOpen;
            drawer.classList.toggle('open', this.isOpen);
        }
    }

    closeDrawer() {
        const drawer = document.querySelector('.side-drawer');
        if (drawer) {
            this.isOpen = false;
            drawer.classList.remove('open');
        }
    }

    handleThemeChange(theme) {
        const storage = getStorage();
        const body = document.body;
        const themeButtons = document.querySelectorAll('.theme-btn');

        // Update theme
        if (theme === 'light') {
            body.classList.add('light-theme');
            storage.set('theme', 'light');
        } else {
            body.classList.remove('light-theme');
            storage.set('theme', 'dark');
        }

        // Update active state of theme buttons
        themeButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.theme === theme);
        });
    }
}

// Initialize drawer
document.addEventListener('DOMContentLoaded', () => {
    window.sideDrawer = new SideDrawer();
});
