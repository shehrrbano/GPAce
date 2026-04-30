import { storageService, STORAGE_KEYS } from './services/StorageService.js';

// Helper function to get subjects from storage
function getSubjectsFromStorage() {
    return storageService.get(STORAGE_KEYS.LEGACY_SUBJECTS, []);
}

// Theme Toggle Function
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.querySelector('.theme-icon');
    const themeText = document.querySelector('.theme-text');

    body.classList.toggle('light-theme');

    if (body.classList.contains('light-theme')) {
        themeIcon.textContent = '🌚';
        themeText.textContent = 'Dark Mode';
        storageService.set(STORAGE_KEYS.THEME, 'light');
    } else {
        themeIcon.textContent = '🌞';
        themeText.textContent = 'Light Mode';
        storageService.set(STORAGE_KEYS.THEME, 'dark');
    }
}

// Initialize theme on page load
function initializeTheme() {
    const themeIcon = document.querySelector('.theme-icon');
    const themeText = document.querySelector('.theme-text');

    if (storageService.get(STORAGE_KEYS.THEME) === 'light') {
        document.body.classList.add('light-theme');
        themeIcon.textContent = '🌚';
        themeText.textContent = 'Dark Mode';
    }
}



function ensureWeightagesSynced() {
    // Get all subjects
    const subjects = getSubjectsFromStorage();

    // Get both weightage storages
    const subjectWeightages = storageService.get('subjectWeightages', '{}');
    const projectWeightages = storageService.get('projectWeightages', '{}');

    let updated = false;

    // Check each subject
    subjects.forEach(subject => {
        const projectId = subject.tag;

        // If subject exists in project weightages but not in subject weightages
        if (projectWeightages[projectId] && !subjectWeightages[projectId]) {
            if (typeof window.syncProjectToSubjectWeightages === 'function') {
                window.syncProjectToSubjectWeightages(projectId, projectWeightages[projectId]);
                updated = true;
            }
        }
    });

    return updated;
}





// Toggle Subject Statistics Visibility
function toggleStats(subjectId) {
    // Find the stats container for the specific subject
    const stats = document.getElementById(`stats-${subjectId}`);

    // Find the toggle button for the specific subject
    const button = document.getElementById(`toggle-${subjectId}`);

    // Check if elements exist to prevent potential errors
    if (!stats || !button) {
        console.error(`Elements not found for subject: ${subjectId}`);
        return;
    }

    // Toggle visibility using 'show' class
    if (stats.classList.contains('show')) {
        stats.classList.remove('show');
        // Change button icon to down chevron
        button.innerHTML = '<i class="bi bi-chevron-down"></i>';
    } else {
        stats.classList.add('show');
        // Change button icon to up chevron
        button.innerHTML = '<i class="bi bi-chevron-up"></i>';
    }
}

// Calculate Credit Hours Points for a Project
function calculateCreditHoursPoints(projectId) {
    // Retrieve academic subjects from localStorage
    const subjects = getSubjectsFromStorage();

    // Find the specific subject by its tag/projectId
    const subject = subjects.find(s => s.tag === projectId);

    // If no subject found, return 0
    if (!subject) return 0;

    // Return the relative score (already calculated as a percentage 0-100)
    // Ensure it's a number and within valid range
    return Number(subject.relativeScore) || 0;
}

// Calculate Cognitive Difficulty Points for a Project
function calculateCognitiveDifficulty(projectId) {
    // Retrieve academic subjects from localStorage
    const subjects = getSubjectsFromStorage();

    // Find the specific subject by its tag/projectId
    const subject = subjects.find(s => s.tag === projectId);

    // If no subject found, return 0
    if (!subject) return 0;

    // Return the cognitive difficulty (already on a scale of 1-100)
    // Ensure it's a number and within valid range
    return Number(subject.cognitiveDifficulty) || 0;
}

