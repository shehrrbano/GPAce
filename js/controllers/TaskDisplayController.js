/**
 * TaskDisplayController - Centralized Priority Task Display Management
 * 
 * This module consolidates all task display functionality that was previously
 * scattered across multiple inline scripts in grind.html.
 * 
 * Features:
 * - Priority task display and navigation
 * - Task grouping by interleave date  
 * - Shared template rendering
 * - Debounced refresh to prevent excessive updates
 */

class TaskDisplayController {
    constructor() {
        this.displayTimeout = null;
        this.lastTasksHash = null;
        this._isDisplaying = false;

        // Bind methods
        this.displayPriorityTask = this.displayPriorityTask.bind(this);
        this.navigateTask = this.navigateTask.bind(this);
    }

    /**
     * Initialize the controller
     */
    init() {
        console.log('TaskDisplayController initializing (Redesign 2.0)...');

        // Set up DOM elements (Redesign 2.0 IDs)
        this.nowFocusingBox = document.getElementById('nowFocusingCard');
        this.taskQueueBox = document.getElementById('taskQueueCard');

        this._setupStorageListener();
        this._loadPriorityListSorter();

        // Initial display
        this.displayPriorityTask();
        this.displayTaskQueue();

        console.log('TaskDisplayController initialized');
        return this;
    }

    /**
     * Display the priority task with debouncing
     * @param {boolean} force - Force refresh even if data unchanged
     */
    displayPriorityTask(force = false) {
        // Clear any pending refresh
        if (this.displayTimeout) {
            clearTimeout(this.displayTimeout);
        }

        // Schedule a new refresh with debounce
        this.displayTimeout = setTimeout(async () => {
            await this._displayPriorityTaskImpl(force);
            this.displayTaskQueue(); // Also refresh queue
            this.displayTimeout = null;
        }, 50);
    }

    /**
     * Public method to trigger task queue refresh
     */
    displayTaskQueue() {
        if (!this.taskQueueBox) return;
        this._renderTaskQueue();
    }

    /**
     * Render the sidebar task queue
     * @private
     */
    _renderTaskQueue() {
        const tasksJson = storageService.get('calculatedPriorityTasks') || '[]';
        const priorityTasks = typeof tasksJson === 'string' ? JSON.parse(tasksJson) : tasksJson;

        if (!priorityTasks.length) {
            this.taskQueueBox.innerHTML = '<div class="queue-empty">No upcoming tasks</div>';
            return;
        }

        // Skip the first task (it's in the Now Focusing card)
        const upcomingTasks = priorityTasks.slice(1, 6); // Show next 5

        const html = `
            <div class="queue-header">
                <h3>Up next</h3>
                <span class="queue-count">${priorityTasks.length - 1} open • sorted by priority</span>
            </div>
            <div class="queue-list">
                ${upcomingTasks.map(task => this._generateQueueItemTemplate(task)).join('')}
            </div>
            <div class="completed-section">
                <button class="completed-toggle" onclick="this.parentElement.classList.toggle('expanded')">
                    COMPLETED TODAY • <span id="completedCount">0</span>
                    <i class="bi bi-chevron-down"></i>
                </button>
                <div class="completed-list"></div>
            </div>
        `;

        this.taskQueueBox.innerHTML = html;
        this._loadCompletedToday();
    }

    /**
     * Template for a single queue item
     */
    _generateQueueItemTemplate(task) {
        const priorityClass = task.priority || 'medium';
        return `
            <div class="queue-item" data-id="${task.id}">
                <div class="queue-item-checkbox" onclick="completeTask('${task.projectId}', '${task.id}')"></div>
                <div class="queue-item-content">
                    <div class="queue-item-title">${task.title}</div>
                    <div class="queue-item-meta">${task.projectId} • Today</div>
                </div>
                <div class="queue-item-priority ${priorityClass}"></div>
            </div>
        `;
    }

