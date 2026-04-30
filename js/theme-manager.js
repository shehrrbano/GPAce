// Theme Manager Module for Sleep Saboteurs

// Storage helper with fallback (use existing or create new)
if (typeof window.getStorage === 'undefined') {
    window.getStorage = () => window.StorageService || {
        get: (k, d) => { try { return JSON.parse(storageService.get(k)) ?? d; } catch { return d; } },
        set: (k, v) => storageService.set(k, v)
    };
}
const getStorage = window.getStorage;

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
    const storage = getStorage();
    const body = document.body;
    const themeToggle = document.querySelector('.theme-toggle');

    // If theme toggle doesn't exist, don't proceed
    if (!themeToggle) return;

    const themeIcon = themeToggle.querySelector('.theme-icon');
    const themeText = themeToggle.querySelector('.theme-text');

    body.classList.toggle('light-theme');

    if (body.classList.contains('light-theme')) {
        storage.set('theme', 'light');
        if (themeIcon) themeIcon.textContent = '🌚';
        if (themeText) themeText.textContent = 'Dark Mode';
    } else {
        storage.set('theme', 'dark');
        if (themeIcon) themeIcon.textContent = '🌞';
        if (themeText) themeText.textContent = 'Light Mode';
    }
}

/**
 * Initialize theme based on saved preference
 */
function initializeTheme() {
    const storage = getStorage();
    const body = document.body;
    const themeToggle = document.querySelector('.theme-toggle');

    // Apply saved theme if it exists
    if (storage.get('theme', null) === 'light') {
        body.classList.add('light-theme');

        // Update theme toggle if it exists
        if (themeToggle) {
            const themeIcon = themeToggle.querySelector('.theme-icon');
            const themeText = themeToggle.querySelector('.theme-text');

            if (themeIcon) themeIcon.textContent = '🌚';
            if (themeText) themeText.textContent = 'Dark Mode';
        }
    }

    // Add click event to theme toggle if it exists
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// Export functions for use in other modules
window.themeManager = {
    initializeTheme,
    toggleTheme
};

