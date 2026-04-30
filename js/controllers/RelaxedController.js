/**
 * RelaxedController.js
 * Logic for managing 'Relaxed Mode' activities.
 * Extracted from relaxed-mode/script.js (Batch 14).
 */

import globals from '../core/globals.js';
import taskSystem from '../core/TaskSystem.js';

const PROJECT_ID = 'relaxed_mode';

class RelaxedController {
    constructor() {
        this.tasks = [];
        this.currentCategoryFilter = 'all';
        this.categoryInfo = {
            sports: { icon: '??', label: 'Sports' },
            music: { icon: '??', label: 'Music' },
            arts: { icon: '??', label: 'Arts' },
            clubs: { icon: '??', label: 'Clubs' },
            volunteering: { icon: '??', label: 'Volunteering' },
            other: { icon: '?', label: 'Other' }
        };
    }

    async init() {
        console.log('[RelaxedController] Initializing...');
        await taskSystem.init();
        await this.loadTasks();
    }

    async loadTasks() {
        this.showSyncIndicator(true);
        try {
            this.tasks = await taskSystem.getTasks(PROJECT_ID);
            this.renderTasks();
            this.showSyncIndicator(false);
        } catch (e) {
            console.error('[RelaxedController] Load failed:', e);
        }
    }

    async saveTask() {
        const title = document.getElementById('taskTitle')?.value.trim();
        const description = document.getElementById('taskDescription')?.value.trim();
        const dueDate = document.getElementById('dueDate')?.value;
        const priority = document.getElementById('priority')?.value;
        const category = document.getElementById('category')?.value;

        if (!title) return;

        try {
            const task = await taskSystem.createTask(PROJECT_ID, {
                title, description, dueDate, priority, category
            });
            this.tasks.push(task);
            this.renderTasks();
            if (window.showToast) window.showToast('Activity added!', 'success');
        } catch (e) {
            console.error('[RelaxedController] Save failed:', e);
        }
    }

    async deleteTask(taskId) {
        if (!confirm('Delete this activity?')) return;
        const success = await taskSystem.deleteTask(PROJECT_ID, taskId);
        if (success) {
            this.tasks = this.tasks.filter(t => String(t.id) !== String(taskId));
            this.renderTasks();
        }
    }

    async completeTask(taskId) {
        const task = await taskSystem.completeTask(PROJECT_ID, taskId);
        if (task) {
            this.tasks = this.tasks.filter(t => String(t.id) !== String(taskId));
            this.renderTasks();
        }
    }

    renderTasks() {
        const container = document.getElementById('tasksList');
        if (!container) return;
        container.innerHTML = '';

        const filtered = this.tasks.filter(t => 
            !t.completed && 
            (this.currentCategoryFilter === 'all' || t.category === this.currentCategoryFilter)
        );
        
        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>No Activities Found</h3></div>';
            return;
        }

        filtered.forEach(task => {
            const el = document.createElement('div');
            el.className = 'task-item';
            el.innerHTML = \
                <div class="task-content">
                    <h3 class="task-title">\</h3>
                    <p class="task-description">\</p>
                </div>
                <div class="task-footer">
                    <span class="category-pill">\</span>
                    <div class="footer-actions">
                        <button class="action-btn delete-btn" data-action="delete" data-id="\"><i class="bi bi-trash"></i></button>
                        <input type="checkbox" data-action="complete" data-id="\">
                    </div>
                </div>
            \;
            container.appendChild(el);
        });
    }

    showSyncIndicator(show) {
        const icon = document.getElementById('syncIcon');
        if (icon) icon.classList.toggle('sync-spinning', show);
    }
}

const relaxedController = new RelaxedController();
export default relaxedController;

globals.register('RelaxedController', relaxedController, { module: 'RelaxedController' });
