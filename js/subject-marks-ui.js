/**
 * subject-marks-ui.js - Handles UI interactions for the subject marks page
 * 
 * This module provides:
 * - Proper XSS protection via sanitization
 * - Event delegation for dynamic content
 * - Promise-based initialization
 * - Memory-safe event listener management
 */

import sanitizer from './utils/Sanitizer.js';
import { getStorage } from '../services/StorageService.js';
import { getFirestore, doc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { computeObjectHash } from './utils/HashUtils.js';

// ============================================
// Constants
// ============================================
const FIRESTORE_RETRY_DELAY_MS = 1000;
const FIRESTORE_MAX_RETRIES = 3;

// Default weightages for categories
const DEFAULT_WEIGHTAGES = {
    assignment: 15,
    quiz: 10,
    midterm: 30,
    final: 40,
    revision: 5
};

// ============================================
// State Management Class
// ============================================
class SubjectMarksState {
    constructor() {
        this.currentSubjectTag = null;
        this.subjects = [];
        this.marks = {};
        this.weightages = {};
        this.marksHash = '0';
        this.weightagesHash = '0';
        this.authUnsubscribe = null;
        this.marksUnsubscribe = null;
        this.weightagesUnsubscribe = null;
        this.abortController = null;
    }

    reset() {
        this.currentSubjectTag = null;
        this.subjects = [];
        this.marks = {};
        this.weightages = {};
    }

    cleanup() {
        if (this.authUnsubscribe) {
            this.authUnsubscribe();
            this.authUnsubscribe = null;
        }
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
        if (this.marksUnsubscribe) {
            this.marksUnsubscribe();
            this.marksUnsubscribe = null;
        }
        if (this.weightagesUnsubscribe) {
            this.weightagesUnsubscribe();
            this.weightagesUnsubscribe = null;
        }
    }
}

// Create singleton state instance
const state = new SubjectMarksState();

// ============================================
// Sanitization Helper
// ============================================
function escapeHtml(text) {
    if (!text) return '';
    // Use Sanitizer if available, otherwise fallback
    if (sanitizer && typeof sanitizer.attr === 'function') {
        return sanitizer.attr(String(text));
    }
    // Fallback sanitization
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// Auth Initialization
// ============================================

/**
 * Wait for Firebase auth to be ready using Promise pattern
 * @returns {Promise<Object|null>} User object or null
 */
/**
 * Wait for Firebase auth to be ready using Promise pattern
 * @returns {Promise<Object|null>} User object or null
 */
function waitForAuth() {
    return new Promise((resolve) => {
        if (window.auth && window.auth.currentUser) {
            resolve(window.auth.currentUser);
            return;
        }

        if (!window.auth) {
            // Wait a tiny bit for auth to init
            setTimeout(() => {
                if (window.auth) {
                    const unsub = window.auth.onAuthStateChanged(user => {
                        unsub();
                        resolve(user);
                    });
                } else {
                    resolve(null);
                }
            }, 500);
            return;
        }

        const unsub = window.auth.onAuthStateChanged(user => {
            unsub();
            resolve(user);
        });
    });
}

/**
 * Wait for Firestore functions to be available/imported
 * @returns {Promise<boolean>}
 */
async function ensureFirestoreFunctions() {
    // Basic checks if we need specific utils, but we are using direct SDK mostly now.
    // Keeping for compatibility with other modules if they rely on globals.
    if (window.loadSubjectsFromFirestore) {
        return true;
    }

    try {
        const firestore = await import('./firestore.js');
        window.loadSubjectsFromFirestore = firestore.loadSubjectsFromFirestore;
        window.loadSubjectMarksFromFirestore = firestore.loadSubjectMarksFromFirestore;
        window.loadSubjectWeightagesFromFirestore = firestore.loadSubjectWeightagesFromFirestore;
        window.saveSubjectMarksToFirestore = firestore.saveSubjectMarksToFirestore;
        window.saveSubjectWeightagesToFirestore = firestore.saveSubjectWeightagesToFirestore;
        return true;
    } catch (e) {
        console.warn('Could not load firestore utils, will use direct SDK', e);
        return false;
    }
}

// ============================================
// Initialization
// ============================================

/**
 * Initialize the UI when the DOM is loaded
 */
async function init() {
    try {
        // Wait for auth
        await waitForAuth();

        // Ensure Firestore is ready
        await ensureFirestoreFunctions();

        // Load initial data
        await loadSubjects();

        // Set up event delegation
        setupEventDelegation();

        // Set up auth state listener
        setupAuthStateListener();

        // If there's a subject selected, load it
        const selector = document.getElementById('subjectSelector');
        if (selector && selector.value) {
            await handleSubjectChange();
        }

        console.log('[SubjectMarks] Initialization complete');
    } catch (error) {
        console.error('[SubjectMarks] Initialization error:', error);
    }
}

/**
 * Set up event delegation for all interactive elements
 */
function setupEventDelegation() {
    // Create abort controller for cleanup
    state.abortController = new AbortController();
    const { signal } = state.abortController;

    // Subject List Click Delegation (New)
    document.getElementById('subjectsList')?.addEventListener('click', (e) => {
        const card = e.target.closest('.subject-card');
        if (card && card.dataset.tag) {
            handleSubjectSelect(card.dataset.tag);
        }
    }, { signal });

    // Save weightages button
    document.getElementById('saveWeightagesBtn')?.addEventListener('click', saveWeightages, { signal });

    // Add mark button
    document.getElementById('addMarkBtn')?.addEventListener('click', addMark, { signal });

    // Weightage inputs
    document.querySelectorAll('.weightage-input').forEach(input => {
        input.addEventListener('input', updateTotalWeightage, { signal });
    });

    // Theme toggle button (replaces inline onclick)
    document.getElementById('themeToggleBtn')?.addEventListener('click', toggleTheme, { signal });
    document.getElementById('themeToggleBtn')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTheme();
        }
    }, { signal });

    // Event delegation for existing marks container (handles delete buttons)
    document.getElementById('existingMarks')?.addEventListener('click', handleExistingMarksClick, { signal });
}

