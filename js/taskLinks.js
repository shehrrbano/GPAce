/**
 * Task Links Management System
 * ===========================
 * Handles the storage, display, and management of links associated with tasks
 */

// Storage helper with fallback (use existing or create new)
if (typeof window.getStorage === 'undefined') {
    window.getStorage = () => window.StorageService || {
        get: (k, d) => { try { return JSON.parse(storageService.get(k)) ?? d; } catch { return d; } },
        set: (k, v) => storageService.set(k, v)
    };
}
// Note: Use window.getStorage() directly instead of creating a local const alias
// to avoid "Identifier 'getStorage' has already been declared" errors in global scope

class TaskLinksManager {
    constructor() {
        this.db = null;
        this.initializeFirestore();
    }

    async initializeFirestore() {
        // Check if already available
        if (window.db) {
            this.db = window.db;
            console.log("[TaskLinks] Connected to Firestore (Immediate)");
            return;
        }

        // Listen for the ready event
        window.addEventListener('firestore-ready', (e) => {
            this.db = e.detail.db;
            console.log("[TaskLinks] Connected to Firestore via Event");
        }, { once: true });

        // Fallback polling just in case the event was missed
        setTimeout(() => {
            if (!this.db && window.db) {
                this.db = window.db;
                console.log("[TaskLinks] Connected to Firestore (Fallback Polling)");
            }
        }, 2000);
    }

