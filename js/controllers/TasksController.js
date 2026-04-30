/**
 * TasksController.js
 * Unified controller for Hustle Hub (extracted.html).
 * Orchestrates task rendering, filtering, and CRUD operations.
 */

import globals from '../core/globals.js';
import taskSystem from '../core/TaskSystem.js';
import SemesterService from '../services/SemesterService.js';
import storageService from '../services/StorageService.js';

const SUBSECTIONS = ['Revision', 'Assignment', 'Quizzes', 'Mid Term / OHT', 'Finals'];

class TasksController {
    constructor() {
        this.initialized = false;
        this.currentProject = null;
        this.currentSection = 'all';
        this.tasks = [];
        this.addModal = null;
    }

    async init() {
        if (this.initialized) return;
        
        console.log('[TasksController] Initializing...');

        // 1. Setup UI listeners
        this.setupEventListeners();

        // 2. Wait for system readiness
        await this.waitForSystem();

        // 3. Initial render
        this.refreshSidebar();
        
        // 4. Auto-selection logic
        const lastProject = storageService.get('last_project');
        const subjects = SemesterService.getCurrentSubjects() || [];
        
        if (lastProject && (lastProject === 'extra' || subjects.some(s => s.tag === lastProject))) {
            await this.selectProject(lastProject);
        } else if (subjects.length > 0) {
            await this.selectProject(subjects[0].tag);
        } else {
            await this.selectProject('extra');
        }

        this.initialized = true;
        console.log('[TasksController] ✅ Ready');
    }

    async waitForSystem() {
        if (window.gpace_services_ready) return true;
        
        return new Promise((resolve) => {
            const onReady = () => {
                window.removeEventListener('gpace-ready', onReady);
                resolve(true);
            };
            window.addEventListener('gpace-ready', onReady);
            
            // Timeout safety
            setTimeout(() => {
                if (window.gpace_services_ready) resolve(true);
                else {
                    console.warn('[TasksController] Service timeout');
                    resolve(false);
                }
            }, 3000);
        });
    }

    setupEventListeners() {
        document.addEventListener('click', async (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const projectId = target.dataset.project || this.currentProject;

            switch (action) {
                case 'select-project':
                    await this.selectProject(projectId);
                    break;
                case 'select-section':
                    this.setSection(target.dataset.section);
                    break;
                case 'show-task-form':
                    this.showAddTaskForm(target.dataset.section);
                    break;
                case 'add-task':
                    await this.handleAddTask();
                    break;
                case 'complete-task':
                    await this.handleCompleteTask(target.dataset.taskId);
                    break;
                case 'delete-task':
                    await this.handleDeleteTask(target.dataset.taskId);
                    break;
                case 'toggle-sidebar':
                    this.toggleSidebar();
                    break;
            }
        });
    }

    async selectProject(projectId) {
        console.log('[TasksController] Selecting project:', projectId);
        this.currentProject = projectId;
        this.updateActiveProjectUI(projectId);
        
        try {
            this.tasks = await taskSystem.getTasks(projectId);
            this.renderProjectHeader();
            this.renderTasks();
            storageService.set('last_project', projectId);
        } catch (e) {
            console.error('[TasksController] Error loading project tasks:', e);
        }
    }