/**
 * Handle clicks within the existing marks container using event delegation
 * @param {Event} event 
 */
async function handleExistingMarksClick(event) {
    const target = event.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    const category = target.dataset.category;
    const index = parseInt(target.dataset.index, 10);

    switch (action) {
        case 'delete-mark':
            await deleteMark(category, index);
            break;
        case 'delete-all-marks':
            await deleteAllMarks();
            break;
    }
}

/**
 * Set up auth state change listener
 */
function setupAuthStateListener() {
    if (!window.auth) return;

    // Store unsubscribe function for cleanup
    state.authUnsubscribe = window.auth.onAuthStateChanged(async (user) => {
        if (user) {
            console.log('[SubjectMarks] User signed in, reloading data');
            // Do not aggressively clear storage here, let loadSubjects handle updates
            // const storage = getStorage();
            // storage.remove('academicSubjects');
            // storage.remove('subjectMarks');
            // storage.remove('subjectWeightages');

            await loadSubjects();
            if (state.currentSubjectTag) {
                await handleSubjectChange();
            }
        } else {
            console.log('[SubjectMarks] User signed out');
            clearUI();
        }
    });
}

/**
 * Clear UI elements when user signs out
 */
function clearUI() {
    // Hide details, show placeholder
    document.getElementById('activeContent')?.classList.add('d-none');
    document.getElementById('emptyState')?.classList.remove('d-none');

    // Clear Active Card Styling
    document.querySelectorAll('.subject-card').forEach(c => c.classList.remove('active'));

    state.reset();
}

// ============================================
// Theme Management
// ============================================

/**
 * Toggle theme between light and dark
 */