function calculateTaskWeightage(projectId, taskSection) {
    // Get subject weightages directly
    const subjectWeightages = storageService.get('subjectWeightages', '{}');

    // Also get project weightages as a fallback
    const projectWeightages = storageService.get('projectWeightages', '{}');

    // Get weightages for specific subject
    let subjectWeightage = subjectWeightages[projectId] || {};

    // Map section names to category names (case insensitive)
    const sectionToCategory = {
        'assignment': 'assignment',
        'assignments': 'assignment',
        'quizzes': 'quiz',
        'quiz': 'quiz',
        'mid term / oht': 'midterm',
        'midterm': 'midterm',
        'finals': 'final',
        'final': 'final',
        'revision': 'revision'
    };

    // Default weightages to use if nothing else is found
    const defaultCategoryWeightages = {
        assignment: 15,
        quiz: 10,
        midterm: 30,
        final: 40,
        revision: 5
    };

    // Normalize section name to lowercase for case-insensitive matching
    const normalizedSection = taskSection.toLowerCase();

    // Get the category name for this section
    const category = sectionToCategory[normalizedSection] || normalizedSection;

    // If subject weightage doesn't exist, try to get from project weightages
    if (Object.keys(subjectWeightage).length === 0 && projectWeightages[projectId]) {
        // Try to map from project weightages
        const projectSection = Object.keys(projectWeightages[projectId])
            .find(section => section.toLowerCase() === normalizedSection);

        if (projectSection && projectWeightages[projectId][projectSection]) {
            return projectWeightages[projectId][projectSection].avg || defaultCategoryWeightages[category] || 0;
        }
    }

    // Return exact weightage from subject marks or default if not found
    return subjectWeightage[category] || defaultCategoryWeightages[category] || 0;
}















// Get Active Tasks for a Specific Project
// Phase 2: Uses TaskRepository as primary source
function getActiveTasks(projectId) {
    // Phase 2: Use TaskRepository if available
    if (window.TaskRepository) {
        const tasks = window.TaskRepository.getAllTasks(projectId);
        console.log(`[getActiveTasks] ProjectID: ${projectId} - via TaskRepository`, {
            activeTasks: tasks.length
        });
        return tasks;
    }

    // Fallback: Try namespaced key first (new format used by StorageService)
    let subjectTasks = storageService.get(`gpace_tasks-${projectId}`, 'null');

    // If null or empty, try legacy non-namespaced key
    if (!subjectTasks || subjectTasks.length === 0) {
        subjectTasks = storageService.get(`tasks-${projectId}`, '[]');

        // If found in legacy location, migrate to namespaced key for consistency
        if (subjectTasks.length > 0) {
            console.log(`[getActiveTasks] Migrating ${subjectTasks.length} tasks from legacy key to namespaced key for ${projectId}`);
            storageService.set(`gpace_tasks-${projectId}`, subjectTasks);
        }
    }

    // Filter out completed tasks - only return active (non-completed) tasks
    const activeTasks = subjectTasks.filter(task => !task.completed && !task.deleted);

    // Log task retrieval for debugging
    console.log(`[getActiveTasks] ProjectID: ${projectId}`, {
        totalTasks: subjectTasks.length,
        activeTasks: activeTasks.length,
        completedFiltered: subjectTasks.length - activeTasks.length
    });

    // Return only active (non-completed) tasks
    return activeTasks;
}

// Delete a Specific Task from a Project
function deleteTask(projectId, taskId) {
    // Phase 2: Use TaskRepository if available
    if (window.TaskRepository) {
        window.TaskRepository.deleteTask(projectId, taskId);
        console.log(`[deleteTask] Deleted via TaskRepository: ${taskId}`);
    } else {
        // Fallback: Get tasks for this project
        const tasks = storageService.get(`tasks-${projectId}`, '[]');

        // Remove the task
        const updatedTasks = tasks.filter(task => String(task.id) !== String(taskId));

        // Save back to storage
        storageService.set(`tasks-${projectId}`, updatedTasks);
    }

    // Update the display
    updatePriorityScores();
}

// Get Academic Performance for a Specific Project
function getAcademicPerformance(projectId) {
    // Get subject marks from localStorage
    const subjectMarks = storageService.get('subjectMarks', '{}');

    // Get the subject's marks
    const subjectData = subjectMarks[projectId];

    if (!subjectData) return 0;

    // Get the performance value that was calculated and shown in the progress bar
    // This is stored when updateSubjectPerformance is called in subject-marks.html
    const performance = subjectData._performance || 0;

    // Return the performance value directly
    return performance;
}

