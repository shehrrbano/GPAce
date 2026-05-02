/**
 * StudySpacesManager - Main orchestrator for study spaces page
 * 
 * This is a refactored, modular version that delegates to focused controllers:
 * - ScheduleController: Wake/sleep times, timetable upload
 * - TimetableController: Timeline visualization, analysis display
 * - StudySpaceController: Study space CRUD, image handling, sync
 */

class StudySpacesManager {
    constructor() {
        this.scheduleController = null;
        this.timetableController = null;
        this.studySpaceController = null;
        this.userId = 'default';
        this.initialized = false;
    }

    /**
     * Initialize the manager and all controllers
     */
    async init() {
        if (this.initialized) {
            console.warn('StudySpacesManager already initialized');
            return;
        }

        try {
            // Get user ID from Firebase Auth if available
            await this.initializeUserId();

            // Initialize controllers
            this.scheduleController = new ScheduleController();
            this.timetableController = new TimetableController();
            this.studySpaceController = new StudySpaceController();

            // Set user ID on controllers
            this.scheduleController.setUserId(this.userId);
            this.studySpaceController.setUserId(this.userId);

            // Initialize controllers
            this.scheduleController.init();
            this.timetableController.init();
            this.studySpaceController.init();

            // Setup additional event listeners
            this.setupGlobalListeners();

            // Load saved settings
            await this.loadSavedSettings();

            this.initialized = true;
            console.log('StudySpacesManager initialized successfully');

        } catch (error) {
            console.error('Error initializing StudySpacesManager:', error);
        }
    }

    /**
     * Initialize user ID from Firebase Auth
     */
    async initializeUserId() {
        // Wait a bit for auth to be ready
        await new Promise(resolve => setTimeout(resolve, 500));

        if (typeof firebase !== 'undefined' && firebase.auth) {
            const user = firebase.auth().currentUser;
            if (user) {
                this.userId = user.uid;
                console.log('Using authenticated user ID:', this.userId);
            }
        } else if (window.auth && window.auth.currentUser) {
            this.userId = window.auth.currentUser.uid;
        }
    }

    /**
     * Setup global event listeners
     */
    setupGlobalListeners() {
        // Save settings button
        const saveSettingsBtn = document.getElementById('saveSettings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        }

        // Listen for schedule changes to save
        window.addEventListener('scheduleChanged', () => {
            this.saveSettings();
        });
    }

    /**
     * Load saved settings from server
     */
    async loadSavedSettings() {
        try {
            const response = await fetch(`/settings/${this.userId}`);

            if (!response.ok) {
                console.log('No saved settings found, using defaults');
                return;
            }

            const settings = await response.json();

            // Restore schedule settings
            if (settings.schedule && this.scheduleController) {
                this.scheduleController.setSchedule(settings.schedule);
            }

            console.log('Settings loaded successfully');
        } catch (error) {
            console.log('Could not load settings from server:', error.message);
        }
    }

    /**
     * Save all settings
     */
    async saveSettings() {
        try {
            const settings = {
                schedule: this.scheduleController.getSchedule(),
                lastSaved: new Date().toISOString()
            };

            const response = await fetch(`/settings/${this.userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            const result = await response.json();

            if (result.success) {
                console.log('Settings saved successfully');
                if (window.soundManager) {
                    window.soundManager.playSound('transition', 'success');
                }
            } else {
                console.warn('Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    /**
     * Get study space controller for external access
     */
    getStudySpaceController() {
        return this.studySpaceController;
    }

    /**
     * Get schedule controller for external access
     */
    getScheduleController() {
        return this.scheduleController;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firestore functions to be ready
    const initManager = () => {
        window.studySpacesManager = new StudySpacesManager();
        window.studySpacesManager.init();
    };

    // Check if Firestore functions are already available
    if (typeof window.loadStudySpacesFromFirestore === 'function') {
        initManager();
    } else {
        // Wait for the firestoreFunctionsReady event
        window.addEventListener('firestoreFunctionsReady', initManager, { once: true });

        // Fallback timeout in case event doesn't fire
        setTimeout(() => {
            if (!window.studySpacesManager) {
                console.log('Initializing StudySpacesManager without Firestore');
                initManager();
            }
        }, 2000);
    }
});

// Export for browser
if (typeof window !== 'undefined') {
    window.StudySpacesManager = StudySpacesManager;
}
