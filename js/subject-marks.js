// subject-marks.js - Handles tracking and calculation of subject marks based on weightages
import { syncSubjectToProjectWeightages, updateAndSyncPerformance } from './weightage-connector.js';
import { getStorage } from './services/StorageService.js';


/**
 * Subject mark categories
 */
const MARK_CATEGORIES = {
    ASSIGNMENT: 'assignment',
    QUIZ: 'quiz',
    MIDTERM: 'midterm', // Now represents both Midterm and OHT
    FINAL: 'final',
    REVISION: 'revision'
};

/**
 * Saves a new mark entry for a subject
 * @param {string} subjectTag - The tag of the subject
 * @param {string} category - The category of the mark (assignment, quiz, etc.)
 * @param {number} obtainedMarks - The marks obtained by the student
 * @param {number} totalMarks - The total marks possible
 * @param {string} title - Optional title for the entry (e.g., "Quiz 1")
 * @returns {boolean} - Success status
 */
export function addSubjectMark(subjectTag, category, obtainedMarks, totalMarks, title = '') {
    const storage = getStorage();
    if (!subjectTag || !category || isNaN(obtainedMarks) || isNaN(totalMarks) || totalMarks <= 0) {
        console.error('Invalid mark entry parameters');
        return false;
    }

    // Validate category
    if (!Object.values(MARK_CATEGORIES).includes(category.toLowerCase())) {
        console.error('Invalid mark category');
        return false;
    }

    // Get existing marks for this subject
    const allSubjectMarks = storage.get('subjectMarks', {});

    // Initialize subject if it doesn't exist
    if (!allSubjectMarks[subjectTag]) {
        allSubjectMarks[subjectTag] = {};
    }

    // Initialize category if it doesn't exist
    if (!allSubjectMarks[subjectTag][category]) {
        allSubjectMarks[subjectTag][category] = [];
    }

    // Add the new mark
    allSubjectMarks[subjectTag][category].push({
        obtained: Number(obtainedMarks),
        total: Number(totalMarks),
        title: title || `${category.charAt(0).toUpperCase() + category.slice(1)} ${allSubjectMarks[subjectTag][category].length + 1}`,
        date: new Date().toISOString()
    });

    // Save back to storage
    storage.set('subjectMarks', allSubjectMarks);

    // Update the academic performance for the subject
    updateSubjectPerformance(subjectTag);

    return true;
}

/**
 * Gets all marks for a subject
 * @param {string} subjectTag - The tag of the subject
 * @returns {Object} - The marks for the subject
 */
export function getSubjectMarks(subjectTag) {
    const storage = getStorage();
    const allSubjectMarks = storage.get('subjectMarks', {});
    return allSubjectMarks[subjectTag] || {};
}

/**
 * Calculates the weighted performance for a subject
 * @param {string} subjectTag - The tag of the subject
 * @returns {number} - The updated academic performance value (0-100)
 */
export function updateSubjectPerformance(subjectTag) {
    // Use the unified update and sync function
    return updateAndSyncPerformance(subjectTag);
}

/**
 * Sets the weightages for a specific subject
 * @param {string} subjectTag - The tag of the subject
 * @param {Object} categoryWeightages - Object containing weightages for each category
 * @returns {boolean} - Success status
 */
export function setSubjectWeightages(subjectTag, categoryWeightages) {
    if (!subjectTag) {
        console.error('Subject tag is required');
        return false;
    }

    // Validate weightages - they should sum to 100
    let totalWeight = 0;
    for (const category in categoryWeightages) {
        totalWeight += categoryWeightages[category];
    }

    if (Math.abs(totalWeight - 100) > 0.1) {
        console.error('Weightages must sum to 100%');
        return false;
    }

    // Get existing weightages
    const storage = getStorage();
    const allWeightages = storage.get('subjectWeightages', {});

    // Update weightages for this subject
    allWeightages[subjectTag] = categoryWeightages;

    // Save back to storage
    storage.set('subjectWeightages', allWeightages);

    // Sync with project weightages system
    syncSubjectToProjectWeightages(subjectTag, categoryWeightages);

    // Update the subject's performance with new weightages
    updateSubjectPerformance(subjectTag);

    return true;
}