// Function to calculate time remaining and convert to priority points
function calculateTimeRemainingPoints(dueDate) {
    // Validate input
    if (!dueDate) {
        console.debug('No due date provided, returning 0 points');
        return 0; // Lowest possible priority boost
    }

    // Get current time
    const currentTime = new Date();

    // Parse the due date, handling different formats
    let deadline;
    try {
        // Try parsing as ISO string first
        deadline = new Date(dueDate);

        // If invalid, try converting from input date format (YYYY-MM-DD)
        if (isNaN(deadline.getTime())) {
            const [year, month, day] = dueDate.split('-').map(Number);
            deadline = new Date(year, month - 1, day); // month is 0-based in Date constructor
        }

        // If still invalid, return 0
        if (isNaN(deadline.getTime())) {
            console.error('Invalid date format:', dueDate);
            return 0;
        }
    } catch (error) {
        console.error('Error parsing due date:', error);
        return 0;
    }

    // Reset times to start of day for consistent comparison
    currentTime.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);

    // Calculate time difference in milliseconds
    const timeDiff = deadline.getTime() - currentTime.getTime();

    // Extensive logging for debugging
    console.group('Time Remaining Calculation');
    console.log('Due Date Input:', dueDate);
    console.log('Parsed Deadline:', deadline);
    console.log('Current Time:', currentTime);
    console.log('Time Difference (ms):', timeDiff);

    // If deadline has not passed, calculate normal remaining time
    if (timeDiff > 0) {
        const totalHours = timeDiff / (1000 * 60 * 60);
        const days = Math.floor(totalHours / 24);
        const hours = Math.floor(totalHours % 24);

        console.log('Future Task - Remaining Time:', { days, hours });

        // Guard against division by zero: if due today (days=0, hours=0), return max priority
        if (days === 0 && hours === 0) {
            console.log('Task due now - returning maximum priority');
            console.groupEnd();
            return 100; // Maximum finite priority for tasks due right now
        }

        // Use minimum denominator of 0.042 (~1 hour) to prevent extreme values
        const denominator = Math.max(0.042, days + hours / 24);
        const points = (1 / denominator) * 10;
        console.log('Calculated Points:', points);
        console.groupEnd();
        return points;
    }

    // For overdue tasks: exponential priority increase
    // Convert time difference to days
    const overduedays = Math.abs(Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
    console.log('Overdue Days:', overduedays);

    // Prevent potential infinity by adding a max cap
    const safeOverdueDays = Math.min(overduedays, 30);

    // Exponential priority calculation with capped value
    const timeRemainingPoints = 10 * (1 + Math.log(safeOverdueDays + 1));

    console.log(`Overdue Time Remaining Points: ${timeRemainingPoints.toFixed(2)}`);
    console.groupEnd();

    return timeRemainingPoints;
}

// Calculate Task Score Based on Multiple Factors
function calculateTaskScore(task, creditHoursPoints, cognitiveDifficultyPoints, projectId) {
    // Get academic performance adjustment (APA) and validate range
    const rawAPA = getAcademicPerformance(projectId);
    const academicPerformanceAdjustment = Math.max(0, Math.min(100, rawAPA || 0));

    // Calculate time remaining points
    const timeRemainingPoints = calculateTimeRemainingPoints(task.dueDate);

    // Get task weightage points
    const taskWeightagePoints = calculateTaskWeightage(projectId, task.section);

    // Calculate base score
    const baseScore = creditHoursPoints + cognitiveDifficultyPoints + taskWeightagePoints + timeRemainingPoints;

    // Apply academic performance adjustment as a percentage reduction
    const finalScore = baseScore * (1 - academicPerformanceAdjustment / 100);

    // Ensure final score is non-negative (defensive programming)
    const validatedScore = Math.max(0, finalScore);

    // Log detailed scoring breakdown
    console.log('Task Score Breakdown:', {
        creditHoursPoints,
        cognitiveDifficultyPoints,
        taskWeightagePoints,
        timeRemainingPoints,
        academicPerformanceAdjustment,
        baseScore,
        finalScore: validatedScore
    });

    return validatedScore;
}