function toggleTheme() {
    const storage = getStorage();
    const body = document.body;
    const themeIcon = document.querySelector('.theme-icon');
    const themeText = document.querySelector('.theme-text');

    body.classList.toggle('light-theme');

    if (body.classList.contains('light-theme')) {
        if (themeIcon) themeIcon.className = 'theme-icon bi bi-moon-fill';
        if (themeText) themeText.textContent = 'Dark Mode';
        storage.set('theme', 'light');
    } else {
        if (themeIcon) themeIcon.className = 'theme-icon bi bi-sun-fill';
        if (themeText) themeText.textContent = 'Light Mode';
        storage.set('theme', 'dark');
    }
}

/**
 * Initialize theme from saved preference
 */
function initTheme() {
    const storage = getStorage();
    if (storage.get('theme', null) === 'light') {
        document.body.classList.add('light-theme');
        const themeIcon = document.querySelector('.theme-icon');
        const themeText = document.querySelector('.theme-text');
        if (themeIcon) themeIcon.className = 'theme-icon bi bi-moon-fill';
        if (themeText) themeText.textContent = 'Dark Mode';
    }
}

// ============================================
// Subject Loading
// ============================================

/**
 * Load subjects from Firestore or localStorage
 * @returns {Promise<Array>}
 */
async function loadSubjects() {
    const storage = getStorage();

    try {
        if (!window.auth?.currentUser) {
            console.log('[SubjectMarks] User not signed in');
            return [];
        }

        let loadedSubjects = null;
        let retries = FIRESTORE_MAX_RETRIES;

        while (retries > 0 && !loadedSubjects) {
            try {
                loadedSubjects = await window.loadSubjectsFromFirestore();
                if (loadedSubjects && loadedSubjects.length > 0) {
                    storage.set('academicSubjects', loadedSubjects);
                    break;
                }
            } catch (error) {
                console.warn(`[SubjectMarks] Firestore load failed, ${retries - 1} retries left`);
                retries--;
                if (retries === 0) throw error;
                await new Promise(resolve => setTimeout(resolve, FIRESTORE_RETRY_DELAY_MS));
            }
        }

        if (!loadedSubjects || loadedSubjects.length === 0) {
            console.warn('[SubjectMarks] Falling back to SemesterService/storage');
            if (window.SemesterService && window.SemesterService.initialized) {
                loadedSubjects = window.SemesterService.getCurrentSubjects();
            } else {
                loadedSubjects = storage.get('academicSubjects', []);
            }
        }

        state.subjects = loadedSubjects;
        updateSubjectSelector();

        return state.subjects;
    } catch (error) {
        console.error('[SubjectMarks] Error loading subjects:', error);
        return [];
    }
}

/**
 * Update the subject selector dropdown
 */
/**
 * Render the list of subject cards in the sidebar
 */
function renderSubjectList() {
    const container = document.getElementById('subjectsList');
    if (!container) return;

    if (state.subjects.length === 0) {
        container.innerHTML = '<div class="text-center p-3 text-muted">No subjects found.</div>';
        return;
    }

    container.innerHTML = '';
    state.subjects.forEach((subject, idx) => {
        const isActive = subject.tag === state.currentSubjectTag;
        const perfo = Math.round(Number(subject.academicPerformance) || 0);

        const card = document.createElement('button');
        card.className = `subject-card ${isActive ? 'active' : ''}`;
        card.dataset.tag = subject.tag;
        card.innerHTML = `
            <span class="subject-name">${escapeHtml(subject.name)} ${subject.creditHours} CH</span>
            <span class="subject-stats">View Details ${perfo}%</span>
        `;
        container.appendChild(card);
    });
}
// Alias for compatibility if called elsewhere
const updateSubjectSelector = renderSubjectList;
window.updateSubjectsList = renderSubjectList;

// ============================================
// Subject Change Handler
// ============================================

/**
 * Handle subject change in the selector
 */