    async addLink(taskId, linkData) {
        console.log("Adding link for task:", taskId, linkData);

        if (!taskId || !linkData.url) {
            throw new Error('Invalid input: taskId and URL are required');
        }

        try {
            // Create link object
            const linkId = `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const link = {
                id: linkId,
                url: this.sanitizeUrl(linkData.url),
                title: linkData.title || this.extractTitle(linkData.url),
                type: this.getLinkType(linkData.url),
                addedAt: new Date().toISOString(),
                description: linkData.description || ''
            };

            // Update Local Storage
            const updateResult = await this.updateLocalStorage(taskId, link);
            if (!updateResult.success) {
                throw new Error(updateResult.error);
            }

            // Update Firestore
            await this.updateFirestore(taskId, link);

            // Broadcast update to other tabs
            if (window.crossTabSync) {
                window.crossTabSync.send('task-links-update', { taskId, action: 'add' });
            }

            return {
                success: true,
                link: link
            };
        } catch (error) {
            console.error('Error in addLink:', error);
            throw error;
        }
    }

    sanitizeUrl(url) {
        try {
            // Add https:// if no protocol is specified
            if (!url.match(/^[a-zA-Z]+:\/\//)) {
                url = 'https://' + url;
            }
            const urlObj = new URL(url);
            return urlObj.toString();
        } catch {
            throw new Error('Invalid URL format');
        }
    }

    getLinkType(url) {
        const urlLower = url.toLowerCase();

        if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
            return 'youtube';
        }
        if (urlLower.includes('docs.google.com') || urlLower.endsWith('.pdf') ||
            urlLower.endsWith('.doc') || urlLower.endsWith('.docx')) {
            return 'document';
        }
        if (urlLower.includes('github.com')) {
            return 'github';
        }
        if (urlLower.includes('medium.com') || urlLower.includes('dev.to') ||
            urlLower.includes('blog')) {
            return 'article';
        }
        return 'link';
    }

    extractTitle(url) {
        try {
            const urlObj = new URL(url);
            let title = urlObj.hostname.replace('www.', '');

            // For YouTube, try to get video ID
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                if (url.includes('youtube.com/watch')) {
                    title += ' - Video';
                } else if (url.includes('youtube.com/playlist')) {
                    title += ' - Playlist';
                }
            }

            return title;
        } catch {
            return url;
        }
    }

    async updateLocalStorage(taskId, link) {
        const storage = getStorage();
        try {
            console.log("Updating storage for task:", taskId);

            // Get current tasks
            const priorityTasks = storage.get('calculatedPriorityTasks', []);

            // Get the current task info from the DOM
            const taskInfo = document.querySelector('.task-info');
            if (!taskInfo) {
                throw new Error('Cannot find task info element');
            }

            const taskTitle = taskInfo.querySelector('.task-title')?.textContent?.trim() || '';
            const taskDetails = taskInfo.querySelector('.task-details')?.textContent?.trim() || '';
            const projectName = taskDetails.split('•')[1]?.trim() || '';
            const projectId = taskInfo.dataset.projectId;

            // Find task index using the same logic as interleaveTask
            let taskIndex = -1;
            for (let i = 0; i < priorityTasks.length; i++) {
                const task = priorityTasks[i];
                if ((task.title === taskTitle || task.title.trim() === taskTitle) &&
                    (task.projectId === projectId || task.projectName === projectName)) {
                    taskIndex = i;
                    break;
                }
            }

            if (taskIndex === -1) {
                console.error("Task not found in priority tasks:", { taskTitle, projectName, projectId });
                throw new Error('Task not found in priority list');
            }

            // Get task ID for TaskService
            const taskId = priorityTasks[taskIndex].id;

            // Add link to task
            if (!priorityTasks[taskIndex].links) {
                priorityTasks[taskIndex].links = [];
            }
            priorityTasks[taskIndex].links.push(link);

            // Use TaskService mediator for coordinated writes
            if (window.TaskService && typeof window.TaskService.updateTaskInPriority === 'function') {
                window.TaskService.updateTaskInPriority(taskId, { links: priorityTasks[taskIndex].links });
            } else {
                storage.set('calculatedPriorityTasks', priorityTasks);
                console.warn('[taskLinks] TaskService not available, using direct write');
            }

            // Update project tasks
            if (projectId) {
                const projectTasks = storage.get(`tasks-${projectId}`, []);
                const projectTaskIndex = projectTasks.findIndex(t =>
                    t.title === taskTitle || t.title.trim() === taskTitle
                );

                if (projectTaskIndex !== -1) {
                    if (!projectTasks[projectTaskIndex].links) {
                        projectTasks[projectTaskIndex].links = [];
                    }
                    projectTasks[projectTaskIndex].links.push(link);
                    storage.set(`tasks-${projectId}`, projectTasks);
                }
            }

            return { success: true };
        } catch (error) {
            console.error("Error updating storage:", error);
            return { success: false, error: error.message };
        }
    }

    async updateFirestore(taskId, link) {
        const storage = getStorage();
        try {
            if (!window.db || !window.firestore) {
                console.warn("Firestore not initialized, skipping Firestore update");
                return { success: false, error: "Firestore not initialized" };
            }

            const { doc, getDoc, setDoc } = window.firestore;

            // Get current user
            const user = window.auth?.currentUser;
            if (!user) {
                console.warn("No authenticated user, skipping Firestore update");
                return { success: false, error: "No authenticated user" };
            }

            const priorityTasks = storage.get('calculatedPriorityTasks', []);
            const task = priorityTasks.find(t => String(t.id) === String(taskId));

            if (!task) {
                throw new Error('Task not found for Firestore update');
            }

            const projectId = task.projectId;
            if (!projectId) {
                console.warn("No project ID for task, skipping Firestore update");
                return { success: false, error: "No project ID" };
            }

            // Path pattern: users/{uid}/tasks/{projectId}
            const taskDocRef = doc(window.db, 'users', user.uid, 'tasks', projectId);
            const docSnap = await getDoc(taskDocRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const tasks = data.tasks || [];
                const taskIndex = tasks.findIndex(t => String(t.id) === String(taskId));

                if (taskIndex !== -1) {
                    // Add link to the task's links array
                    if (!tasks[taskIndex].links) {
                        tasks[taskIndex].links = [];
                    }
                    tasks[taskIndex].links.push(link);
                    tasks[taskIndex].updatedAt = new Date().toISOString();

                    await setDoc(taskDocRef, {
                        tasks: tasks,
                        lastUpdated: new Date().toISOString(),
                        version: Date.now()
                    });

                    console.log(`[TaskLinks] Link added to task ${taskId} in Firestore`);
                    return { success: true };
                } else {
                    console.warn(`[TaskLinks] Task ${taskId} not found in Firestore document`);
                    return { success: false, error: "Task not found in Firestore" };
                }
            } else {
                console.warn(`[TaskLinks] No tasks document for project ${projectId}`);
                return { success: false, error: "Tasks document not found" };
            }
        } catch (error) {
            console.error('Firestore update failed:', error);
            return { success: false, error: error.message };
        }
    }


    renderLinks(taskId, container) {
        const storage = getStorage();
        console.log("Rendering links for task:", taskId);

        try {
            // Validate inputs
            if (!taskId) {
                console.error("Invalid task ID provided");
                return;
            }

            if (!container) {
                console.error("Container element not provided");
                return;
            }

            // Get the links list element
            const linksList = container.querySelector('.links-list');
            if (!linksList) {
                console.error("Links list element not found in container");
                return;
            }

            // Get priority tasks from storage
            const priorityTasks = storage.get('calculatedPriorityTasks', null);
            if (!priorityTasks) {
                console.warn("No priority tasks found in storage");
                linksList.innerHTML = '<div class="no-links-message">No tasks found. Please refresh the page.</div>';
                return;
            }

            console.log("Found priority tasks:", priorityTasks.length);

            // Find the task
            const task = priorityTasks.find(t => String(t.id) === String(taskId));
            if (!task) {
                console.error("Task not found for rendering links. Task ID:", taskId);
                linksList.innerHTML = '<div class="no-links-message">Task not found. Please refresh the page.</div>';
                return;
            }

            console.log("Found task:", task.title);

            // Check if task has links
            if (!task.links || task.links.length === 0) {
                console.log("No links found for task");
                linksList.innerHTML = '<div class="no-links-message">No links added yet. Click "Add New Link" to get started.</div>';
                return;
            }

            console.log("Found links:", task.links.length);

            // Render links
            linksList.innerHTML = task.links.map(link => {
                try {
                    return this.createLinkElement(link, taskId);
                } catch (linkError) {
                    console.error("Error creating link element:", linkError);
                    return `<div class="link-item error">Error displaying link: ${linkError.message}</div>`;
                }
            }).join('');

            console.log("Links rendered successfully");
        } catch (error) {
            console.error("Error rendering links:", error);
            if (container) {
                const linksList = container.querySelector('.links-list');
                if (linksList) {
                    linksList.innerHTML = `<div class="no-links-message">Error loading links: ${error.message}</div>`;
                }
            }
        }
    }

    createLinkElement(link, taskId) {
        try {
            if (!link || !link.id) {
                throw new Error('Invalid link object');
            }

            if (!taskId) {
                throw new Error('Task ID is required');
            }

            const typeIcons = {
                youtube: 'bi-youtube',
                document: 'bi-file-text',
                article: 'bi-newspaper',
                github: 'bi-github',
                link: 'bi-link-45deg'
            };

            // Ensure link has all required properties
            const safeLink = {
                id: link.id,
                url: link.url || '#',
                title: link.title || 'Untitled Link',
                type: link.type || 'link',
                description: link.description || ''
            };

            // Get hostname safely
            let hostname = '';
            try {
                hostname = new URL(safeLink.url).hostname;
            } catch (urlError) {
                console.warn('Invalid URL in link:', safeLink.url);
                hostname = 'invalid-url';
            }

            return `
                <div class="link-item ${safeLink.type}" data-link-id="${safeLink.id}">
                    <div class="link-icon">
                        <i class="bi ${typeIcons[safeLink.type] || typeIcons.link}"></i>
                    </div>
                    <div class="link-content">
                        <p class="link-title">${safeLink.title}</p>
                        <div class="link-url">
                            <a href="${safeLink.url}" target="_blank" rel="noopener noreferrer">
                                ${hostname}
                            </a>
                        </div>
                        ${safeLink.description ? `<div class="link-description">${safeLink.description}</div>` : ''}
                    </div>
                    <div class="link-actions">
                        <button onclick="window.open('${safeLink.url}', '_blank')"
                                title="Open link">
                            <i class="bi bi-box-arrow-up-right"></i>
                        </button>
                        <button onclick="taskLinksManager.removeLink('${taskId}', '${safeLink.id}')"
                                class="text-danger"
                                title="Remove link">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error creating link element:', error);
            return `
                <div class="link-item error" data-error="${error.message}">
                    <div class="link-icon">
                        <i class="bi bi-exclamation-triangle"></i>
                    </div>
                    <div class="link-content">
                        <p class="link-title">Error displaying link</p>
                        <div class="link-url">
                            <span class="text-danger">${error.message}</span>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    async removeLink(taskId, linkId) {
        const storage = getStorage();
        try {
            // Update storage
            const priorityTasks = storage.get('calculatedPriorityTasks', []);
            const taskIndex = priorityTasks.findIndex(t => String(t.id) === String(taskId));

            if (taskIndex === -1 || !priorityTasks[taskIndex].links) {
                throw new Error('Task or links not found');
            }

            const updatedLinks = priorityTasks[taskIndex].links.filter(l => l.id !== linkId);

            // Use TaskService mediator for coordinated writes
            if (window.TaskService && typeof window.TaskService.updateTaskInPriority === 'function') {
                window.TaskService.updateTaskInPriority(taskId, { links: updatedLinks });
            } else {
                priorityTasks[taskIndex].links = updatedLinks;
                storage.set('calculatedPriorityTasks', priorityTasks);
                console.warn('[taskLinks] TaskService not available, using direct write');
            }

            // Update project tasks
            const projectId = priorityTasks[taskIndex].projectId;
            if (projectId) {
                const projectTasks = storage.get(`tasks-${projectId}`, []);
                const projectTaskIndex = projectTasks.findIndex(t => String(t.id) === String(taskId));

                if (projectTaskIndex !== -1 && projectTasks[projectTaskIndex].links) {
                    projectTasks[projectTaskIndex].links = projectTasks[projectTaskIndex].links.filter(l => l.id !== linkId);
                    storage.set(`tasks-${projectId}`, projectTasks);
                }
            }

            // Update Firestore - FIXED: Use modular SDK style
            const user = window.auth?.currentUser;
            if (window.db && window.firestore && projectId && user) {
                try {
                    const { doc, getDoc, setDoc } = window.firestore;
                    const taskDocRef = doc(window.db, 'users', user.uid, 'tasks', projectId);
                    const docSnap = await getDoc(taskDocRef);

                    if (docSnap.exists) {
                        const data = docSnap.data();
                        const tasks = data.tasks || [];
                        const taskIndex = tasks.findIndex(t => String(t.id) === String(taskId));

                        if (taskIndex !== -1 && tasks[taskIndex].links) {
                            // Filter out the link to remove
                            tasks[taskIndex].links = tasks[taskIndex].links.filter(l => l.id !== linkId);
                            tasks[taskIndex].updatedAt = new Date().toISOString();

                            await setDoc(taskDocRef, {
                                tasks: tasks,
                                lastUpdated: new Date().toISOString(),
                                version: Date.now()
                            });

                            console.log(`[TaskLinks] Link removed from task ${taskId} in Firestore`);
                        }
                    }
                } catch (firestoreError) {
                    console.error('Error updating Firestore:', firestoreError);
                }
            }


            // Refresh the display
            const container = document.getElementById(`links-${taskId}`);
            if (container) {
                this.renderLinks(taskId, container);
            }

            // Broadcast update to other tabs
            if (window.crossTabSync) {
                window.crossTabSync.send('task-links-update', { taskId, action: 'remove', linkId });
            }

            return { success: true };
        } catch (error) {
            console.error('Error removing link:', error);
            return { success: false, error: error.message };
        }
    }
    toggleLinks(taskId) {
        const container = document.getElementById(`links-${taskId}`);
        if (!container) {
            console.error(`Links container not found for task ID: ${taskId}`);
            return;
        }
        container.classList.toggle('expanded');
        if (container.classList.contains('expanded')) {
            this.renderLinks(taskId, container);
        }
    }

    openAddLinkModal(taskId) {
        if (!taskId) throw new Error("Task ID is missing");

        // Create modal and overlay elements
        const overlayHtml = `<div class="modal-overlay"></div>`;
        const modalHtml = `
        <div class="add-link-modal">
            <h3>Add New Link</h3>
            <div class="add-link-form">
                <div class="form-group">
                    <label for="linkUrl">URL *</label>
                    <input type="url" id="linkUrl" placeholder="https://..." required>
                </div>
                <div class="form-group">
                    <label for="linkTitle">Title</label>
                    <input type="text" id="linkTitle" placeholder="Title (optional)">
                </div>
                <div class="form-group">
                    <label for="linkDescription">Description</label>
                    <textarea id="linkDescription" rows="3" placeholder="Description (optional)"></textarea>
                </div>
                <div class="modal-actions">
                    <button class="secondary" id="cancelLinkBtn">Cancel</button>
                    <button class="primary" id="saveLinkBtn">Save Link</button>
                </div>
            </div>
        </div>`;

        // Remove any existing modal and overlay
        const existingModal = document.querySelector('.add-link-modal');
        const existingOverlay = document.querySelector('.modal-overlay');
        if (existingModal) existingModal.remove();
        if (existingOverlay) existingOverlay.remove();

        // Add new modal and overlay to body
        document.body.insertAdjacentHTML('beforeend', overlayHtml);
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const overlay = document.querySelector('.modal-overlay');
        const modal = document.querySelector('.add-link-modal');

        // Show modal and overlay with a small delay to trigger animations
        setTimeout(() => {
            overlay.classList.add('active');
            modal.classList.add('active');
            const urlInput = document.getElementById('linkUrl');
            if (urlInput) urlInput.focus();
        }, 10);

        // Set up event listeners
        const handleClose = () => {
            modal.classList.remove('active');
            overlay.classList.remove('active');
            setTimeout(() => {
                modal.remove();
                overlay.remove();
            }, 300);
        };

        overlay.addEventListener('click', handleClose);
        document.getElementById('cancelLinkBtn').addEventListener('click', handleClose);

        document.getElementById('saveLinkBtn').addEventListener('click', async () => {
            const url = document.getElementById('linkUrl').value;
            const title = document.getElementById('linkTitle').value;
            const description = document.getElementById('linkDescription').value;

            if (!url) {
                const urlInput = document.getElementById('linkUrl');
                urlInput.style.borderColor = 'var(--error-color, #ff5555)';
                urlInput.style.boxShadow = '0 0 0 2px rgba(255, 85, 85, 0.2)';
                setTimeout(() => {
                    urlInput.style.borderColor = '';
                    urlInput.style.boxShadow = '';
                }, 800);
                urlInput.focus();
                return;
            }

            try {
                const result = await this.addLink(taskId, { url, title, description });
                if (result && result.success) {
                    // Refresh links
                    const container = document.getElementById(`links-${taskId}`);
                    if (container) this.renderLinks(taskId, container);

                    // Update count
                    const linksCountElement = document.querySelector(`.links-btn[onclick*="${taskId}"] .links-count`);
                    if (linksCountElement) {
                        const currentCount = parseInt(linksCountElement.textContent) || 0;
                        linksCountElement.textContent = currentCount + 1;
                    }

                    handleClose();
                }
            } catch (error) {
                console.error("Error adding link:", error);
                alert('Error adding link: ' + error.message);
            }
        });
    }
}

// Initialize globally
window.taskLinksManager = new TaskLinksManager();

// Task Links Management
const taskLinks = {
    // Save link to storage
    saveLink: async function (taskId, linkData) {
        const storage = getStorage();
        try {
            const tasksLinks = storage.get('taskLinks', {});
            if (!tasksLinks[taskId]) {
                tasksLinks[taskId] = [];
            }
            tasksLinks[taskId].push({
                ...linkData,
                id: Date.now(),
                createdAt: new Date().toISOString()
            });
            storage.set('taskLinks', tasksLinks);
            return true;
        } catch (error) {
            console.error('Error saving link:', error);
            return false;
        }
    },

    // Display links for a task
    display: function (taskId) {
        const storage = getStorage();
        const container = document.querySelector(`#links-${taskId} .links-list`);
        if (!container) return;

        const tasksLinks = storage.get('taskLinks', {});
        const links = tasksLinks[taskId] || [];

        container.innerHTML = links.map(link => `
            <div class="link-item ${this.getLinkType(link.url)}">
                <i class="bi ${this.getLinkIcon(link.url)} link-icon"></i>
                <div class="link-content">
                    <div class="link-title">${link.title}</div>
                    <div class="link-url">
                        <a href="${link.url}" target="_blank">${link.url}</a>
                    </div>
                    ${link.description ? `<div class="link-description">${link.description}</div>` : ''}
                </div>
                <div class="link-actions">
                    <button onclick="taskLinks.deleteLink('${taskId}', ${link.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    // Delete a link
    deleteLink: function (taskId, linkId) {
        const storage = getStorage();
        const tasksLinks = storage.get('taskLinks', {});
        if (tasksLinks[taskId]) {
            tasksLinks[taskId] = tasksLinks[taskId].filter(link => link.id !== linkId);
            storage.set('taskLinks', tasksLinks);
            this.display(taskId);
        }
    },

    // Helper function to determine link type
    getLinkType: function (url) {
        if (url.includes('youtube.com')) return 'youtube';
        if (url.includes('github.com')) return 'github';
        if (url.includes('.pdf')) return 'document';
        if (url.includes('medium.com') || url.includes('blog')) return 'article';
        return 'link';
    },

    // Helper function to get appropriate icon
    getLinkIcon: function (url) {
        if (url.includes('youtube.com')) return 'bi-youtube';
        if (url.includes('github.com')) return 'bi-github';
        if (url.includes('.pdf')) return 'bi-file-pdf';
        if (url.includes('medium.com') || url.includes('blog')) return 'bi-file-text';
        return 'bi-link-45deg';
    }
};

// Global functions for HTML access
window.saveTaskLink = async function (taskId, linkData) {
    await taskLinks.saveLink(taskId, linkData);
    taskLinks.display(taskId);
};

window.displayTaskLinks = function (taskId) {
    taskLinks.display(taskId);
};

// Global functions for task links UI
// Note: toggleTaskLinks is defined in grind.html to avoid conflicts
// This is the legacy implementation that's kept for backward compatibility
// but not used in grind.html
const legacyToggleTaskLinks = function (taskId) {
    console.log('Legacy toggleTaskLinks called for task ID:', taskId);
    const container = document.getElementById(`links-${taskId}`);
    if (container) {
        container.classList.toggle('expanded');
        // Initialize links display if container is expanded
        if (container.classList.contains('expanded')) {
            window.taskLinks.display(taskId);
        }
    }
};

// Global wrappers for compatibility
window.toggleTaskLinks = (taskId) => window.taskLinksManager.toggleLinks(taskId);
window.addNewLink = (taskId) => window.taskLinksManager.openAddLinkModal(taskId);
window.closeAddLinkModal = () => {
    const modal = document.querySelector('.add-link-modal');
    const overlay = document.querySelector('.modal-overlay');
    if (modal) modal.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    setTimeout(() => {
        if (modal) modal.remove();
        if (overlay) overlay.remove();
    }, 300);
};