// Calculate priority scores for all tasks across all subjects
function calculateAllTasksPriorities() {
    // Get all subjects and sort them by total priority potential
    const subjects = getSubjectsFromStorage();
    let allTasksWithScores = [];

    subjects.forEach(subject => {
        let tasks = getActiveTasks(subject.tag);

        // Calculate subject-level scores
        const creditHoursPoints = subject.relativeScore;
        const cognitiveDifficultyPoints = subject.cognitiveDifficulty;

        // Calculate scores for all tasks
        tasks.forEach(task => {
            const score = calculateTaskScore(task, creditHoursPoints, cognitiveDifficultyPoints, subject.tag);
            allTasksWithScores.push({
                ...task,
                priorityScore: score,
                projectName: subject.name,
                projectId: subject.tag
            });
        });
    });

    // Sort all tasks by priority score
    allTasksWithScores.sort((a, b) => b.priorityScore - a.priorityScore);




    // Phase 2: Store via TaskRepository (handles broadcast internally)
    if (window.TaskRepository) {
        window.TaskRepository.savePriorityCache(allTasksWithScores);
    } else {
        storageService.set('calculatedPriorityTasks', allTasksWithScores);
    }

    if (window.crossTabSync) {
        window.crossTabSync.broadcastAction('priority-update', {
            timestamp: Date.now(),
            taskCount: allTasksWithScores.length
        });
    }

    // NEW CODE: Save to Firestore if possible
    saveCalculatedTasksToFirestore(allTasksWithScores);


    return allTasksWithScores;
}


async function saveCalculatedTasksToFirestore(tasks) {
    try {
        // Use centralized helper from firestore.js
        if (window.savePriorityTasksToFirestore) {
            await window.savePriorityTasksToFirestore(tasks);
        } else {
            // Dynamic import as fallback or main method if window var not set yet
            const { savePriorityTasksToFirestore } = await import('./js/firestore.js');
            await savePriorityTasksToFirestore(tasks);
        }
    } catch (error) {
        console.error('Error saving priority tasks to Firestore:', error);
    }
}

// ensureWeightagesSynced is defined above at line 36 - no duplicate needed here