/**
 * Handle subject selection from sidebar
 * @param {string} subjectTag 
 */
async function handleSubjectSelect(subjectTag) {
    if (!subjectTag) return;

    state.currentSubjectTag = subjectTag;

    // Update UI State
    document.getElementById('emptyState')?.classList.add('d-none');
    document.getElementById('activeContent')?.classList.remove('d-none');

    // Highlight active card
    document.querySelectorAll('.subject-card').forEach(c => {
        if (c.dataset.tag === subjectTag) c.classList.add('active');
        else c.classList.remove('active');
    });

    const subject = state.subjects.find(s => s.tag === subjectTag);
    if (!subject) return;

    // Load data
    setupWeightagesListener();
    setupMarksListener();

    // Recalculate performance
    const recalculatedPerformance = await window.updateSubjectPerformance?.(subjectTag) || 0;

    // Update Performance UI
    const subjectNameEl = document.getElementById('subjectName');
    const creditHoursEl = document.getElementById('creditHours');
    const performanceEl = document.getElementById('academicPerformance');
    const performanceTextEl = document.getElementById('performanceText');
    const performanceBar = document.getElementById('performanceBar');

    if (subjectNameEl) subjectNameEl.textContent = subject.name;
    if (creditHoursEl) creditHoursEl.textContent = subject.creditHours;
    if (performanceEl) performanceEl.textContent = recalculatedPerformance;
    if (performanceTextEl) performanceTextEl.textContent = recalculatedPerformance + '%';
    if (performanceBar) {
        performanceBar.style.width = `${recalculatedPerformance}%`;
        performanceBar.setAttribute('aria-valuenow', recalculatedPerformance);
    }

    // Refresh list to update mini-bars (optional optimization: update specific card)
    // renderSubjectList(); // Skipping partial re-render to avoid flicker for now

    // Update sub-components
    displayCategoryContributions(subjectTag);
    displayExistingMarks(subjectTag);
}

// Redirect old handler to new one for backward compat
const handleSubjectChange = () => {
    // This function originally pulled from the selector value.
    // We can ignore it or map it if needed, but UI is driver now.
    if (state.currentSubjectTag) handleSubjectSelect(state.currentSubjectTag);
};

// ============================================
// Weightages Management
// ============================================

/**
 * Sets up real-time listener for weightages
 */
function setupWeightagesListener() {
    if (state.weightagesUnsubscribe) {
        state.weightagesUnsubscribe();
        state.weightagesUnsubscribe = null;
    }

    const storage = getStorage();
    // Load local first
    state.weightages = storage.get('projectWeightages', {});

    // Also try to get subject weightages from local
    const localSubWeightages = storage.get('subjectWeightages', {});
    state.weightages = { ...state.weightages, ...localSubWeightages };

    if (!state.currentSubjectTag) return;

    // Load UI from local state first
    updateWeightagesUI();

    if (!window.auth || !window.auth.currentUser) return;

    try {
        const user = window.auth.currentUser;
        const db = getFirestore();
        const weightagesRef = doc(db, 'users', user.uid, 'academic', 'weightages');

        state.weightagesUnsubscribe = onSnapshot(weightagesRef, (docSnap) => {
            if (docSnap.exists()) {
                const weightagesData = docSnap.data().subjectWeightages || {};

                // Optimization: Hash Check
                const newHash = computeObjectHash(weightagesData);

                if (newHash === state.weightagesHash) {
                    return; // No change
                }

                console.log('[SubjectMarks] Real-time weightages update (Content Changed)');
                state.weightages = { ...state.weightages, ...weightagesData };
                state.weightagesHash = newHash;
                storage.set('subjectWeightages', state.weightages);

                if (state.currentSubjectTag) {
                    updateWeightagesUI();
                    displayCategoryContributions(state.currentSubjectTag);
                }
            }
        });

    } catch (error) {
        console.error('Error setting up weightages listener', error);
    }
}