    setSection(section) {
        this.currentSection = section;
        document.querySelectorAll('#sectionNav .btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === section);
        });
        this.renderTasks();
    }

    showAddTaskForm(section = null) {
        const modalEl = document.getElementById('addTaskForm');
        if (!this.addModal && window.bootstrap) {
            this.addModal = new bootstrap.Modal(modalEl);
        }
        if (section && section !== 'all') {
            document.getElementById('taskSection').value = section;
        }
        this.addModal?.show();
    }

    async handleAddTask() {
        const title = document.getElementById('taskTitle')?.value.trim();
        if (!title || !this.currentProject) return;

        const taskData = {
            title,
            description: document.getElementById('taskDescription')?.value || '',
            priority: document.getElementById('taskPriority')?.value || 'medium',
            section: document.getElementById('taskSection')?.value || 'Revision',
            createdAt: new Date().toISOString()
        };

        try {
            const task = await taskSystem.createTask(this.currentProject, taskData);
            this.tasks.push(task);
            this.renderTasks();
            this.addModal?.hide();
            
            // Reset form
            document.getElementById('taskTitle').value = '';
            document.getElementById('taskDescription').value = '';
        } catch (e) {
            console.error('[TasksController] Failed to add task:', e);
        }
    }

    async handleCompleteTask(taskId) {
        const taskEl = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
        if (taskEl) taskEl.classList.add('completing');

        try {
            if (await taskSystem.completeTask(this.currentProject, taskId)) {
                this.tasks = this.tasks.filter(t => String(t.id) !== String(taskId));
                setTimeout(() => this.renderTasks(), 400);
            }
        } catch (e) {
            console.error('[TasksController] Failed to complete task:', e);
            taskEl?.classList.remove('completing');
        }
    }

    async handleDeleteTask(taskId) {
        if (!confirm('Delete this task?')) return;
        
        try {
            if (await taskSystem.deleteTask(this.currentProject, taskId)) {
                this.tasks = this.tasks.filter(t => String(t.id) !== String(taskId));
                this.renderTasks();
            }
        } catch (e) {
            console.error('[TasksController] Failed to delete task:', e);
        }
    }

    refreshSidebar() {
        const list = document.getElementById('projectList');
        if (!list) return;

        const subjects = SemesterService.getCurrentSubjects() || [];
        
        if (subjects.length === 0) {
            list.innerHTML = `
                <div style="padding: 10px 20px; font-size: 12px; color: var(--dd-text-muted); opacity: 0.7;">
                    No subjects in current semester.
                    <br>
                    <a href="academic-details.html" style="color: var(--accent); text-decoration: none; margin-top: 4px; display: inline-block;">Manage Semesters</a>
                </div>
            `;
            return;
        }

        list.innerHTML = subjects.map(s => `
            <div class="project-item" data-project="${s.tag}" data-action="select-project">
                <i class="bi bi-journal-bookmark"></i>
                <span>${s.name}</span>
            </div>
        `).join('');
    }

    renderProjectHeader() {
        const header = document.getElementById('projectHeader');
        if (!header) return;

        let name = "Hustle Hub";
        if (this.currentProject === 'extra') name = "Extra Curricular";
        else {
            const subjects = SemesterService.getCurrentSubjects() || [];
            const current = subjects.find(s => s.tag === this.currentProject);
            if (current) name = current.name;
        }

        const sectionPill = this.currentSection !== 'all' 
            ? `<span class="chip" style="background: rgba(255,255,255,0.08); color: var(--dd-text-2); margin-left: 12px;">${this.currentSection}</span>`
            : '';

        header.innerHTML = `
            <div class="project-header">
                <div class="project-title-area">
                    <div class="project-icon"><i class="bi bi-folder2"></i></div>
                    <div>
                        <div class="d-flex align-items-center">
                            <h2 style="margin:0">${name}</h2>
                            ${sectionPill}
                        </div>
                        <div class="project-meta-pills" style="margin-top:8px">
                            <span class="chip synced"><i class="bi bi-cloud-check"></i> Cloud Active</span>
                        </div>
                    </div>
                </div>
                <div class="project-actions">
                    <button class="action-btn" data-action="analyze-notes" title="Analyze Notes"><i class="bi bi-magic"></i></button>
                    <button class="action-btn" data-action="view-history" title="History"><i class="bi bi-clock-history"></i></button>
                </div>
            </div>
        `;
    }

    renderTasks() {
        const container = document.getElementById('taskSections');
        if (!container) return;

        if (!this.currentProject) {
            container.innerHTML = `<div class="empty-state py-5"><i class="bi bi-arrow-left-circle"></i><h4>Select a subject</h4></div>`;
            return;
        }

        const sections = this.currentSection === 'all' ? SUBSECTIONS : [this.currentSection];
        container.innerHTML = sections.map(sec => {
            const filtered = this.tasks.filter(t => t.section === sec);
            return `
                <div class="section-container">
                    <div class="section-header">
                        <div class="section-title"><i class="bi ${this._getIcon(sec)}"></i><span>${sec}</span></div>
                        <div class="section-stats">${filtered.length} tasks</div>
                    </div>
                    <div class="section-content">
                        ${filtered.length > 0 ? filtered.map(t => this._tpl(t)).join('') : this._empty()}
                    </div>
                </div>
            `;
        }).join('');
    }

    _tpl(task) {
        const pColor = task.priority === 'high' ? '#ff3b30' : (task.priority === 'medium' ? '#ff9f0a' : '#34c759');
        return `
            <div class="task-item" data-task-id="${task.id}">
                <div class="subj-pip" style="background: ${pColor}"></div>
                <div class="completion-circle" data-action="complete-task" data-task-id="${task.id}"><i class="bi bi-check-lg"></i></div>
                <div class="task-content">
                    <div class="task-title" style="color:white; font-weight:600">${task.title}</div>
                    ${task.description ? `<div class="task-description" style="color:var(--dd-text-muted); font-size:13px">${task.description}</div>` : ''}
                </div>
                <div class="task-actions">
                    <button class="action-btn" title="Edit"><i class="bi bi-pencil"></i></button>
                    <button class="action-btn text-danger" data-action="delete-task" data-task-id="${task.id}"><i class="bi bi-trash"></i></button>
                </div>
            </div>
        `;
    }

    _empty() { return `<div class="empty-state py-4"><i class="bi bi-inbox" style="font-size: 2rem; opacity:0.3"></i><p style="color:var(--dd-text-muted)">No tasks in this section</p></div>`; }

    _getIcon(sec) {
        const map = { Revision:'bi-book', Assignment:'bi-file-earmark-text', Quizzes:'bi-question-circle', 'Mid Term / OHT':'bi-bar-chart-steps', Finals:'bi-trophy' };
        return map[sec] || 'bi-collection';
    }

    updateActiveProjectUI(id) {
        document.querySelectorAll('.project-item').forEach(el => el.classList.toggle('active', el.dataset.project === id));
    }

    toggleSidebar() {
        document.getElementById('projectsSidebar')?.classList.toggle('collapsed');
        document.getElementById('sidebarToggle')?.classList.toggle('collapsed');
        document.querySelector('.main-content')?.classList.toggle('full-width');
    }
}

const controller = new TasksController();
export default controller;

if (typeof window !== 'undefined') {
    window.TasksController = controller;
}

// Self-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => controller.init());
} else {
    controller.init();
}
