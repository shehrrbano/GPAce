/**
 * GrindController.js
 * Centralized event management for grind.html
 */

import globals from '../core/globals.js';
import taskSystem from '../core/TaskSystem.js';

class GrindController {
    constructor() {
        this.initialized = false;
        this.taskService = taskSystem;
    }

    init() {
        if (this.initialized) return;
        console.log('[GrindController] Initializing...');
        this.setupEventListeners();
        this.initialized = true;
    }

    setupEventListeners() {
        // Navigation and Global Actions
        this.addSafeListener('.relaxed-mode-btn', 'click', () => {
            window.location.href = 'relaxed-mode/index.html';
        });

        this.addSafeListener('#syncTasksBtn', 'click', () => {
            if (typeof window.handleSyncTasks === 'function') window.handleSyncTasks();
        });

        // Workspace Panel
        this.addSafeListener('#workspaceToggle', 'click', () => this.toggleWorkspace(true));
        this.addSafeListener('#workspaceClose', 'click', () => this.toggleWorkspace(false));
        this.addSafeListener('#workspaceOverlay', 'click', () => this.toggleWorkspace(false));

        // Modals
        this.addSafeListener('.modal-btn.cancel', 'click', () => {
            if (typeof window.closeAddLinkModal === 'function') window.closeAddLinkModal();
        });

        // Quote Controls
        this.addSafeListener('.quote-nav-btn:first-child', 'click', () => {
            if (typeof window.rotateQuote === 'function') window.rotateQuote(-1);
        });
        this.addSafeListener('.quote-nav-btn:last-child', 'click', () => {
            if (typeof window.rotateQuote === 'function') window.rotateQuote(1);
        });

        // Task Creation
        this.addSafeListener('.add-task-button', 'click', () => {
            if (typeof window.showTaskModal === 'function') window.showTaskModal();
        });

        // Note Scanning
        this.addSafeListener('#ccScanNotes', 'click', () => this.ccScanNotes());

        // AI Researcher Config
        this.addSafeListener('#toggleApiConfig', 'click', () => {
            if (typeof window.toggleApiConfig === 'function') window.toggleApiConfig();
        });

        // Command Center AI Toggle
        this.addSafeListener('#ccToggleAI', 'click', () => this.toggleAIContainer());

        // Keyboard Shortcut Alt+A for AI Toggle
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key.toLowerCase() === 'a') {
                e.preventDefault();
                this.toggleAIContainer();
            }
        });

        console.log('[GrindController] Event listeners setup complete');
    }

    toggleAIContainer() {
        const container = document.querySelector('.ai-researcher-container');
        const cc = document.getElementById('commandCenter');
        const icon = document.querySelector('#ccToggleAI i');
        
        if (container) {
            const isHidden = container.classList.toggle('hidden');
            if (cc) cc.classList.toggle('expanded', !isHidden);
            if (icon) {
                icon.className = isHidden ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
            }
        }
    }

    ccScanNotes() {
        const input = document.getElementById('noteScanInput');
        if (input) input.click();
    }

    toggleWorkspace(open) {
        const panel = document.getElementById('workspacePanel');
        const overlay = document.getElementById('workspaceOverlay');
        const container = document.querySelector('.container');
        
        if (panel) {
            panel.classList.toggle('open', open);
            if (overlay) overlay.style.display = open ? 'block' : 'none';
            if (container) container.classList.toggle('workspace-open', open);
        }
    }

    addSafeListener(selector, event, handler) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => el.addEventListener(event, handler));
    }
}

const grindController = new GrindController();
export default grindController;

// Register with globals for any remaining legacy needs
globals.register('GrindController', grindController, { module: 'GrindController' });

document.addEventListener('DOMContentLoaded', () => grindController.init());