function updateWeightagesUI() {
    if (!state.currentSubjectTag) return;

    // Logic to merge project vs subject weightages
    const subjectTag = state.currentSubjectTag;
    let subjectWeightages = { ...DEFAULT_WEIGHTAGES };

    // We prioritize specific subject weightages if they exist in our merged state
    if (state.weightages[subjectTag]) {
        subjectWeightages = { ...DEFAULT_WEIGHTAGES, ...state.weightages[subjectTag] };

        // If it's old format (project based), convert
        // (Simulating the logic from previous loadWeightages)
        const projectWeightages = getStorage().get('projectWeightages', {});
        if (projectWeightages[subjectTag]) {
            // ... conversion logic if needed, but if we are moving to proper subjectWeightages, we rely on that
        }
    }

    document.getElementById('assignmentWeightage').value = subjectWeightages.assignment;
    document.getElementById('quizWeightage').value = subjectWeightages.quiz;
    document.getElementById('midtermWeightage').value = subjectWeightages.midterm;
    document.getElementById('finalWeightage').value = subjectWeightages.final;
    document.getElementById('revisionWeightage').value = subjectWeightages.revision;

    updateTotalWeightage();
}

/**
 * Sets up real-time listener for marks
 */
function setupMarksListener() {
    if (state.marksUnsubscribe) {
        state.marksUnsubscribe();
        state.marksUnsubscribe = null;
    }

    const storage = getStorage();
    // Load local first for instant render
    state.marks = storage.get('subjectMarks', {});

    if (!window.auth || !window.auth.currentUser) {
        console.log('[SubjectMarks] No auth, using local marks only');
        return;
    }

    try {
        const user = window.auth.currentUser;
        const db = getFirestore();
        const marksRef = doc(db, 'users', user.uid, 'academic', 'marks');

        state.marksUnsubscribe = onSnapshot(marksRef, (docSnap) => {
            if (docSnap.exists()) {
                const marksData = docSnap.data().marks || {};

                // Optimization: Hash Check
                const newHash = computeObjectHash(marksData);
                if (newHash === state.marksHash) {
                    console.log('[SubjectMarks] Marks data identical (Hash matched), skipping update');
                    return;
                }

                console.log('[SubjectMarks] Real-time marks update received (Content Changed)');
                state.marks = marksData;
                state.marksHash = newHash;
                storage.set('subjectMarks', marksData);

                // Refresh UI if needed
                if (state.currentSubjectTag) {
                    displayCategoryContributions(state.currentSubjectTag);
                    displayExistingMarks(state.currentSubjectTag);
                    // Note: We might want to recalc performance here too
                    if (window.updateSubjectPerformance) {
                        window.updateSubjectPerformance(state.currentSubjectTag).then(perf => {
                            const performanceEl = document.getElementById('academicPerformance');
                            const performanceBar = document.getElementById('performanceBar');
                            if (performanceEl) performanceEl.textContent = perf;
                            if (performanceBar) performanceBar.style.width = `${perf}%`;
                        });
                    }
                }
            }
        });
    } catch (error) {
        console.error('[SubjectMarks] Error setting up marks listener:', error);
    }
}

/**
 * Update the total weightage display and validation
 */
function updateTotalWeightage() {
    const assignment = Number(document.getElementById('assignmentWeightage')?.value) || 0;
    const quiz = Number(document.getElementById('quizWeightage')?.value) || 0;
    const midterm = Number(document.getElementById('midtermWeightage')?.value) || 0;
    const final = Number(document.getElementById('finalWeightage')?.value) || 0;
    const revision = Number(document.getElementById('revisionWeightage')?.value) || 0;

    const total = assignment + quiz + midterm + final + revision;
    const totalEl = document.getElementById('totalWeightage');
    const saveBtn = document.getElementById('saveWeightagesBtn');

    if (totalEl) {
        totalEl.textContent = total.toFixed(1);

        if (Math.abs(total - 100) < 0.1) {
            totalEl.classList.remove('text-danger');
            totalEl.classList.add('text-success');
            if (saveBtn) saveBtn.disabled = false;
        } else {
            totalEl.classList.remove('text-success');
            totalEl.classList.add('text-danger');
            if (saveBtn) saveBtn.disabled = true;
        }
    }
}