    /**
     * Load tasks completed today into the footer
     */
    _loadCompletedToday() {
        const history = JSON.parse(localStorage.getItem('taskHistory') || '[]');
        const today = new Date().toDateString();
        const completedToday = history.filter(h => new Date(h.completedAt).toDateString() === today);
        
        const countEl = document.getElementById('completedCount');
        if (countEl) countEl.textContent = completedToday.length;

        const listEl = this.taskQueueBox.querySelector('.completed-list');
        if (listEl && completedToday.length > 0) {
            listEl.innerHTML = completedToday.map(h => `
                <div class="completed-item">
                    <i class="bi bi-check2-circle"></i>
                    <div class="completed-item-title">${h.taskTitle}</div>
                    <div class="completed-item-tag">${h.projectId}</div>
                </div>
            `).join('');
        }
    }

    /**
     * Navigate to next/previous task
     * @param {string} direction - 'next' or 'prev'
     */
    navigateTask(direction) {
        console.group(`📊 Task Navigation (${direction})`);

        try {
            const priorityTasks = storageService.get('calculatedPriorityTasks', '[]');

            if (priorityTasks.length < 2) {
                console.warn('Not enough tasks to navigate');
                console.groupEnd();
                return;
            }

            // Group and order tasks
            const groupedTasks = this.groupTasksByInterleaveDate(priorityTasks);
            const orderedTasks = this._flattenGroupedTasks(groupedTasks);

            // Find current task
            const currentIndex = this._findCurrentTaskIndex(orderedTasks);
            if (currentIndex === -1) {
                console.error('Current task not found in list');
                console.groupEnd();
                return;
            }

            // Calculate next index
            const nextIndex = direction === 'next'
                ? (currentIndex + 1) % orderedTasks.length
                : (currentIndex - 1 + orderedTasks.length) % orderedTasks.length;

            const nextTask = orderedTasks[nextIndex];
            console.log('Navigating to task:', nextTask.title);

            // Render the new task
            this._renderTask(nextTask);

        } catch (error) {
            console.error('Navigation error:', error);
        }

        console.groupEnd();
    }

    /**
     * Group tasks by their interleave date
     * @param {Array} tasks - Array of task objects
     * @returns {Object} Tasks grouped by date
     */
    groupTasksByInterleaveDate(tasks) {
        const groups = {};

        tasks.forEach((task, index) => {
            task.index = index;
            let groupKey = 'not-interleaved';

            if (task.lastInterleaved) {
                const date = new Date(task.lastInterleaved);
                groupKey = date.toISOString().split('T')[0];
            }

            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(task);
        });

        // Sort groups: not-interleaved first, then by date (oldest first)
        const sortedGroups = Object.entries(groups).sort((a, b) => {
            if (a[0] === 'not-interleaved') return -1;
            if (b[0] === 'not-interleaved') return 1;
            return new Date(a[0]) - new Date(b[0]);
        });

        const result = {};
        sortedGroups.forEach(([key, value]) => {
            result[key] = value;
        });

        return result;
    }

    /**
     * Simple string hash for comparing task lists
     */
    hashString(str) {
        let hash = 0;
        if (str.length === 0) return hash;

        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        return hash;
    }

    // ==================== Private Methods ====================

    /**
     * Implementation of priority task display
     */
    async _displayPriorityTaskImpl(force = false) {
        if (this._isDisplaying) {
            console.warn('Already displaying priority task, skipping');
            return;
        }

        // Check if data has changed
        const tasksJson = storageService.get('calculatedPriorityTasks') || '[]';
        const tasksHash = this.hashString(tasksJson);

        if (!force && tasksHash === this.lastTasksHash) {
            console.log('Priority tasks unchanged, skipping refresh');
            return;
        }

        this.lastTasksHash = tasksHash;
        this._isDisplaying = true;

        try {
            // Check for priority sync fix
            if (window.prioritySyncFix?.autoFixInIncognito) {
                try {
                    await window.prioritySyncFix.autoFixInIncognito();
                } catch (e) {
                    console.error('Priority sync error:', e);
                }
            }

            const priorityTasks = JSON.parse(tasksJson);
            const taskBox = document.getElementById('nowFocusingCard');

            if (!taskBox) {
                console.error('Redesign task box (nowFocusingCard) not found');
                // Fallback to legacy ID if needed
                const legacyBox = document.getElementById('priorityTaskBox');
                if (!legacyBox) return;
                this._renderTask(priorityTasks[0], legacyBox);
                return;
            }

            if (priorityTasks.length === 0) {
                taskBox.innerHTML = '<div class="task-info" style="display: flex; align-items: center; justify-content: center; height: 100%;">No tasks available</div>';
                return;
            }

            // Group and get top task
            const groupedTasks = this.groupTasksByInterleaveDate(priorityTasks);
            const firstGroupKey = Object.keys(groupedTasks)[0];

            if (!firstGroupKey || !groupedTasks[firstGroupKey]?.length) {
                taskBox.innerHTML = '<div class="task-info">No top task found</div>';
                return;
            }

            const topTask = groupedTasks[firstGroupKey][0];
            this._renderTask(topTask, taskBox);

        } catch (error) {
            console.error('Error in displayPriorityTask:', error);
            const taskBox = document.getElementById('nowFocusingCard');
            if (taskBox) {
                taskBox.innerHTML = `<div class="task-info">Error displaying task: ${error.message}</div>`;
            }
        } finally {
            this._isDisplaying = false;
        }
    }