function updatePriorityScores() {
    // Ensure weightages are synchronized before calculating scores
    ensureWeightagesSynced();

    // Check if initialization is needed
    if (typeof window.initializeAllSubjectWeightages === 'function') {
        window.initializeAllSubjectWeightages().then(() => {
            // Now proceed with the actual update
            updatePriorityScoresInternal();
        }).catch(error => {
            console.error('Error initializing weightages:', error);
            // Continue anyway to show at least partial data
            updatePriorityScoresInternal();
        });
    } else {
        // If initializeAllSubjectWeightages is not available, proceed directly
        updatePriorityScoresInternal();
    }

    function updatePriorityScoresInternal() {
        const priorityList = document.getElementById('priorityList');
        if (priorityList) {
            priorityList.innerHTML = ''; // Clear existing content
        }

        // Calculate all task scores once
        const allTasksWithScores = calculateAllTasksPriorities();
        const subjects = getSubjectsFromStorage();

        // Group tasks by projectId for efficient lookup
        const tasksByProject = {};
        allTasksWithScores.forEach(task => {
            if (!tasksByProject[task.projectId]) {
                tasksByProject[task.projectId] = [];
            }
            tasksByProject[task.projectId].push(task);
        });

        // Render each subject with its pre-calculated tasks
        subjects.forEach(subject => {
            // Get pre-calculated tasks for this subject (already have scores)
            const tasks = tasksByProject[subject.tag] || [];

            // Skip subjects with no tasks
            if (tasks.length === 0) {
                return;
            }

            const projectCard = document.createElement('div');
            projectCard.className = 'priority-card';

            // Get subject-level scores for display
            const creditHoursPoints = subject.relativeScore;
            const cognitiveDifficultyPoints = subject.cognitiveDifficulty;
            const academicPerformancePoints = getAcademicPerformance(subject.tag);

            // Tasks are already sorted by priority from calculateAllTasksPriorities
            // But we need to sort within this subject for display
            tasks.sort((a, b) => b.priorityScore - a.priorityScore);

            // Group sorted tasks by section
            const tasksBySection = {};
            tasks.forEach(task => {
                if (!tasksBySection[task.section]) {
                    tasksBySection[task.section] = [];
                }
                tasksBySection[task.section].push(task);
            });

            projectCard.innerHTML = `
                <div class="subject-header">
                    <div class="subject-title-row">
                        <h3>${subject.name}</h3>
                        <button class="toggle-stats" id="toggle-${subject.tag}">
                            <i class="bi bi-chevron-down"></i>
                        </button>
                    </div>
                    <div class="subject-stats" id="stats-${subject.tag}">
                        <div class="stat">
                            <span>Credit Hours:</span>
                            <span>${subject.creditHours}</span>
                        </div>
                        <div class="stat">
                            <span>Credit Hours Points:</span>
                            <span>${creditHoursPoints.toFixed(2)}</span>
                        </div>
                        <div class="stat">
                            <span>Cognitive Difficulty:</span>
                            <span>${cognitiveDifficultyPoints.toFixed(2)}</span>
                        </div>
                        <div class="stat">
                            <span>Academic Performance:</span>
                            <span>${academicPerformancePoints.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <div class="task-list">
                    ${tasks.length > 0 ?
                    // Sort sections by their highest priority task
                    Object.entries(tasksBySection)
                        .sort((a, b) => {
                            const maxScoreA = Math.max(...a[1].map(t => t.priorityScore));
                            const maxScoreB = Math.max(...b[1].map(t => t.priorityScore));
                            return maxScoreB - maxScoreA;
                        })
                        .map(([section, sectionTasks]) => `
                                <div class="section-tasks mb-4">
                                    <h4 class="section-header">
                                        ${section}
                                        <small class="text-muted">(${sectionTasks.length} task${sectionTasks.length !== 1 ? 's' : ''})</small>
                                    </h4>
                                    ${sectionTasks.map(task => {
                            // Use pre-calculated values from task object
                            const totalPoints = task.priorityScore;

                            // Re-calculate component scores ONLY for display breakdown
                            // (These are cheap calculations, not the full flow)
                            const taskWeightagePoints = calculateTaskWeightage(subject.tag, task.section);
                            const timeRemainingPoints = calculateTimeRemainingPoints(task.dueDate);

                            // Calculate days overdue or remaining
                            const currentTime = new Date();
                            const deadline = new Date(task.dueDate);
                            const timeDiff = currentTime.getTime() - deadline.getTime();
                            const daysStatus = timeDiff <= 0
                                ? `${Math.ceil(Math.abs(timeDiff) / (1000 * 60 * 60 * 24))} days remaining`
                                : `${Math.ceil(Math.abs(timeDiff) / (1000 * 60 * 60 * 24))} days overdue`;

                            return `
                                            <div class="task-item mb-3">
                                                <div class="d-flex justify-content-between align-items-center">
                                                    <div class="task-info">
                                                        <h5>${task.title}</h5>
                                                        <small class="text-muted">Due: ${new Date(task.dueDate).toLocaleDateString()} (${daysStatus})</small>
                                                    </div>
                                                    <div class="d-flex align-items-center">
                                                        <span class="priority-score me-3">${totalPoints.toFixed(2)}</span>
                                                        <button class="delete-btn" onclick="deleteTask('${subject.tag}', '${task.id}')" title="Delete Task">
                                                            <i class="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div class="score-breakdown">
                                                    <div class="component-score">
                                                        <span>Credit Hours Points:</span>
                                                        <span>${creditHoursPoints.toFixed(2)}</span>
                                                    </div>
                                                    <div class="component-score">
                                                        <span>Cognitive Difficulty Points:</span>
                                                        <span>${cognitiveDifficultyPoints.toFixed(2)}</span>
                                                    </div>
                                                    <div class="component-score">
                                                        <span>Task Weightage Points:</span>
                                                        <span>${taskWeightagePoints.toFixed(2)}</span>
                                                    </div>
                                                    <div class="component-score">
                                                        <span>Time Remaining Points:</span>
                                                        <span>${timeRemainingPoints.toFixed(2)}</span>
                                                    </div>
                                                    <div class="component-score">
                                                        <span>Academic Performance Adjustment:</span>
                                                        <span>-${academicPerformancePoints.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        `;
                        }).join('')}
                                </div>
                            `).join('')
                    : `
                            <div class="no-tasks-message">
                                <i class="bi bi-clipboard-check"></i>
                                <p>No active tasks for this subject</p>
                            </div>
                        `}
                </div>
            `;
            if (priorityList) {
                priorityList.appendChild(projectCard);
            }
        });
    }
}




