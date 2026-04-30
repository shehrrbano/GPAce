/**
 * Theme Manager
 * Handles theme toggling functionality and persistence
 * Uses StorageService for theme preference persistence
 */

// Storage helper with fallback (use existing or create new)
if (typeof window.getStorage === 'undefined') {
    window.getStorage = () => window.StorageService || {
        get: (k, d) => { try { return JSON.parse(storageService.get(k)) ?? d; } catch { return d; } },
        set: (k, v) => storageService.set(k, v)
    };
}
const getStorage = window.getStorage;

class ThemeManager {
    constructor() {
        this.body = document.body;
        this.themeIcon = null;
        this.themeText = null;
        this.themeToggleBtn = null;

        // Initialize on DOM content loaded
        document.addEventListener('DOMContentLoaded', () => this.init());
    }

    init() {
        // Create theme toggle button if it doesn't exist
        this.createThemeToggleIfNeeded();

        // Get references to theme elements
        this.themeIcon = document.querySelector('.theme-icon');
        this.themeText = document.querySelector('.theme-text');

        // Add event listener to theme toggle button
        this.themeToggleBtn = document.querySelector('.theme-toggle');
        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }

        // Initialize theme based on localStorage
        this.initializeTheme();
    }

    createThemeToggleIfNeeded() {
        // Check if theme toggle button already exists
        if (document.querySelector('.theme-toggle')) {
            return;
        }

        // Create theme toggle button
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.setAttribute('aria-label', 'Toggle Theme');
        themeToggle.innerHTML = `
            <span class="theme-icon">🌞</span>
            <span class="theme-text">Light Mode</span>
        `;

        // Append to body
        document.body.appendChild(themeToggle);
    }

    initializeTheme() {
        // Apply saved theme preference using StorageService
        const storage = getStorage();
        const savedTheme = storage.get('theme', 'dark');

        if (savedTheme === 'light') {
            this.body.classList.add('light-theme');
            if (this.themeIcon) this.themeIcon.textContent = '🌚';
            if (this.themeText) this.themeText.textContent = 'Dark Mode';
        } else {
            this.body.classList.remove('light-theme');
            if (this.themeIcon) this.themeIcon.textContent = '🌞';
            if (this.themeText) this.themeText.textContent = 'Light Mode';
        }
    }

    toggleTheme() {
        const storage = getStorage();
        this.body.classList.toggle('light-theme');

        if (this.body.classList.contains('light-theme')) {
            if (this.themeIcon) this.themeIcon.textContent = '🌚';
            if (this.themeText) this.themeText.textContent = 'Dark Mode';
            storage.set('theme', 'light');
        } else {
            if (this.themeIcon) this.themeIcon.textContent = '🌞';
            if (this.themeText) this.themeText.textContent = 'Light Mode';
            storage.set('theme', 'dark');
        }

        // Play sound if sound manager is available
        if (window.soundManager) {
            window.soundManager.playSound('click', 'confirm');
        }
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// ============================================
// Module Exports (ES Modules - preferred)
// ============================================
export { themeManager, ThemeManager };
export default themeManager;

// ============================================
// Global Registration (for HTML onclick compatibility)
// ============================================
window.themeManager = themeManager;
window.toggleTheme = () => themeManager.toggleTheme();

if (window.DEBUG_GLOBALS) {
    console.log('[themeManager] Registered globals: themeManager, toggleTheme');
}