    /**
     * Render a task to the display
     * @param {Object} task - Task object to render
     * @param {HTMLElement} taskBox - Container element
     */
    _renderTask(task, taskBox = document.getElementById('nowFocusingCard')) {
        if (!taskBox) return;

        // Get subject info
        const subjects = storageService.get('academicSubjects', '[]');
        const subject = subjects.find(s => s.tag === task.projectId);

        // Generate HTML using shared template
        const html = this._generateTaskTemplate(task, subject);

        // Create container with fade transition
        const newContent = document.createElement('div');
        newContent.style.opacity = '0';
        newContent.style.transition = 'opacity 0.3s ease';
        newContent.innerHTML = html;

        // Replace content
        taskBox.innerHTML = '';
        taskBox.appendChild(newContent);

        // Fade in
        setTimeout(() => {
            newContent.style.opacity = '1';
        }, 50);

        // Initialize attachments and materials
        this._initializeTaskExtras(task, subject);
    }

    /**
     * Generate the task HTML template
     * Redesigned for Bento Grid 2.0
     */
    _generateTaskTemplate(task, subject) {
        // Sanitize task title for security
        const sanitizedTitle = typeof DOMPurify !== 'undefined'
            ? DOMPurify.sanitize(task.title)
            : this._escapeHtml(task.title);

        const priorityLabel = task.priority || 'medium';
        const deadline = task.dueDate ? new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today';

        return `
            <div class="task-card-meta">
                <div class="meta-left">
                    <span class="now-focusing-label">NOW FOCUSING</span>
                    <span class="priority-tag ${priorityLabel}">${priorityLabel} priority</span>
                </div>
                <div class="meta-right">
                    ${task.projectId || ''} • ${deadline} • ~90m
                </div>
            </div>

            <h1 class="task-display-title">${sanitizedTitle}</h1>

            <div class="task-display-actions">
                <button onclick="completeTask('${task.projectId}', '${task.id}')" class="redesign-btn primary">
                    <i class="bi bi-check-circle"></i> Mark complete
                </button>
                <button onclick="window.taskDisplayController.navigateTask('next')" class="redesign-btn secondary">
                    <i class="bi bi-arrow-left-right"></i> Switch task
                </button>
                <button onclick="performAISearch()" class="redesign-btn ai">
                    <i class="bi bi-stars"></i> Ask Gemini
                </button>
            </div>

            <!-- Expandable sections (Links, Subtasks) -->
            <div class="task-expandables">
                <div class="expand-btn-group">
                    <button onclick="toggleSubtasks(this, '${task.id}')" class="expand-btn">
                        <i class="bi bi-list-check"></i> Subtasks
                    </button>
                    <button onclick="toggleTaskLinks('${task.id}')" class="expand-btn">
                        <i class="bi bi-link-45deg"></i> Links (${task.links?.length || 0})
                    </button>
                </div>

                <div id="subtasks-${task.id}" class="subtasks-container">
                    <div class="loading-spinner d-none"></div>
                    <div class="subtasks-list"></div>
                </div>

                <div id="links-${task.id}" class="links-container">
                    <div class="links-list"></div>
                    <button class="add-link-btn-minimal" onclick="addNewLink('${task.id}')">
                        <i class="bi bi-plus"></i> Add Link
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Initialize task attachments and subject materials
     */
    _initializeTaskExtras(task, subject) {
        setTimeout(() => {
            // Initialize attachments
            const container = document.getElementById(`task-attachments-${task.id}`);
            if (container && window.taskAttachments?.init) {
                window.taskAttachments.init(task.id, container);
            }

            // Load subject materials
            if (subject && typeof window.loadSubjectMaterials === 'function') {
                window.loadSubjectMaterials(subject.tag);
            }
        }, 100);
    }

    /**
     * Flatten grouped tasks into ordered array
     */
    _flattenGroupedTasks(groupedTasks) {
        const orderedTasks = [];
        Object.values(groupedTasks).forEach(tasksInGroup => {
            orderedTasks.push(...tasksInGroup);
        });
        return orderedTasks;
    }

    /**
     * Find current task index in ordered list
     */
    _findCurrentTaskIndex(orderedTasks) {
        // Redesign 2.0 selectors
        const currentTitle = document.querySelector('.task-display-title')?.textContent?.trim() || '';
        const metaRight = document.querySelector('.task-card-meta .meta-right')?.textContent?.trim() || '';
        const currentProject = metaRight.split('•')[0]?.trim() || '';

        console.log('[TaskDisplay] Current task from UI:', { title: currentTitle, project: currentProject });

        for (let i = 0; i < orderedTasks.length; i++) {
            const task = orderedTasks[i];
            const normalizedTaskTitle = task.title.replace(/\s+/g, ' ').trim();
            const normalizedCurrentTitle = currentTitle.replace(/\s+/g, ' ').trim();
            const taskProject = task.projectName || task.projectId;

            if (normalizedTaskTitle === normalizedCurrentTitle &&
                (taskProject === currentProject || task.projectId === currentProject)) {
                return i;
            }
        }

        // Fallback: If title matches but project didn't (e.g. slight naming difference), still return it
        const fallbackIndex = orderedTasks.findIndex(t => 
            t.title.replace(/\s+/g, ' ').trim() === currentTitle.replace(/\s+/g, ' ').trim()
        );
        
        return fallbackIndex;
    }

    /**
     * Setup storage change listener
     */
    _setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'calculatedPriorityTasks') {
                const newHash = this.hashString(e.newValue || '[]');
                if (newHash !== this.lastTasksHash) {
                    this.displayPriorityTask();
                }
            }
        });
    }

    /**
     * Load priority list sorter script
     */
    _loadPriorityListSorter() {
        if (typeof window.PriorityListSorter !== 'undefined') {
            try {
                window.PriorityListSorter.applySavedSort();
            } catch (e) {
                console.error('Error applying saved sort:', e);
                this.displayPriorityTask();
            }
            return;
        }

        const script = document.createElement('script');
        script.src = 'js/priority-list-sorting.js';
        script.onload = () => {
            if (window.PriorityListSorter) {
                try {
                    window.PriorityListSorter.applySavedSort();
                } catch (e) {
                    this.displayPriorityTask();
                }
            } else {
                this.displayPriorityTask();
            }
        };
        script.onerror = () => this.displayPriorityTask();
        document.body.appendChild(script);
    }

    /**
     * Basic HTML escape for XSS prevention
     */
    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Create singleton instance
const taskDisplayController = new TaskDisplayController();

// Export for ES6 modules
export default taskDisplayController;

// Expose to window for legacy compatibility
if (typeof window !== 'undefined') {
    window.taskDisplayController = taskDisplayController;

    // Legacy function aliases
    window.displayPriorityTask = (force) => taskDisplayController.displayPriorityTask(force);
    window.navigateTask = (direction) => taskDisplayController.navigateTask(direction);
    window.groupTasksByInterleaveDate = (tasks) => taskDisplayController.groupTasksByInterleaveDate(tasks);
    window.hashString = (str) => taskDisplayController.hashString(str);
}