/**
 * Save weightages for the current subject
 */
async function saveWeightages() {
    if (!state.currentSubjectTag) return;

    const assignment = Number(document.getElementById('assignmentWeightage')?.value) || 0;
    const quiz = Number(document.getElementById('quizWeightage')?.value) || 0;
    const midterm = Number(document.getElementById('midtermWeightage')?.value) || 0;
    const final = Number(document.getElementById('finalWeightage')?.value) || 0;
    const revision = Number(document.getElementById('revisionWeightage')?.value) || 0;

    const total = assignment + quiz + midterm + final + revision;

    if (Math.abs(total - 100) >= 0.1) {
        showNotification('The total weightage must be 100%', 'error');
        return;
    }

    const newWeightages = { assignment, quiz, midterm, final, revision };

    try {
        // Step 1: Update local state FIRST to maintain single source of truth
        state.weightages[state.currentSubjectTag] = newWeightages;

        // Step 2: Save to localStorage via setSubjectWeightages
        // Note: setSubjectWeightages also syncs to projectWeightages AND updates performance
        let newPerformance = 0;
        if (window.setSubjectWeightages) {
            window.setSubjectWeightages(state.currentSubjectTag, newWeightages);
            // Get the performance that was calculated inside setSubjectWeightages
            newPerformance = await window.updateSubjectPerformance?.(state.currentSubjectTag) || 0;
        } else {
            // Fallback: direct storage save
            const storage = getStorage();
            storage.set('subjectWeightages', state.weightages);
            newPerformance = await window.updateSubjectPerformance?.(state.currentSubjectTag) || 0;
        }

        // Step 3: Sync to Firestore (single call, using updated state)
        await window.saveSubjectWeightagesToFirestore?.(state.weightages);

        // Step 4: Update Performance UI components
        const performanceEl = document.getElementById('academicPerformance');
        const performanceBar = document.getElementById('performanceBar');
        if (performanceEl) performanceEl.textContent = newPerformance;
        if (performanceBar) {
            performanceBar.style.width = `${newPerformance}%`;
            performanceBar.setAttribute('aria-valuenow', newPerformance);
        }

        // Re-render sidebar to show updated mini-bar
        renderSubjectList();

        showNotification('Weightages saved successfully!', 'success');
    } catch (error) {
        console.error('[SubjectMarks] Error saving weightages:', error);
        showNotification('Error saving weightages. Please try again.', 'error');
    }
}

// ============================================
// Marks Management
// ============================================

/**
 * Add a mark for the current subject
 */
async function addMark() {
    if (!state.currentSubjectTag) return;

    const category = document.getElementById('markCategory')?.value;
    const title = document.getElementById('markTitle')?.value.trim();
    const obtainedMarks = Number(document.getElementById('obtainedMarks')?.value);
    const totalMarks = Number(document.getElementById('totalMarks')?.value);

    // Validation
    if (isNaN(obtainedMarks) || isNaN(totalMarks) || totalMarks <= 0) {
        showNotification('Please enter valid marks', 'error');
        return;
    }

    if (obtainedMarks > totalMarks) {
        showNotification('Obtained marks cannot be greater than total marks', 'error');
        return;
    }

    const success = window.addSubjectMark?.(state.currentSubjectTag, category, obtainedMarks, totalMarks, title);

    if (success) {
        const storage = getStorage();
        const updatedMarks = storage.get('subjectMarks', {});

        try {
            await window.saveSubjectMarksToFirestore?.(updatedMarks);

            // Reset form
            document.getElementById('markTitle').value = '';
            document.getElementById('obtainedMarks').value = '';
            document.getElementById('totalMarks').value = '';

            // Update UI with new performance
            const newPerformance = await window.updateSubjectPerformance?.(state.currentSubjectTag);

            // Update Performance UI components directly
            const performanceEl = document.getElementById('academicPerformance');
            const performanceBar = document.getElementById('performanceBar');
            if (performanceEl) performanceEl.textContent = newPerformance;
            if (performanceBar) {
                performanceBar.style.width = `${newPerformance}%`;
                performanceBar.setAttribute('aria-valuenow', newPerformance);
            }

            // Re-render sidebar to update mini-progress (optimized)
            renderSubjectList();

            showNotification('Mark added successfully!', 'success');
        } catch (error) {
            console.error('[SubjectMarks] Error saving mark:', error);
            showNotification('Mark saved locally, but could not be saved to the cloud.', 'warning');
        }
    } else {
        showNotification('Error adding mark. Please check your inputs.', 'error');
    }
}