/**
 * Gets the weightages for a specific subject
 * @param {string} subjectTag - The tag of the subject
 * @returns {Object} - The weightages for the subject
 */
export function getSubjectWeightages(subjectTag) {
    const storage = getStorage();
    const allWeightages = storage.get('subjectWeightages', {});

    // Return default weightages if none are set
    return allWeightages[subjectTag] || {
        assignment: 15,
        quiz: 10,
        midterm: 30,
        final: 40,
        revision: 5
    };
}

// NOTE: saveSubjectMarksToFirestore and loadSubjectMarksFromFirestore functions
// have been removed as they duplicated functionality from firestore.js.
// Use window.saveSubjectMarksToFirestore and window.loadSubjectMarksFromFirestore instead.

/**
 * Initializes weightages for all subjects at once
 * This ensures all subjects have their weightages loaded without manual interaction
 * @returns {Promise<boolean>} Success status
 */
export async function initializeAllSubjectWeightages() {
    const storage = getStorage();
    try {
        // Get all subjects
        const subjects = storage.get('academicSubjects', []);

        // Get project weightages
        const projectWeightages = storage.get('projectWeightages', {});

        // Try to load from Firestore
        const allWeightages = await window.loadSubjectWeightagesFromFirestore();
        let weightages = allWeightages || {};

        // Load subject marks to ensure we have performance data
        const marksData = await window.loadSubjectMarksFromFirestore();
        const marks = marksData || {};

        // Default weightages
        const defaultWeightages = {
            assignment: 15,
            quiz: 10,
            midterm: 30,
            final: 40,
            revision: 5
        };

        // Process each subject
        for (const subject of subjects) {
            const subjectTag = subject.tag;

            // Initialize marks structure if it doesn't exist
            if (!marks[subjectTag]) {
                marks[subjectTag] = {};
            }

            // Skip if weightages already exist
            if (weightages[subjectTag] && Object.keys(weightages[subjectTag]).length > 0) {
                // Even if weightages exist, ensure performance is calculated
                await updateSubjectPerformance(subjectTag);
                continue;
            }

            // Check for project weightages first
            let subjectWeightages;
            if (projectWeightages[subjectTag]) {
                // Map project sections to subject categories
                const sectionToCategory = {
                    'Assignment': 'assignment',
                    'Quizzes': 'quiz',
                    'Mid Term / OHT': 'midterm',
                    'Finals': 'final',
                    'Revision': 'revision'
                };

                // Create weightages from project data
                subjectWeightages = { ...defaultWeightages };
                for (const section in projectWeightages[subjectTag]) {
                    const category = sectionToCategory[section] || section.toLowerCase();
                    if (category in defaultWeightages) {
                        const weightData = projectWeightages[subjectTag][section];
                        if (weightData && typeof weightData.avg === 'number') {
                            subjectWeightages[category] = weightData.avg;
                        }
                    }
                }
            } else {
                // Use defaults
                subjectWeightages = { ...defaultWeightages };
            }

            // Update weightages
            weightages[subjectTag] = subjectWeightages;
        }

        // Save to storage and Firestore
        storage.set('subjectWeightages', weightages);
        storage.set('subjectMarks', marks);
        await window.saveSubjectWeightagesToFirestore(weightages);
        await window.saveSubjectMarksToFirestore(marks);

        // Update performance for all subjects
        for (const subject of subjects) {
            // Force performance calculation and sync
            const performance = await updateSubjectPerformance(subject.tag);

            // Ensure the performance is stored in marks data
            if (!marks[subject.tag]) {
                marks[subject.tag] = {};
            }
            marks[subject.tag]._manualPerformance = performance;

            // Update subject's academicPerformance
            subject.academicPerformance = performance;
        }

        // Save updated subjects and marks
        storage.set('academicSubjects', subjects);
        storage.set('subjectMarks', marks);

        return true;
    } catch (error) {
        console.error('Error initializing all subject weightages:', error);
        return false;
    }
} 
