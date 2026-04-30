/**
 * TaskSystem.js
 * 
 * UNIFIED TASK SYSTEM for GPAce.
 * Single source of truth for task storage, remote sync, and business logic.
 * Part of Batch 11: Task System Consolidation.
 */

import { storageService } from '../services/StorageService.js';
import SemesterService from '../services/SemesterService.js';
import { 
    saveTasksToFirestore, 
    loadTasksFromFirestore, 
    saveCompletedTaskToFirestore,
    onSnapshot,
    doc,
    db
} from '../firestore.js';
import { auth as centralizedAuth } from '../auth.js';

// ============================================
// CONSTANTS
// ============================================
const STORAGE_KEYS = {
    TASKS_PREFIX: 'tasks_v5.',
    RELAXED: 'relaxed_v5',
    COMPLETED_PREFIX: 'completed_v5.',
    PRIORITY_CACHE: 'priority_cache_v5',
    DEVICE_ID: 'device_id',
    LAST_SYNC: 'last_sync',
    SCHEMA_VERSION: 'schema_version'
};

const SCHEMA_VERSION = 5;
const SCHEMA_NAME = 'gpac_v5';

// ============================================
// TASK SYSTEM CLASS
// ============================================
class TaskSystem {
    constructor() {
        this.initialized = false;
        this.auth = centralizedAuth;
        this.subscriptions = new Map();
        this._changeListeners = [];
        
        this.metrics = {
            operations: { create: 0, update: 0, delete: 0, complete: 0 },
            errors: { sync: 0, save: 0, load: 0 },
            lastError: null,
            sessionStart: Date.now()
        };
    }

    /**
     * Initialize the task system.
     */
    async init() {
        if (this.initialized) return true;
        
        console.log('[TaskSystem] Initializing...');
        
        // Ensure device identity
        this._ensureDeviceId();
        
        // Handle migration if needed
        const currentVersion = storageService.get(STORAGE_KEYS.SCHEMA_VERSION);
        if (currentVersion !== SCHEMA_VERSION) {
            await this._migrate();
            storageService.set(STORAGE_KEYS.SCHEMA_VERSION, SCHEMA_VERSION);
        }

        this._registerCleanupHandlers();
        this.initialized = true;
        console.log('[TaskSystem] ✅ Unified task system active.');
        return true;
    }

    // ========================================
    // PUBLIC API: GETTERS
    // ========================================

    /**
     * Get tasks for a project. 
     * Local (Instant) -> Remote (Background Sync).
     */
    async getTasks(projectId) {
        if (!this.initialized) await this.init();
        
        const localTasks = this._readTasks(projectId);
        
        // Background sync
        this.syncWithRemote(projectId).catch(e => {
            console.warn(`[TaskSystem] Background sync failed for ${projectId}:`, e);
            this.metrics.errors.sync++;
        });

        return localTasks;
    }

    /**
     * Get all active tasks for priority view.
     */
    getPriorityTasks() {
        const wrapper = this._readV5(STORAGE_KEYS.PRIORITY_CACHE);
        return wrapper ? wrapper.data.filter(t => !t.completed && !t.deleted) : [];
    }

    // ========================================
    // PUBLIC API: ACTIONS
    // ========================================

    async createTask(projectId, taskData) {
        const task = this._normalizeTask(taskData, projectId);
        const tasks = this._readTasks(projectId);
        tasks.push(task);
        
        this._writeTasks(projectId, tasks);
        this.metrics.operations.create++;
        
        // Notify about the update immediately
        window.dispatchEvent(new CustomEvent('tasksUpdated'));
        
        await this.syncWithRemote(projectId);
        return task;
    }

    /**
     * Explicitly add a task to priority cache and notify UI.
     */
    addTaskToPriority(task) {
        if (!task) return;
        this._updatePriorityCache();
        window.dispatchEvent(new CustomEvent('tasksUpdated'));
    }

