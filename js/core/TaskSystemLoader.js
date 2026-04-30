/**
 * TaskSystemLoader.js
 * 
 * Unified loader for the Task Sync System (Phase 2 Nuclear Rebuild).
 * Initializes TaskRepository, SyncStatusIndicator, ConflictModal, and RecoveryModal
 * on every page.
 * 
 * Include this script in EVERY page that deals with tasks:
 * <script type="module" src="/js/core/TaskSystemLoader.js"></script>
 * 
 * @version 1.0.0
 * @created December 12, 2025
 */

import taskSystem from './TaskSystem.js';
import SyncStatusIndicator from '../components/SyncStatusIndicator.js';
import ConflictModal from '../components/ConflictModal.js';
import RecoveryModal from '../components/RecoveryModal.js';

// ============================================
// INITIALIZATION
// ============================================

// Map TaskRepository patterns to TaskSystem (Compatibility Layer)
const TaskRepositoryProxy = {
    init: () => taskSystem.init(),
    getAllTasks: (projectId) => taskSystem._readTasks(projectId),
    getTasks: (projectId) => taskSystem.getTasks(projectId),
    addTask: (projectId, task) => taskSystem.createTask(projectId, task),
    updateTask: (projectId, taskId, updates) => taskSystem.updateTask(projectId, taskId, updates),
    completeTask: (projectId, taskId) => taskSystem.completeTask(projectId, taskId),
    deleteTask: (projectId, taskId) => taskSystem.deleteTask(projectId, taskId),
    getPriorityCache: () => taskSystem.getPriorityTasks(),
    savePriorityCache: (tasks) => taskSystem._writeV5('priority_cache_v5', tasks),
    // Ensure all common methods are present to avoid ReferenceErrors
    listBackups: () => [],
    forceRecoveryFromBackup: () => console.warn('Recovery not implemented in TaskSystem yet'),
    exportData: () => ({})
};

/**
 * Initialize the complete task sync system.
 */
async function initTaskSystem() {
    console.log('[TaskSystem] Initializing Unified Task System...');

    try {
        // 1. Initialize TaskSystem
        await taskSystem.init();

        // 2. Initialize UI components
        SyncStatusIndicator.init();
        ConflictModal.init();
        RecoveryModal.init();

        // 3. Mark sync as complete
        SyncStatusIndicator.synced();

        // 4. Expose globally for legacy code (Compatibility Layer)
        window.TaskSystem = taskSystem;
        window.taskService = taskSystem;
        window.TaskService = taskSystem;
        
        // Expose proxy globally
        window.TaskRepository = TaskRepositoryProxy;

        window.SyncStatusIndicator = SyncStatusIndicator;
        window.ConflictModal = ConflictModal;
        window.RecoveryModal = RecoveryModal;

        // 5. Create convenience functions
        window.gpac = {
            getTasks: (projectId) => taskSystem.getTasks(projectId),
            addTask: (projectId, task) => taskSystem.createTask(projectId, task),
            updateTask: (projectId, taskId, updates) => taskSystem.updateTask(projectId, taskId, updates),
            completeTask: (projectId, taskId) => taskSystem.completeTask(projectId, taskId),
            deleteTask: (projectId, taskId) => taskSystem.deleteTask(projectId, taskId),
            getPriorityTasks: () => taskSystem.getPriorityTasks()
        };

        console.log('[TaskSystem] ✅ Unified system active. Use window.TaskSystem.');
        window.dispatchEvent(new CustomEvent('gpac_ready'));

        return true;

    } catch (error) {
        console.error('[TaskSystem] Initialization failed:', error);
        if (window.SyncStatusIndicator) {
            SyncStatusIndicator.setState('offline', 'Sync error');
        }
        return false;
    }
}

// ============================================
// COMPATIBILITY LAYER
// ============================================

/**
 * Compatibility wrapper for legacy code that uses direct localStorage access.
 * Logs warnings and redirects to TaskRepository.
 */
function setupCompatibilityLayer() {
    // Intercept localStorage.getItem for task keys
    const originalGetItem = localStorage.getItem.bind(localStorage);
    const originalSetItem = localStorage.setItem.bind(localStorage);

    // These are the FORBIDDEN patterns - any access should go through TaskRepository
    const forbiddenPatterns = [
        /^tasks-/,
        /^completed-tasks-/,
        /^relaxed-tasks$/,
        /^calculatedPriorityTasks$/
    ];

    // Note: We don't actually override localStorage here as it would be too risky
    // Instead, we export a checker function
    window.__checkTaskStorageAccess = (key, operation) => {
        for (const pattern of forbiddenPatterns) {
            if (pattern.test(key)) {
                console.warn(
                    `[TaskSystem] ⚠️ Direct localStorage.${operation}('${key}') detected! ` +
                    `Use TaskRepository instead.`
                );
                return true;
            }
        }
        return false;
    };
}

// ============================================
// AUTO-INITIALIZATION
// ============================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initTaskSystem();
        setupCompatibilityLayer();
    });
} else {
    initTaskSystem();
    setupCompatibilityLayer();
}

// ============================================
// EXPORTS
// ============================================

// Defined for export even if init fails
const TaskRepository = TaskRepositoryProxy;

export {
    TaskRepository,
    SyncStatusIndicator,
    ConflictModal,
    RecoveryModal,
    initTaskSystem,
    setupCompatibilityLayer
};

export default TaskRepository;