/**
 * Delete a single mark
 * @param {string} category 
 * @param {number} index 
 */
async function deleteMark(category, index) {
    if (!confirm('Are you sure you want to delete this mark?')) return;

    try {
        if (!state.marks[state.currentSubjectTag]?.[category]) return;

        state.marks[state.currentSubjectTag][category].splice(index, 1);

        const storage = getStorage();
        storage.set('subjectMarks', state.marks);

        await window.saveSubjectMarksToFirestore?.(state.marks);
        await window.updateSubjectPerformance?.(state.currentSubjectTag);
        await loadMarks(state.currentSubjectTag);
        await handleSubjectChange();

        showNotification('Mark deleted successfully!', 'success');
    } catch (error) {
        console.error('[SubjectMarks] Error deleting mark:', error);
        showNotification('Error deleting mark. Please try again.', 'error');
        await loadMarks(state.currentSubjectTag);
        await handleSubjectChange();
    }
}

/**
 * Delete all marks for the current subject
 */
async function deleteAllMarks() {
    if (!confirm('Are you sure you want to delete ALL marks for this subject? This action cannot be undone.')) return;

    try {
        state.marks[state.currentSubjectTag] = {
            assignment: [],
            quiz: [],
            midterm: [],
            final: [],
            revision: []
        };

        const storage = getStorage();
        storage.set('subjectMarks', state.marks);

        await window.saveSubjectMarksToFirestore?.(state.marks);
        await window.updateSubjectPerformance?.(state.currentSubjectTag);
        await loadMarks(state.currentSubjectTag);
        await handleSubjectChange();

        showNotification('All marks deleted successfully!', 'success');
    } catch (error) {
        console.error('[SubjectMarks] Error deleting marks:', error);
        showNotification('Error deleting marks. Please try again.', 'error');
        await loadMarks(state.currentSubjectTag);
        await handleSubjectChange();
    }
}

// ============================================
// Display Functions
// ============================================

/**
 * Display category contributions for a subject
 * @param {string} subjectTag 
 */
