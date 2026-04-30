/**
 * workspace-core.js
 * Core functionality for the workspace editor
 * Handles editor initialization, setup, and basic functionality
 */

import NavigationComponent from './components/NavigationComponent.js';
import globals from './core/globals.js';
import EnergyController from './controllers/EnergyController.js';

// Storage helper with fallback
const getStorage = () => window.getStorage?.() || window.StorageService || {
    get: (k, d) => { try { return JSON.parse(storageService.get(k)) ?? d; } catch { return d; } },
    set: (k, v) => storageService.set(k, v)
};

// Global variables and state (encapsulated in module)
let quill;
let editorState = {
    zoom: 100,
    lastSaved: null,
    wordCount: 0,
    charCount: 0
};

/**
 * Initialize the editor and set up event listeners
 */
async function initWorkspace() {
    // Inject standard navigation
    NavigationComponent.injectNavigation();

    initQuillEditor();
    loadSavedContent();
    setupEventListeners();
    startAutoSave();
    updateToolbarState();

    // Initialize Energy Controller
    try {
        if (EnergyController && typeof EnergyController.init === 'function') {
            EnergyController.init();
            globals.register('energyController', EnergyController, { module: 'workspace-core' });
        }
    } catch (error) {
        console.error('Error initializing EnergyController:', error);
    }

    // Initialize task attachments
    if (typeof window.WorkspaceAttachments !== 'undefined') {
        const workspaceAttachments = new window.WorkspaceAttachments();
        try {
            await workspaceAttachments.initialize();

            // Initialize flashcard integration
            if (typeof window.workspaceFlashcardIntegration !== 'undefined') {
                await window.workspaceFlashcardIntegration.init(workspaceAttachments);
            }
        } catch (error) {
            console.error('Error initializing workspace attachments:', error);
            if (window.showToast) window.showToast('Error loading task attachments', 'error');
        }
    }
}

/**
 * Initialize the Quill editor
 */
function initQuillEditor() {
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: false,
            history: {
                delay: 2000,
                maxStack: 500,
                userOnly: true
            }
        },
        placeholder: 'Start typing or paste your content here...',
        formats: [
            'bold', 'italic', 'underline', 'strike',
            'align', 'list', 'bullet', 'indent',
            'link', 'image', 'video',
            'color', 'background',
            'font', 'size', 'header',
            'blockquote', 'code-block',
            'table'
        ]
    });

    // Register quill in the registry for other modules (controlled exposure)
    globals.register('quill', quill, { module: 'workspace-core', readonly: true });
}

/**
 * Load saved content from storage
 */
function loadSavedContent() {
    const storage = getStorage();
    const savedContent = storage.get('workspaceContent', null);
    if (savedContent) {
        quill.setContents(savedContent);
        updateCounts();
        if (window.showToast) window.showToast('Document loaded', 'success');
    }
}

/**
 * Set up event listeners for the editor
 */
function setupEventListeners() {
    quill.on('text-change', () => {
        updateCounts();
        editorState.lastSaved = null;
        const lastSavedEl = document.getElementById('editorLastSaved');
        if (lastSavedEl) lastSavedEl.textContent = 'Last saved: Not saved';
        
        // Import updateToolbarState dynamically if needed or assume it's available via module link
        if (typeof window.updateToolbarState === 'function') {
            window.updateToolbarState();
        }
    });

    quill.on('selection-change', (range) => {
        if (range) {
            if (typeof window.updateToolbarState === 'function') window.updateToolbarState();

            if (range.length > 0) {
                showFloatingToolbar(range);
            } else {
                hideFloatingToolbar();
            }
        } else {
            hideFloatingToolbar();
        }
    });

    document.addEventListener('keydown', handleKeyboardShortcuts);

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.editor-dropdown')) {
            closeAllDropdowns();
            if (typeof window.closeTextToSpeechDropdown === 'function') {
                window.closeTextToSpeechDropdown();
            }
        }
    });

    setupToolbarEventListeners();
}

/**
 * Set up event listeners for toolbar buttons
 */