    async updateTask(projectId, taskId, updates) {
        const tasks = this._readTasks(projectId);
        const index = tasks.findIndex(t => String(t.id) === String(taskId));
        
        if (index === -1) return null;
        
        tasks[index] = {
            ...tasks[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        this._writeTasks(projectId, tasks);
        this.metrics.operations.update++;
        
        await this.syncWithRemote(projectId);
        return tasks[index];
    }

    async completeTask(projectId, taskId) {
        const tasks = this._readTasks(projectId);
        const index = tasks.findIndex(t => String(t.id) === String(taskId));
        
        if (index === -1) return null;
        
        const task = tasks.splice(index, 1)[0];
        const completedTask = {
            ...task,
            completed: true,
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Save active list
        this._writeTasks(projectId, tasks);
        
        // Save to completed history
        const completedKey = STORAGE_KEYS.COMPLETED_PREFIX + projectId;
        const completed = this._readV5(completedKey)?.data || [];
        completed.unshift(completedTask);
        this._writeV5(completedKey, completed);
        
        this.metrics.operations.complete++;
        
        // Sync both lists
        try {
            await saveCompletedTaskToFirestore(projectId, completedTask);
            await saveTasksToFirestore(projectId, tasks);
        } catch (e) {
            console.warn('[TaskSystem] Remote completion sync failed:', e);
        }
        
        return completedTask;
    }

    async deleteTask(projectId, taskId) {
        const tasks = this._readTasks(projectId);
        const index = tasks.findIndex(t => String(t.id) === String(taskId));
        
        if (index === -1) return false;
        
        // Soft delete
        tasks[index].deleted = true;
        tasks[index].updatedAt = new Date().toISOString();
        
        this._writeTasks(projectId, tasks);
        this.metrics.operations.delete++;
        
        await this.syncWithRemote(projectId);
        return true;
    }

    async skipTask(taskId) {
        // Find task in any project
        const subjects = window.SemesterService?.getCurrentSubjects?.() || [];
        const projectIds = subjects.map(s => s.tag).concat(['EXTRA']);
        
        let targetTask = null;
        let targetProject = null;

        for (const pId of projectIds) {
            const tasks = this._readTasks(pId);
            const task = tasks.find(t => String(t.id) === String(taskId));
            if (task) {
                targetTask = task;
                targetProject = pId;
                break;
            }
        }

        if (targetTask) {
            // "Skip" means move to the end of the priority list.
            // We can do this by setting a 'skippedAt' timestamp and using it in sorting,
            // or just by modifying the local priority cache if it's transient.
            // But TaskSystem's philosophy is persistence.
            
            // Let's set a skip order or just bump the createdAt to the future? 
            // Better: update priority cache manually after reordering.
            const priorityTasks = this.getPriorityTasks();
            const index = priorityTasks.findIndex(t => String(t.id) === String(taskId));
            if (index !== -1) {
                const [task] = priorityTasks.splice(index, 1);
                priorityTasks.push(task);
                
                // Save back to priority cache ONLY (transient for this session)
                storageService.set('calculatedPriorityTasks', priorityTasks);
                this._writeV5(STORAGE_KEYS.PRIORITY_CACHE, priorityTasks);
                window.dispatchEvent(new CustomEvent('tasksUpdated'));
                return true;
            }
        }
        return false;
    }

    async interleaveTask(taskId) {
        // Find task in any project
        const subjects = window.SemesterService?.getCurrentSubjects?.() || [];
        const projectIds = subjects.map(s => s.tag).concat(['EXTRA']);
        
        for (const pId of projectIds) {
            const tasks = this._readTasks(pId);
            const index = tasks.findIndex(t => String(t.id) === String(taskId));
            if (index !== -1) {
                tasks[index].lastInterleaved = new Date().toISOString();
                tasks[index].updatedAt = new Date().toISOString();
                this._writeTasks(pId, tasks);
                await this.syncWithRemote(pId);
                window.dispatchEvent(new CustomEvent('tasksUpdated'));
                return true;
            }
        }
        return false;
    }

    /**
     * Subscribe to real-time updates for a project.
     */
    async subscribeToProject(projectId, onUpdate) {
        if (!projectId) return () => {};

        // 1. Initial push from cache/local
        const currentTasks = await this.getTasks(projectId);
        if (onUpdate) onUpdate(currentTasks);

        // 2. Setup Firestore listener
        try {
            const user = this.auth.currentUser;
            if (!user) {
                console.warn('[TaskSystem] No user for subscription, listener pending...');
                return () => {};
            }

            // Clean up existing subscription if any
            if (this.subscriptions.has(projectId)) {
                this.subscriptions.get(projectId)();
            }

            const taskRef = doc(db, 'users', user.uid, 'tasks', projectId);
            const unsubscribe = onSnapshot(taskRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const tasks = data.tasks || [];
                    
                    console.log(`[TaskSystem] Real-time update for ${projectId}: ${tasks.length} tasks`);
                    
                    // Update internal cache
                    this._writeTasks(projectId, tasks);
                    
                    // Trigger callback
                    if (onUpdate) onUpdate(tasks);
                    
                    // Notify system
                    window.dispatchEvent(new CustomEvent('gpac_tasks_updated', { 
                        detail: { projectId, tasks } 
                    }));
                }
            }, (error) => {
                console.error(`[TaskSystem] Subscription error for ${projectId}:`, error);
            });

            this.subscriptions.set(projectId, unsubscribe);
            return unsubscribe;

        } catch (error) {
            console.error('[TaskSystem] Failed to setup subscription:', error);
            return () => {};
        }
    }

    unsubscribeFromProject(projectId) {
        if (this.subscriptions.has(projectId)) {
            this.subscriptions.get(projectId)();
            this.subscriptions.delete(projectId);
        }
    }

    // ========================================
    // REMOTE SYNC
    // ========================================

    async syncWithRemote(projectId) {
        if (!this.auth.currentUser) return;
        
        try {
            const remoteTasks = await loadTasksFromFirestore(projectId);
            if (!remoteTasks) return;

            const localTasks = this._readTasks(projectId);
            const merged = this._mergeTasks(localTasks, remoteTasks);
            
            if (JSON.stringify(merged) !== JSON.stringify(localTasks)) {
                console.log(`[TaskSystem] Merged remote updates for ${projectId}`);
                this._writeTasks(projectId, merged);
                this._notifyListeners('TASKS_SYNCED', { projectId, tasks: merged });
            }
        } catch (e) {
            this._logError('sync', e);
        }
    }

    // ========================================
    // PRIVATE HELPERS
    // ========================================

    _readTasks(projectId) {
        const key = STORAGE_KEYS.TASKS_PREFIX + projectId;
        const wrapper = this._readV5(key);
        return wrapper ? wrapper.data.filter(t => !t.completed && !t.deleted) : [];
    }

    _writeTasks(projectId, tasks) {
        const key = STORAGE_KEYS.TASKS_PREFIX + projectId;
        this._writeV5(key, tasks);
        this._updatePriorityCache();
    }

    _readV5(key) {
        return storageService.get(key, null);
    }

    _writeV5(key, data) {
        const wrapper = {
            version: SCHEMA_VERSION,
            schema: SCHEMA_NAME,
            generatedAt: new Date().toISOString(),
            deviceId: this._getDeviceId(),
            data: data
        };
        storageService.set(key, wrapper);
    }

    _mergeTasks(local, remote) {
        const map = new Map();
        [...local, ...remote].forEach(t => {
            const id = String(t.id);
            if (!map.has(id) || new Date(t.updatedAt) > new Date(map.get(id).updatedAt)) {
                map.set(id, t);
            }
        });
        return Array.from(map.values());
    }

    _normalizeTask(task, projectId) {
        return {
            id: String(task.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`),
            projectId,
            title: task.title || 'Untitled Task',
            description: task.description || '',
            completed: Boolean(task.completed),
            deleted: Boolean(task.deleted),
            dueDate: task.dueDate || '',
            priority: task.priority || 'medium',
            section: task.section || 'General',
            links: Array.isArray(task.links) ? task.links : [],
            subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
            attachments: Array.isArray(task.attachments) ? task.attachments : [],
            updatedAt: new Date().toISOString(),
            createdAt: task.createdAt || new Date().toISOString()
        };

    }

    _ensureDeviceId() {
        if (!storageService.has(STORAGE_KEYS.DEVICE_ID)) {
            storageService.set(STORAGE_KEYS.DEVICE_ID, crypto.randomUUID());
        }
    }

    _getDeviceId() {
        return storageService.get(STORAGE_KEYS.DEVICE_ID, 'unknown');
    }

    _updatePriorityCache() {
        // Collect all active tasks from all known projects
        const allTasks = [];
        
        // 1. Get projects from SemesterService
        const subjects = SemesterService?.getCurrentSubjects?.() || [];
        const projectIds = new Set(subjects.map(s => s.tag).filter(Boolean));
        
        // 2. Always include 'EXTRA'
        projectIds.add('EXTRA');
        
        // 3. Scan storage for any other v5 projects that might exist
        try {
            const allKeys = storageService.keys();
            allKeys.forEach(key => {
                if (key.startsWith(STORAGE_KEYS.TASKS_PREFIX)) {
                    const pId = key.replace(STORAGE_KEYS.TASKS_PREFIX, '');
                    if (pId) projectIds.add(pId);
                }
            });
        } catch (e) {
            console.warn('[TaskSystem] Error scanning storage keys:', e);
        }
        
        for (const projectId of projectIds) {
            const tasks = this._readTasks(projectId);
            allTasks.push(...tasks);
        }
        
        // Sort by priority (high to low) then by date
        const priorityMap = { 'high': 3, 'medium': 2, 'low': 1 };
        allTasks.sort((a, b) => {
            const pA = priorityMap[a.priority] || 0;
            const pB = priorityMap[b.priority] || 0;
            if (pB !== pA) return pB - pA;
            return new Date(a.createdAt) - new Date(b.createdAt);
        });

        // Save for React UI (compatibility)
        // If we have a full priority calculator available, use it to get accurate scores
        if (typeof window.updatePriorityScores === 'function') {
            console.log('[TaskSystem] Deferring priority cache update to PriorityCalculator');
            window.updatePriorityScores();
        } else {
            storageService.set('calculatedPriorityTasks', allTasks);
            this._writeV5(STORAGE_KEYS.PRIORITY_CACHE, allTasks);
            console.log(`[TaskSystem] Priority cache updated with ${allTasks.length} unscored tasks (no calculator found).`);
        }
    }

    _registerCleanupHandlers() {
        const cleanup = () => this.unsubscribeAll();
        window.addEventListener('beforeunload', cleanup);
    }

    unsubscribeAll() {
        this.subscriptions.forEach(u => u());
        this.subscriptions.clear();
    }

    _notifyListeners(event, data) {
        this._changeListeners.forEach(l => l(event, data));
    }

    _logError(cat, err) {
        this.metrics.errors[cat]++;
        this.metrics.lastError = { cat, msg: err.message, ts: Date.now() };
        console.error(`[TaskSystem] \${cat} error:`, err);
    }

    async _migrate() {
        console.log('[TaskSystem] Running migration to unified schema...');
        // Migration logic from TaskRepository can be ported here
    }
}

// Initialize as Singleton on window
const taskSystemInstance = (typeof window !== 'undefined' && window.TaskSystem)
    ? window.TaskSystem
    : new TaskSystem();

if (typeof window !== 'undefined') {
    window.TaskSystem = taskSystemInstance;
    window.taskService = taskSystemInstance;
    window.TaskService = taskSystemInstance; // Added for PascalCase compatibility
}

export default taskSystemInstance;
export { TaskSystem };