/**
 * Function to check for task updates
 * Previously in inline script in priority-calculator.html
 */
function checkForUpdates() {
    console.log('[checkForUpdates] Checking for new tasks...');
    updatePriorityScores();
}

/**
 * Set up event listeners for storage events to update priority scores
 * Previously in inline script in priority-calculator.html
 */
function setupUpdateListeners() {
    // Update scores when tasks change
    window.addEventListener('storage', function (e) {
        console.log('[Storage Event]', {
            key: e.key,
            newValue: e.newValue,
            oldValue: e.oldValue
        });
        if (e.key === 'tasks' || e.key?.startsWith('tasks-') || e.key?.startsWith('gpace_tasks_v5.') || e.key === 'academicSubjects' || e.key === 'projectWeightages') {
            console.log('[Storage Event] Triggering updatePriorityScores');
            updatePriorityScores();
        }
    });
}

/**
 * Set up toggle functionality for subject statistics
 * Previously in inline script in priority-calculator.html
 */
function setupToggleStats() {
    const toggleStatsButtons = document.querySelectorAll('.toggle-stats');
    toggleStatsButtons.forEach(button => {
        button.addEventListener('click', function () {
            const subjectId = button.id.replace('toggle-', '');
            const stats = document.getElementById(`stats-${subjectId}`);
            if (stats.classList.contains('show')) {
                stats.classList.remove('show');
                button.innerHTML = '<i class="bi bi-chevron-down"></i>';
            } else {
                stats.classList.add('show');
                button.innerHTML = '<i class="bi bi-chevron-up"></i>';
            }
        });
    });
}

// Initialize everything when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    initializeTheme();

    // Set up toggle stats functionality
    setupToggleStats();

    // Set up update listeners
    setupUpdateListeners();

    // Start periodic updates
    setInterval(checkForUpdates, 600000); // Check every 10 minutes

    // Initial load - may return empty if data not loaded yet
    updatePriorityScores();

    // Poll for data availability if initial load found nothing
    // This handles async data loading from DataInitService/Firebase
    let pollCount = 0;
    const maxPolls = 30; // 30 seconds max wait
    const pollInterval = setInterval(() => {
        pollCount++;
        // Check for academicSubjects using helper that handles namespaced key
        const subjects = getSubjectsFromStorage();

        if (subjects.length > 0) {
            console.log('[PriorityCalculator] Data now available (' + subjects.length + ' subjects), refreshing...');
            updatePriorityScores();
            clearInterval(pollInterval);
        } else if (pollCount >= maxPolls) {
            console.log('[PriorityCalculator] Timeout waiting for data');
            clearInterval(pollInterval);
        }
    }, 1000);
});

// Also listen for storage events in case data is loaded from another tab
window.addEventListener('storage', (event) => {
    if (event.key === 'academicSubjects' || (event.key && (event.key.startsWith('tasks-') || event.key.startsWith('gpace_tasks_v5.')))) {
        console.log('[PriorityCalculator] Storage changed (' + event.key + '), refreshing...');
        setTimeout(() => updatePriorityScores(), 500); // Small delay to let writes complete
    }
});

// Listen for dataInitialized event from DataInitializationService
window.addEventListener('dataInitialized', (event) => {
    console.log('[PriorityCalculator] DataInitService complete, refreshing...', event.detail);
    setTimeout(() => updatePriorityScores(), 500);
});