function setupToolbarEventListeners() {
    const safeAddListener = (id, event, handler) => {
        const el = document.getElementById(id) || document.querySelector(id);
        if (el) el.addEventListener(event, handler);
    };

    // Document operations
    safeAddListener('button[data-tooltip*="New Document"]', 'click', () => {
        if (typeof window.newDocument === 'function') window.newDocument();
    });
    safeAddListener('button[data-tooltip*="Open"]', 'click', () => {
        if (typeof window.openDocument === 'function') window.openDocument();
    });
    safeAddListener('button[data-tooltip*="Save"]', 'click', () => {
        if (typeof window.saveDocument === 'function') window.saveDocument();
    });
    safeAddListener('button[data-tooltip*="Undo"]', 'click', () => performEdit('undo'));
    safeAddListener('button[data-tooltip*="Redo"]', 'click', () => performEdit('redo'));

    // Export buttons
    safeAddListener('exportPdfBtn', 'click', () => {
        if (typeof window.exportAsPDF === 'function') window.exportAsPDF();
    });
    safeAddListener('exportWordBtn', 'click', () => {
        if (typeof window.exportAsWord === 'function') window.exportAsWord();
    });

    // Speech recognition
    safeAddListener('speechRecognitionBtn', 'click', () => {
        if (typeof window.toggleSpeechRecognition === 'function') window.toggleSpeechRecognition();
    });
    safeAddListener('summarizeBtn', 'click', () => {
        if (typeof window.summarizeTranscription === 'function') window.summarizeTranscription();
    });

    // Text-to-speech
    safeAddListener('textToSpeechBtn', 'click', () => {
        // If it's a dropdown in the new UI, this might just show options
        if (typeof window.showTextToSpeechOptions === 'function') window.showTextToSpeechOptions();
        else if (typeof window.speakAllText === 'function') window.speakAllText();
    });
    safeAddListener('stopTextToSpeechBtn', 'click', () => {
        if (typeof window.stopSpeaking === 'function') window.stopSpeaking();
    });

    // Formatting
    document.querySelectorAll('button[data-format]').forEach(button => {
        const format = button.getAttribute('data-format');
        button.addEventListener('click', () => {
            if (typeof window.toggleFormat === 'function') window.toggleFormat(format);
        });
    });

    // Font family and size
    safeAddListener('fontFamily', 'change', () => {
        if (typeof window.updateFormat === 'function') window.updateFormat('fontFamily');
    });
    safeAddListener('fontSize', 'change', () => {
        if (typeof window.updateFormat === 'function') window.updateFormat('fontSize');
    });

    // Color pickers (using 'input' for real-time preview)
    safeAddListener('textColor', 'input', () => {
        if (typeof window.updateFormat === 'function') window.updateFormat('color');
        const wrapper = document.querySelector('#textColor').closest('.color-picker-wrapper');
        if (wrapper) wrapper.style.color = document.getElementById('textColor').value;
    });
    safeAddListener('backgroundColor', 'input', () => {
        if (typeof window.updateFormat === 'function') window.updateFormat('background');
        const wrapper = document.querySelector('#backgroundColor').closest('.color-picker-wrapper');
        if (wrapper) wrapper.style.color = document.getElementById('backgroundColor').value;
    });

    // Image, link, table
    safeAddListener('button[data-tooltip*="Insert Image"]', 'click', () => {
        if (typeof window.showImageOptions === 'function') window.showImageOptions();
    });
    safeAddListener('button[data-tooltip*="Insert Link"]', 'click', () => {
        if (typeof window.insertLink === 'function') window.insertLink();
    });
    safeAddListener('button[data-tooltip*="Insert Table"]', 'click', () => {
        if (typeof window.insertTable === 'function') window.insertTable();
    });

    // Zoom controls
    safeAddListener('button[data-tooltip="Zoom Out"]', 'click', () => adjustZoom('out'));
    safeAddListener('button[data-tooltip="Zoom In"]', 'click', () => adjustZoom('in'));

    // Theme toggle
    safeAddListener('.theme-toggle', 'click', () => {
        if (typeof window.toggleTheme === 'function') window.toggleTheme();
    });

    // Drag and drop
    const editorContainer = document.getElementById('editorContainer');
    if (editorContainer) {
        editorContainer.addEventListener('drop', (e) => {
            if (typeof window.handleDrop === 'function') window.handleDrop(e);
        });
        editorContainer.addEventListener('dragover', (e) => {
            if (typeof window.handleDragOver === 'function') window.handleDragOver(e);
        });
        editorContainer.addEventListener('dragleave', (e) => {
            if (typeof window.handleDragLeave === 'function') window.handleDragLeave(e);
        });
    }
}

/**
 * Handle floating toolbar positioning
 */
function showFloatingToolbar(range) {
    const toolbar = document.getElementById('floatingToolbar');
    if (!toolbar) return;

    // Get bounds of selection relative to the editor root
    const bounds = quill.getBounds(range.index, range.length);
    const editorContainer = document.getElementById('editorContainer');
    if (!editorContainer) return;

    // The editor container is the relative parent for absolute positioning
    // bounds are already relative to the Quill root which is inside editorContainer
    
    // Position toolbar above selection center
    const toolbarHeight = toolbar.offsetHeight || 40;
    const toolbarWidth = toolbar.offsetWidth || 300;
    
    let top = bounds.top - toolbarHeight - 10;
    let left = bounds.left + (bounds.width / 2) - (toolbarWidth / 2);

    // Ensure it doesn't go off the top of the editor
    if (top < 0) {
        top = bounds.bottom + 10;
    }

    // Horizontal containment within editorContainer
    const containerWidth = editorContainer.offsetWidth;
    if (left < 10) {
        left = 10;
    } else if (left + toolbarWidth > containerWidth - 10) {
        left = containerWidth - toolbarWidth - 10;
    }

    toolbar.style.top = `${top}px`;
    toolbar.style.left = `${left}px`;
    toolbar.classList.add('visible');
}

