/**
 * workspace-ui.js
 * Handles UI elements like toast notifications, theme toggling, etc.
 */

import globals from './core/globals.js';

/**
 * Show toast notification
 */
function showToast(message, type = 'info', duration = 2000) {
    const toastId = 'toast-' + Date.now();

    let displayMessage = message;
    if (message.length > 50) {
        displayMessage = message.substring(0, 47) + '...';
    }

    let icon;
    switch (type) {
        case 'success': icon = 'check-circle-fill'; break;
        case 'error': icon = 'exclamation-circle-fill'; break;
        case 'warning': icon = 'exclamation-triangle-fill'; break;
        default: icon = 'info-circle-fill';
    }

    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `status-message ${type}`;

    // Use innerHTML only for the fixed structure, but textContent for the dynamic message
    toast.innerHTML = `
        <i class="bi bi-${icon}"></i>
        <span class="toast-message"></span>
        ${duration > 0 ? '<button class="toast-close" id="close-' + toastId + '">&times;</button>' : ''}
    `;

    const messageEl = toast.querySelector('.toast-message');
    if (messageEl) messageEl.textContent = displayMessage;


    if (message.length > 50) toast.title = message;

    document.body.appendChild(toast);

    const closeBtn = document.getElementById('close-' + toastId);
    if (closeBtn) closeBtn.onclick = () => hideToast(toastId);

    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0) scale(1)';
    }, 10);

    if (duration > 0) {
        setTimeout(() => hideToast(toastId), duration);
    }

    const toasts = document.querySelectorAll('.status-message');
    if (toasts.length > 3) {
        for (let i = 0; i < toasts.length - 3; i++) {
            if (toasts[i].id !== toastId) hideToast(toasts[i].id);
        }
    }

    return toastId;
}

/**
 * Hide toast notification
 */
function hideToast(id) {
    const toast = document.getElementById(id);
    if (toast) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px) scale(0.95)';
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }
}

// Storage helper
const getStorage = () => window.getStorage?.() || window.StorageService || {
    get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};

function toggleTheme() {
    const storage = getStorage();
    const body = document.body;
    const themeIcon = document.querySelector('.theme-icon');
    const themeText = document.querySelector('.theme-text');

    if (body.classList.contains('light-theme')) {
        body.classList.remove('light-theme');
        if (themeIcon) themeIcon.textContent = '🌞';
        if (themeText) themeText.textContent = 'Light Mode';
        storage.set('theme', 'dark');
    } else {
        body.classList.add('light-theme');
        if (themeIcon) themeIcon.textContent = '🌙';
        if (themeText) themeText.textContent = 'Dark Mode';
        storage.set('theme', 'light');
    }
}

/**
 * Set initial theme based on localStorage
 */
function initTheme() {
    const storage = getStorage();
    const savedTheme = storage.get('theme', 'dark');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        const icon = document.querySelector('.theme-icon');
        const text = document.querySelector('.theme-text');
        if (icon) icon.textContent = '🌙';
        if (text) text.textContent = 'Dark Mode';
    }
}

/**
 * Listen for theme changes from other tabs
 */
function setupThemeListener() {
    window.addEventListener('storage', (e) => {
        if (e.key === 'theme' || e.key === 'gpace_theme') {
            const body = document.body;
            const themeIcon = document.querySelector('.theme-icon');
            const themeText = document.querySelector('.theme-text');

            if (e.newValue === 'light' || e.newValue === '"light"') {
                body.classList.add('light-theme');
                if (themeIcon) themeIcon.textContent = '🌙';
                if (themeText) themeText.textContent = 'Dark Mode';
            } else {
                body.classList.remove('light-theme');
                if (themeIcon) themeIcon.textContent = '🌞';
                if (themeText) themeText.textContent = 'Light Mode';
            }
        }
    });
}

/**
 * Toggle the Task Extras panel (Inline Footer)
 * @param {boolean|null} forceState - Optional force state (true = show, false = hide)
 */
function toggleTaskExtras(forceState = null) {
    const panel = document.getElementById('taskExtrasPanel');
    const ribbonBtn = document.getElementById('toggleTaskExtrasBtn');
    const statusBtn = document.getElementById('toggleAttachmentsBtn');

    if (panel) {
        const isCurrentlyCollapsed = panel.classList.contains('collapsed');
        const shouldBeCollapsed = forceState === null ? !isCurrentlyCollapsed : !forceState;

        panel.classList.toggle('collapsed', shouldBeCollapsed);
        
        // Update Button UI
        [ribbonBtn, statusBtn].forEach(btn => {
            if (btn) btn.classList.toggle('active', !shouldBeCollapsed);
        });

        // Persist state
        const storage = getStorage();
        storage.set('task_extras_collapsed', shouldBeCollapsed);
    }
}

// Initialize theme and UI
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupThemeListener();

    // Setup Task Extras toggle listeners
    const toggleBtn = document.getElementById('toggleTaskExtrasBtn');
    const statusBtn = document.getElementById('toggleAttachmentsBtn');
    const closeExtrasBtn = document.getElementById('closeExtrasBtn');

    if (toggleBtn) toggleBtn.addEventListener('click', () => toggleTaskExtras());
    if (statusBtn) statusBtn.addEventListener('click', () => toggleTaskExtras());
    if (closeExtrasBtn) closeExtrasBtn.addEventListener('click', () => toggleTaskExtras(false));

    // Recover Task Extras state
    setTimeout(() => {
        const storage = getStorage();
        const wasCollapsed = storage.get('task_extras_collapsed', false);
        toggleTaskExtras(!wasCollapsed);
    }, 50);

    // Workspace UI initialization complete
});


// Global Registration
globals.register('showToast', showToast, { module: 'workspace-ui' });
globals.register('hideToast', hideToast, { module: 'workspace-ui' });
globals.register('toggleTheme', toggleTheme, { module: 'workspace-ui' });
globals.register('toggleTaskExtras', toggleTaskExtras, { module: 'workspace-ui' });

export {
    showToast,
    hideToast,
    toggleTheme,
    initTheme,
    setupThemeListener,
    toggleTaskExtras
};

