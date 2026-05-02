/**
 * Side Drawer Component
 * Provides navigation and settings drawer functionality
 * 
 * Uses global StorageAdapter for consistent storage access
 */
class SideDrawer {
    constructor() {
        this.isOpen = false;
        this.initialized = false;
        this.toggleButton = null;
    }

    init() {
        if (this.initialized) return;
        
        console.log('[SideDrawer] Initializing...');
        const drawer = document.createElement('div');
        drawer.className = 'side-drawer';
        drawer.innerHTML = `
            <div class="drawer-overlay"></div>
            <div class="drawer-content">
                <div class="drawer-header">
                    <div class="header-main">
                        <span class="kicker">Command Center</span>
                        <h3>Settings</h3>
                    </div>
                    <button class="drawer-close" aria-label="Close Drawer">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                
                <div class="drawer-body">
                    <div class="drawer-section profile-section">
                        <div id="userProfile" class="user-profile">
                            <!-- Profile content will be dynamically updated -->
                        </div>
                        <div id="authContainer" class="auth-container">
                            <button id="authButton" class="btn-auth">
                                <i class="bi bi-google"></i>
                                <span>Sign In with Google</span>
                            </button>
                        </div>
                    </div>

                    <div class="drawer-section">
                        <span class="section-kicker">Appearance</span>
                        <div class="theme-control">
                            <div class="theme-buttons">
                                <button class="theme-btn light-theme" data-theme="light">
                                    <i class="bi bi-sun"></i>
                                    <span>Light</span>
                                </button>
                                <button class="theme-btn dark-theme" data-theme="dark">
                                    <i class="bi bi-moon-stars"></i>
                                    <span>Dark</span>
                                </button>
                                <div class="theme-pill"></div>
                            </div>
                        </div>
                    </div>

                    <div class="drawer-section">
                        <span class="section-kicker">Navigation</span>
                        <nav class="drawer-links">
                            <a href="settings.html" class="drawer-link">
                                <div class="link-icon"><i class="bi bi-gear"></i></div>
                                <div class="link-label">Settings</div>
                            </a>
                            <a href="sleep-saboteurs.html" class="drawer-link">
                                <div class="link-icon"><i class="bi bi-alarm"></i></div>
                                <div class="link-label">Sleep Saboteurs</div>
                            </a>
                            <a href="priority-calculator.html" class="drawer-link">
                                <div class="link-icon"><i class="bi bi-calculator"></i></div>
                                <div class="link-label">Priority Calculator</div>
                            </a>
                        </nav>
                    </div>
                </div>
                
                <div class="drawer-footer">
                    <div class="footer-meta">GPAce v2.0 · Grind Mode</div>
                </div>
            </div>
        `;

        // Add drawer to body
        document.body.appendChild(drawer);

        // Ensure toggle button exists and is bound
        this.ensureToggleButton();

        // Event listeners
        this.setupEventListeners();
        this.initialized = true;
        this.watchForNavigationChanges();
        console.log('[SideDrawer] Component initialized and attached');
    }

    /**
     * Ensures the drawer toggle button exists in the DOM
     * Creates one if missing, or just binds events if it exists
     */
    ensureToggleButton() {
        const existingToggle = document.querySelector('.pm-drawer-toggle') || document.querySelector('.drawer-toggle') || document.getElementById('globalSettingsBtn');
        if (existingToggle) {
            console.log('[SideDrawer] Toggle button found, binding events');
            this.setupEventListeners();
            return true;
        }
        return false;
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
                            if (this.ensureToggleButton()) {
                                this.setupEventListeners();
                            }
                        }, 100);
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
        const drawerToggles = document.querySelectorAll('.pm-drawer-toggle, .drawer-toggle');
        const drawerClose = document.querySelector('.drawer-close');
        const authButton = document.getElementById('authButton');
        const overlay = document.querySelector('.drawer-overlay');

        // Global event for external components
        if (!window._drawerBound) {
            window.addEventListener('toggleSettingsDrawer', () => this.toggleDrawer());
            window._drawerBound = true;
        }

        // Use data attribute to prevent duplicate listeners
        drawerToggles.forEach(toggle => {
            if (!toggle.hasAttribute('data-drawer-bound')) {
                toggle.setAttribute('data-drawer-bound', 'true');
                
                // If this is the globalSettingsBtn, NavigationComponent already dispatches an event
                // so we don't bind a direct click here to avoid double-toggle.
                if (toggle.id !== 'globalSettingsBtn') {
                    toggle.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.toggleDrawer();
                    });
                    console.log('[SideDrawer] Toggle button event listener bound');
                } else {
                    console.log('[SideDrawer] Skipping direct binding for globalSettingsBtn (handled by event)');
                }
            }
        });

        if (drawerClose && !drawerClose.hasAttribute('data-drawer-bound')) {
            drawerClose.setAttribute('data-drawer-bound', 'true');
            drawerClose.addEventListener('click', () => this.closeDrawer());
        }

        if (overlay && !overlay.hasAttribute('data-drawer-bound')) {
            overlay.setAttribute('data-drawer-bound', 'true');
            overlay.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeDrawer();
            });
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

        if (auth?.currentUser) {
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
        const authContainer = document.getElementById('authContainer');

        if (userProfile) {
            if (authContainer) authContainer.style.display = 'none';

            userProfile.innerHTML = `
                <div class="profile-card">
                    <div class="profile-main">
                        <div class="avatar-wrapper">
                            <img src="${user.photoURL || 'assets/images/default-avatar.png'}" alt="${user.displayName}" class="user-avatar">
                            <div class="avatar-glow"></div>
                        </div>
                        <div class="profile-info">
                            <span class="user-name">${user.displayName || user.email}</span>
                            <span class="user-status">Verified Agent</span>
                        </div>
                    </div>
                    <button id="sideDrawerSignOutBtn" class="btn-logout" title="Sign Out">
                        <i class="bi bi-box-arrow-right"></i>
                    </button>
                </div>
            `;

            const signOutBtn = document.getElementById('sideDrawerSignOutBtn');
            if (signOutBtn) {
                signOutBtn.addEventListener('click', () => this.handleAuth());
            }

            userProfile.style.display = 'block';
        }
    }

    updateUIForSignedOut() {
        const authContainer = document.getElementById('authContainer');
        const userProfile = document.getElementById('userProfile');

        if (authContainer) authContainer.style.display = 'block';
        if (userProfile) userProfile.style.display = 'none';
    }

    initializeAuth() {
        // Listen for auth state changes with retry mechanism for async module loading
        const maxRetries = 20; 
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
                retryCount++;
                setTimeout(setupAuthListener, 100);
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
        // Update theme on document element
        document.documentElement.setAttribute('data-theme', theme);
        
        // Persist theme choice
        localStorage.setItem('gpace_theme', theme);
        
        // Update body class if needed (legacy support)
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        }

        // Update active state of theme buttons in drawer
        const themeButtons = document.querySelectorAll('.theme-btn');
        themeButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.theme === theme);
        });
        
        console.log(`[SideDrawer] Theme changed to: ${theme}`);
    }
}

// Create global instance
const sideDrawerInstance = new SideDrawer();

// Expose to window for global access
window.sideDrawer = sideDrawerInstance;

// Also support module export
export { SideDrawer };
export default sideDrawerInstance;