/**
 * Hide the floating toolbar
 */
function hideFloatingToolbar() {
    const toolbar = document.getElementById('floatingToolbar');
    if (toolbar) toolbar.classList.remove('visible');
}

/**
 * Start auto-save functionality
 */
function startAutoSave() {
    setInterval(() => {
        if (typeof window.saveContent === 'function') window.saveContent();
    }, 30000);
}

/**
 * Update word and character counts
 */
function updateCounts() {
    const text = quill.getText();
    editorState.wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    editorState.charCount = text.length;

    const updateText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    updateText('editorWordCount', `${editorState.wordCount} words`);
    updateText('editorCharCount', `${editorState.charCount} characters`);
    updateText('wordCount', `${editorState.wordCount} words`);
    updateText('charCount', `${editorState.charCount} characters`);
}

/**
 * Update last saved status
 */
function updateLastSaved() {
    const timeString = editorState.lastSaved ? editorState.lastSaved.toLocaleTimeString() : 'Never';
    const updateText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    updateText('editorLastSaved', timeString);
    updateText('lastSaved', `Last saved: ${timeString}`);
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(e) {
    if (e.ctrlKey) {
        const key = e.key.toLowerCase();
        switch (key) {
            case 's':
                e.preventDefault();
                if (typeof window.saveDocument === 'function') window.saveDocument();
                break;
            case 'n':
                e.preventDefault();
                if (typeof window.newDocument === 'function') window.newDocument();
                break;
            case 'o':
                e.preventDefault();
                if (typeof window.openDocument === 'function') window.openDocument();
                break;
            case 'b':
                e.preventDefault();
                if (typeof window.toggleFormat === 'function') window.toggleFormat('bold');
                break;
            case 'i':
                e.preventDefault();
                if (typeof window.toggleFormat === 'function') window.toggleFormat('italic');
                break;
            case 'u':
                e.preventDefault();
                if (typeof window.toggleFormat === 'function') window.toggleFormat('underline');
                break;
            case 'z':
                e.preventDefault();
                performEdit('undo');
                break;
            case 'y':
                e.preventDefault();
                performEdit('redo');
                break;
        }
    }
}

/**
 * Dropdown handling
 */
function toggleDropdown(id) {
    closeAllDropdowns();
    const el = document.getElementById(id);
    if (el) el.classList.toggle('show');
}

/**
 * Close all dropdowns
 */
function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-content').forEach(dropdown => {
        dropdown.classList.remove('show');
    });
}

/**
 * Perform edit operations
 */
function performEdit(action) {
    if (!quill) return;
    switch (action) {
        case 'undo':
            quill.history.undo();
            break;
        case 'redo':
            quill.history.redo();
            break;
    }
}

/**
 * Adjust zoom level
 */
function adjustZoom(direction) {
    const change = direction === 'in' ? 10 : -10;
    editorState.zoom = Math.max(50, Math.min(200, editorState.zoom + change));
    
    const zoomLevelEl = document.getElementById('zoomLevel');
    if (zoomLevelEl) zoomLevelEl.textContent = `${editorState.zoom}%`;
    
    const contentEl = document.querySelector('.editor-content');
    if (contentEl) {
        contentEl.style.transform = `scale(${editorState.zoom / 100})`;
        contentEl.style.transformOrigin = 'top center';
    }
}

// Global Registration
globals.register('editorState', editorState, { module: 'workspace-core' });
globals.register('updateCounts', updateCounts, { module: 'workspace-core' });
globals.register('updateLastSaved', updateLastSaved, { module: 'workspace-core' });
globals.register('toggleDropdown', toggleDropdown, { module: 'workspace-core' });
globals.register('closeAllDropdowns', closeAllDropdowns, { module: 'workspace-core' });
globals.register('performEdit', performEdit, { module: 'workspace-core' });
globals.register('adjustZoom', adjustZoom, { module: 'workspace-core' });
globals.register('initWorkspace', initWorkspace, { module: 'workspace-core' });

// Initialize when imported if desired, or let HTML trigger it
document.addEventListener('DOMContentLoaded', initWorkspace);

export {
    quill,
    editorState,
    updateCounts,
    updateLastSaved,
    toggleDropdown,
    closeAllDropdowns,
    performEdit,
    initWorkspace,
    showFloatingToolbar,
    hideFloatingToolbar,
    adjustZoom
};