function displayCategoryContributions(subjectTag) {
    const subject = state.subjects.find(s => s.tag === subjectTag);
    if (!subject) return;

    const subjectMarks = state.marks[subjectTag] || {};
    const subjectWeightages = state.weightages[subjectTag] || DEFAULT_WEIGHTAGES;

    const container = document.getElementById('categoryContributions');
    if (!container) return;

    container.innerHTML = '';

    for (const [category, weight] of Object.entries(subjectWeightages)) {
        const categoryMarks = subjectMarks[category] || [];
        const hasCategoryMarks = categoryMarks.length > 0;

        let performance = 0;
        if (hasCategoryMarks) {
            let totalObtained = 0;
            let totalPossible = 0;

            categoryMarks.forEach(mark => {
                totalObtained += mark.obtained;
                totalPossible += mark.total;
            });

            performance = (totalObtained / totalPossible) * 100;
        }

        const div = document.createElement('div');
        div.className = 'mb-3';

        const categoryName = escapeHtml(category.charAt(0).toUpperCase() + category.slice(1));

        div.innerHTML = `
            <div class="d-flex justify-content-between">
                <span>${categoryName} (${weight}%)</span>
                <span>${hasCategoryMarks ? performance.toFixed(1) + '%' : 'No marks'}</span>
            </div>
            <div class="progress" role="progressbar" aria-label="${categoryName} performance">
                <div class="progress-bar ${hasCategoryMarks ? '' : 'bg-secondary'}"
                     style="width: ${hasCategoryMarks ? performance + '%' : '100%'}"
                     aria-valuenow="${hasCategoryMarks ? performance : 0}"
                     aria-valuemin="0"
                     aria-valuemax="100"></div>
            </div>
        `;

        container.appendChild(div);
    }
}

/**
 * Display existing marks for a subject
 * @param {string} subjectTag 
 */
function displayExistingMarks(subjectTag) {
    const container = document.getElementById('existingMarks');
    if (!container) return;

    container.classList.remove('d-none');

    const subjectMarks = state.marks[subjectTag] || {};
    let hasAnyMarks = false;

    // Build HTML with legacy table structure
    let html = `
        <table class="subjects-table-legacy">
            <thead>
                <tr>
                    <th style="width: 30%;">CATEGORY</th>
                    <th style="width: 30%;">TITLE</th>
                    <th style="width: 25%;">SCORE</th>
                    <th style="width: 15%;"></th>
                </tr>
            </thead>
            <tbody>
    `;

    for (const [category, marksList] of Object.entries(subjectMarks)) {
        if (category === '_manualPerformance') continue;

        if (Array.isArray(marksList) && marksList.length > 0) {
            hasAnyMarks = true;
            const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

            marksList.forEach((mark, index) => {
                html += `
                    <tr>
                        <td style="font-size: 12px; color: #888;">${escapeHtml(categoryName)}</td>
                        <td style="font-weight: 600;">${escapeHtml(mark.title || categoryName)}</td>
                        <td style="font-weight: 700; color: #00ff88;">${mark.obtained} / ${mark.total}</td>
                        <td style="text-align: right;">
                            <button type="button" 
                                    data-action="delete-mark"
                                    data-category="${escapeHtml(category)}"
                                    data-index="${index}"
                                    style="background: none; border: none; color: #ff4b5c; cursor: pointer; font-size: 14px;">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
    }

    if (!hasAnyMarks) {
        html += '<tr><td colspan="4" style="text-align: center; color: #666; padding: 20px;">No marks recorded yet.</td></tr>';
    }

    html += `
            </tbody>
        </table>
        ${hasAnyMarks ? `
            <div style="margin-top: 20px; text-align: right;">
                <button class="btn-legacy-action" data-action="delete-all-marks" style="color: #ff4b5c; border-color: rgba(255,75,92,0.3); margin-left: auto;">
                    <i class="bi bi-trash"></i> Clear All History
                </button>
            </div>
        ` : ''}
    `;

    container.innerHTML = html;
}

// ============================================
// Notification System
// ============================================

/**
 * Show a notification to the user
 * @param {string} message 
 * @param {string} type - 'success', 'error', 'warning', 'info'
 */
function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.toast-notification').forEach(n => n.remove());

    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    toast.textContent = message;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// Cleanup
// ============================================

/**
 * Cleanup function for SPA navigation
 */
function cleanup() {
    state.cleanup();
}

// ============================================
// Initialization on DOM Ready
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    init();

    // Make toggleTheme available globally for backwards compatibility
    window.toggleTheme = toggleTheme;
});

// ============================================
// Exports
// ============================================

export {
    toggleTheme,
    loadSubjects,
    handleSubjectChange,
    saveWeightages,
    addMark,
    cleanup,
    showNotification
};
