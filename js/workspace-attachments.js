/**
 * workspace-attachments.js
 * Handles task attachments and file previews
 */

// Storage helper with fallback (use existing or create new)
if (typeof window.getStorage === 'undefined') {
    window.getStorage = () => window.StorageService || {
        get: (k, d) => { try { return JSON.parse(storageService.get(k)) ?? d; } catch { return d; } },
        set: (k, v) => storageService.set(k, v)
    };
}
// Use window.getStorage() directly to avoid redeclaration errors

/**
 * WorkspaceAttachments class
 * Manages task attachments and file previews
 */
class WorkspaceAttachments {
    constructor() {
        this.taskSelector = document.getElementById('taskSelector');
        this.attachmentsContainer = document.getElementById('attachmentsContainer');
        this.currentTask = null;
        this.attachments = [];
        this.pdfJS = null;
    }

    async initialize() {
        await this.loadTasksForSelector();
        this.setupEventListeners();
        await this.initializePDFJS();
    }

    async initializePDFJS() {
        try {
            if (!window.pdfjsLib) {
                // Load PDF.js library
                await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');

                // Wait a moment to ensure the library is properly loaded
                await new Promise(resolve => setTimeout(resolve, 100));

                // Set worker source
                if (window.pdfjsLib) {
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                } else {
                    throw new Error('PDF.js library failed to load properly');
                }
            }

            this.pdfJS = window.pdfjsLib;
            console.log('PDF.js initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing PDF.js:', error);
            showToast('Error initializing PDF viewer. Falling back to Google Drive viewer.', 'error');
            return false;
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    setupEventListeners() {
        // Handle task selection change
        this.taskSelector.addEventListener('change', () => {
            const selectedTaskId = this.taskSelector.value;
            if (selectedTaskId) {
                this.loadTaskAttachments(selectedTaskId);
            } else {
                this.showNoAttachmentsMessage('Select a task to view its attachments');
            }
        });

        // Setup communication with parent window
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'loadTaskAttachments') {
                const { taskId } = event.data;
                if (taskId) {
                    this.taskSelector.value = taskId;
                    this.loadTaskAttachments(taskId);
                }
            }
        });
    }

    async loadTasksForSelector() {
        const storage = window.getStorage();
        try {
            // Load tasks from priority list
            const priorityTasks = storage.get('calculatedPriorityTasks', []);

            // Load all projects
            const subjects = storage.get('academicSubjects', []);

            const allTasks = [];

            // Add priority tasks first
            priorityTasks.forEach(task => {
                allTasks.push({
                    id: task.id,
                    title: `${task.title} (${task.projectName})`,
                    priority: true
                });
            });

            // Add other tasks
            for (const subject of subjects) {
                const projectId = subject.tag;
                try {
                    // Try to get tasks from storage first for speed
                    let tasks = storage.get(`tasks-${projectId}`, []);

                    // If no tasks in storage, try Firestore
                    if (!tasks.length && window.parent.loadTasksFromFirestore) {
                        tasks = await window.parent.loadTasksFromFirestore(projectId) || [];
                    }

                    // Add tasks to the combined list
                    tasks.forEach(task => {
                        // Don't add tasks that are already in the priority list
                        // FIXED: Use String() for ID normalization
                        if (!priorityTasks.some(pt => String(pt.id) === String(task.id))) {
                            allTasks.push({
                                id: task.id,
                                title: `${task.title} (${subject.name})`,
                                priority: false
                            });
                        }
                    });
                } catch (error) {
                    console.error(`Error loading tasks for ${projectId}:`, error);
                }
            }

            // Sort tasks (priority tasks first, then alphabetically)
            allTasks.sort((a, b) => {
                if (a.priority && !b.priority) return -1;
                if (!a.priority && b.priority) return 1;
                return a.title.localeCompare(b.title);
            });

            // Clear current options
            this.taskSelector.innerHTML = '<option value="">Select a task to view attachments</option>';

            // Add task options
            allTasks.forEach(task => {
                const option = document.createElement('option');
                option.value = task.id;
                option.textContent = task.title;
                option.dataset.priority = task.priority;
                if (task.priority) {
                    option.style.fontWeight = 'bold';
                }
                this.taskSelector.appendChild(option);
            });

        } catch (error) {
            console.error('Error loading tasks for selector:', error);
            showToast('Error loading tasks', 'error');
        }
    }

    async loadTaskAttachments(taskId) {
        this.currentTask = taskId;
        this.attachments = [];

        // Priority 1: Check for flashcards first (doesn't need Drive)
        try {
            // Get the full task object to access subtasks and links
            const storage = window.getStorage();
            let taskObject = null;
            
            // Search in priority tasks first
            const priorityTasks = storage.get('calculatedPriorityTasks', []);
            taskObject = priorityTasks.find(t => String(t.id) === String(taskId));
            
            // If not found, search in all projects
            if (!taskObject) {
                const subjects = storage.get('academicSubjects', []);
                for (const subject of subjects) {
                    const tasks = storage.get(`tasks-${subject.tag}`, []);
                    taskObject = tasks.find(t => String(t.id) === String(taskId));
                    if (taskObject) break;
                }
            }

            // Show initial connecting/loading for Drive-dependent parts
            this.attachmentsContainer.innerHTML = '<div class="loading-message"><i class="bi bi-arrow-clockwise"></i><p>Loading subtasks & links...</p></div>';

            // Check for flashcards
            let hasFlashcards = false;
            if (window.workspaceFlashcardIntegration) {
                const flashcardContainer = document.createElement('div');
                hasFlashcards = await window.workspaceFlashcardIntegration.renderFlashcards(taskId, flashcardContainer);
                if (hasFlashcards) {
                    this.attachmentsContainer.innerHTML = '';
                    this.attachmentsContainer.appendChild(flashcardContainer);
                }
            }

            if (!hasFlashcards) this.attachmentsContainer.innerHTML = '';

            // Render Subtasks if any
            if (taskObject && taskObject.subtasks && taskObject.subtasks.length > 0) {
                const subtaskSection = document.createElement('div');
                subtaskSection.className = 'attachment-section subtasks-section';
                subtaskSection.innerHTML = `<h4>Subtasks (${taskObject.subtasks.length})</h4>`;
                const subtaskList = document.createElement('div');
                subtaskList.className = 'subtask-list';
                this.renderSubtasksTo(taskObject.subtasks, subtaskList);
                subtaskSection.appendChild(subtaskList);
                this.attachmentsContainer.appendChild(subtaskSection);
            }

            // Render Links if any
            if (taskObject && taskObject.relevantLinks && taskObject.relevantLinks.length > 0) {
                const linkSection = document.createElement('div');
                linkSection.className = 'attachment-section links-section';
                linkSection.innerHTML = `<h4>Links (${taskObject.relevantLinks.length})</h4>`;
                const linkList = document.createElement('div');
                linkList.className = 'link-list';
                this.renderLinksTo(taskObject.relevantLinks, linkList);
                linkSection.appendChild(linkList);
                this.attachmentsContainer.appendChild(linkSection);
            }

            // --- DRIVE LOADING GATE ---
            const gDrive = window.parent.googleDriveAPI;
            if (gDrive) {
                const driveLoadingEl = document.createElement('div');
                driveLoadingEl.className = 'drive-loading-status';
                driveLoadingEl.innerHTML = '<i class="bi bi-cloud-arrow-down"></i> Connecting to Google Drive...';
                this.attachmentsContainer.appendChild(driveLoadingEl);

                // Wait for auth if not ready
                if (!gDrive.isAuthorized) {
                    try {
                        console.log('[Workspace] Drive not authorized, waiting for handshake...');
                        await gDrive.authorize(true); // Attempt silent auth first
                    } catch (authErr) {
                        console.warn('[Workspace] Silent auth failed, user action required:', authErr);
                        driveLoadingEl.innerHTML = '<button class="btn btn-sm btn-outline-primary" id="reconnectDriveBtn">Reconnect Google Drive</button>';
                        driveLoadingEl.querySelector('#reconnectDriveBtn').addEventListener('click', async () => {
                            driveLoadingEl.innerHTML = '<i class="bi bi-cloud-arrow-down"></i> Connecting...';
                            await gDrive.authorize();
                            this.loadTaskAttachments(taskId); // Reload
                        });
                        return; // Stop here if auth fails
                    }
                }

                // If we reach here, we are authorized
                driveLoadingEl.innerHTML = '<i class="bi bi-cloud-check"></i> Syncing files...';
                
                this.attachments = await gDrive.getTaskFiles(taskId);
                this.attachmentsContainer.removeChild(driveLoadingEl);

                if (this.attachments && this.attachments.length > 0) {
                    const fileSection = document.createElement('div');
                    fileSection.className = 'attachment-section files-section';
                    fileSection.innerHTML = '<h4>Files</h4>';
                    const fileContainer = document.createElement('div');
                    fileContainer.className = 'file-attachments-container';
                    fileSection.appendChild(fileContainer);
                    this.renderAttachmentsTo(fileContainer);
                    this.attachmentsContainer.appendChild(fileSection);

                    // --- ADD TO LIBRARY BUTTON (Legacy Parity) ---
                    const addToLibraryBtn = document.createElement('button');
                    addToLibraryBtn.className = 'btn-add-to-library';
                    addToLibraryBtn.innerHTML = '<i class="bi bi-plus-lg"></i> ADD TO LIBRARY';
                    addToLibraryBtn.addEventListener('click', () => {
                        window.parent.noteToTaskController?.openFilePicker();
                    });
                    this.attachmentsContainer.appendChild(addToLibraryBtn);

                } else if (!hasFlashcards && (!taskObject || (!taskObject.subtasks?.length && !taskObject.relevantLinks?.length))) {
                    this.showNoAttachmentsMessage('No files found for this task');
                }
            } else if (!hasFlashcards && (!taskObject || (!taskObject.subtasks?.length && !taskObject.relevantLinks?.length))) {
                throw new Error('Google Drive API not available');
            }
        } catch (error) {
            console.error('Error loading task attachments:', error);
            this.showNoAttachmentsMessage('Error loading attachments');
        }
    }

    renderAttachments() {
        this.attachmentsContainer.innerHTML = '';
        this.renderAttachmentsTo(this.attachmentsContainer);
    }

    renderAttachmentsTo(container) {
        this.attachments.forEach(file => {
            const card = document.createElement('div');
            card.className = 'attachment-card';

            // Create preview
            const preview = document.createElement('div');
            preview.className = 'attachment-preview';

            // Determine icon or preview based on file type
            if (file.mimeType.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = file.thumbnailLink || file.webContentLink;
                img.alt = file.name;
                preview.appendChild(img);
            } else {
                // Icon based on file type
                let iconClass = 'bi bi-file-earmark';
                if (file.mimeType === 'application/pdf') {
                    iconClass = 'bi bi-file-earmark-pdf';
                } else if (file.mimeType.includes('spreadsheet') || file.mimeType.includes('sheet')) {
                    iconClass = 'bi bi-file-earmark-spreadsheet';
                } else if (file.mimeType.includes('document') || file.mimeType.includes('word')) {
                    iconClass = 'bi bi-file-earmark-word';
                } else if (file.mimeType.includes('presentation') || file.mimeType.includes('powerpoint')) {
                    iconClass = 'bi bi-file-earmark-slides';
                } else if (file.mimeType.startsWith('audio/')) {
                    iconClass = 'bi bi-file-earmark-music';
                } else if (file.mimeType.startsWith('video/')) {
                    iconClass = 'bi bi-file-earmark-play';
                }

                const icon = document.createElement('i');
                icon.className = iconClass;
                preview.appendChild(icon);
            }

            // Create info section
            const info = document.createElement('div');
            info.className = 'attachment-info';

            const name = document.createElement('div');
            name.className = 'attachment-name';
            name.textContent = file.name;
            name.title = file.name;

            const meta = document.createElement('div');
            meta.className = 'attachment-meta';

            // Format date
            const date = new Date(file.createdTime);
            const dateStr = date.toLocaleDateString();

            meta.textContent = dateStr;

            info.appendChild(name);
            
            // Legacy Category Badges (Reference/Textbook)
            if (file.appProperties?.category) {
                const badge = document.createElement('span');
                badge.className = `category-badge badge-${file.appProperties.category}`;
                badge.textContent = file.appProperties.category;
                info.appendChild(badge);
            }

            info.appendChild(meta);

            // Create action buttons
            const actions = document.createElement('div');
            actions.className = 'attachment-actions';

            const openBtn = document.createElement('button');
            openBtn.className = 'attachment-action-btn';
            openBtn.innerHTML = '<i class="bi bi-eye"></i>';
            openBtn.title = 'Open';
            openBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openFile(file);
            });

            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'attachment-action-btn';
            downloadBtn.innerHTML = '<i class="bi bi-download"></i>';
            downloadBtn.title = 'Download';
            downloadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.downloadFile(file);
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'attachment-action-btn delete-btn';
            deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
            deleteBtn.title = 'Delete';
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await this.deleteFile(file);
            });

            actions.appendChild(openBtn);
            actions.appendChild(downloadBtn);
            actions.appendChild(deleteBtn);

            // Assemble the card
            card.appendChild(preview);
            card.appendChild(info);
            card.appendChild(actions);

            // Add click event to whole card
            card.addEventListener('click', () => {
                this.openFile(file);
            });

            container.appendChild(card);
        });
    }

    showNoAttachmentsMessage(message) {
        this.attachmentsContainer.innerHTML = `
            <div class="no-attachments-message">
                <i class="bi bi-file-earmark"></i>
                <p>${message}</p>
            </div>
        `;
    }

    openFile(file) {
        if (file.mimeType === 'application/pdf') {
            this.openPdfPreview(file);
        } else if (file.mimeType.startsWith('image/')) {
            this.openImagePreview(file);
        } else {
            // Open in Google Drive
            window.open(file.webViewLink, '_blank');
        }
    }

    downloadFile(file) {
        const link = document.createElement('a');
        link.href = file.webContentLink;
        link.download = file.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async openPdfPreview(file) {
        // Make sure PDF.js is initialized
        if (!this.pdfJS) {
            const initialized = await this.initializePDFJS();
            if (!initialized) {
                // If PDF.js initialization failed, go directly to fallback
                this.openPdfWithGoogleViewer(file);
                return;
            }
        }

        // Create or get PDF preview container
        let pdfPreview = document.getElementById('pdfPreview');
        if (!pdfPreview) {
            pdfPreview = document.createElement('div');
            pdfPreview.id = 'pdfPreview';
            pdfPreview.className = 'pdf-preview';
            pdfPreview.innerHTML = `
                <div class="pdf-preview-header">
                    <h4 class="pdf-preview-title">${file.name}</h4>
                    <button class="pdf-preview-close">&times;</button>
                </div>
                <div class="pdf-preview-content"></div>
                <div class="pdf-preview-footer">
                    <button class="pdf-nav-btn pdf-prev-btn"><i class="bi bi-chevron-left"></i> Previous</button>
                    <div class="pdf-page-info">Page <span class="pdf-current-page">1</span> of <span class="pdf-total-pages">-</span></div>
                    <button class="pdf-nav-btn pdf-next-btn">Next <i class="bi bi-chevron-right"></i></button>
                </div>
            `;
            document.body.appendChild(pdfPreview);

            // Add close button handler
            pdfPreview.querySelector('.pdf-preview-close').addEventListener('click', () => {
                pdfPreview.classList.remove('active');
            });
        } else {
            pdfPreview.querySelector('.pdf-preview-title').textContent = file.name;
            pdfPreview.querySelector('.pdf-preview-content').innerHTML = '';
            pdfPreview.querySelector('.pdf-current-page').textContent = '1';
            pdfPreview.querySelector('.pdf-total-pages').textContent = '-';
        }

        // Show the preview
        pdfPreview.classList.add('active');

        // Show loading indicator
        const contentDiv = pdfPreview.querySelector('.pdf-preview-content');
        contentDiv.innerHTML = `
            <div class="pdf-loading">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading PDF...</p>
            </div>
        `;

        // Try to load the PDF using PDF.js
        try {
            // First try to use direct webContentLink
            const loadingTask = this.pdfJS.getDocument(file.webContentLink);
            const pdf = await Promise.race([
                loadingTask.promise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('PDF loading timeout')), 5000))
            ]);

            // Update page count
            pdfPreview.querySelector('.pdf-total-pages').textContent = pdf.numPages;

            let currentPage = 1;

            const renderPage = async (pageNumber) => {
                // Get the page
                const page = await pdf.getPage(pageNumber);

                // Create a canvas for rendering
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                // Set scale based on container width
                const contentDiv = pdfPreview.querySelector('.pdf-preview-content');
                const viewport = page.getViewport({ scale: 1 });
                const containerWidth = contentDiv.clientWidth - 20; // Adjust for padding
                const scale = containerWidth / viewport.width;
                const scaledViewport = page.getViewport({ scale });

                // Set canvas dimensions
                canvas.height = scaledViewport.height;
                canvas.width = scaledViewport.width;
                canvas.className = 'pdf-preview-canvas';

                // Clear content div
                contentDiv.innerHTML = '';
                contentDiv.appendChild(canvas);

                // Render PDF page
                const renderContext = {
                    canvasContext: context,
                    viewport: scaledViewport
                };

                await page.render(renderContext).promise;

                // Update current page display
                pdfPreview.querySelector('.pdf-current-page').textContent = pageNumber;
            };

            // Render first page
            await renderPage(1);

            // Set up navigation buttons
            const prevBtn = pdfPreview.querySelector('.pdf-prev-btn');
            const nextBtn = pdfPreview.querySelector('.pdf-next-btn');

            prevBtn.addEventListener('click', async () => {
                if (currentPage > 1) {
                    currentPage--;
                    await renderPage(currentPage);
                }
            });

            nextBtn.addEventListener('click', async () => {
                if (currentPage < pdf.numPages) {
                    currentPage++;
                    await renderPage(currentPage);
                }
            });

        } catch (error) {
            console.error('Error loading PDF with PDF.js:', error);
            // Fallback to Google Drive's built-in viewer
            this.openPdfWithGoogleViewer(file, contentDiv, pdfPreview);
        }
    }

    // Helper method to open PDF with Google Drive viewer
    openPdfWithGoogleViewer(file, contentDiv = null, pdfPreview = null) {
        try {
            // Create container if not provided
            if (!pdfPreview) {
                pdfPreview = document.createElement('div');
                pdfPreview.id = 'pdfPreview';
                pdfPreview.className = 'pdf-preview';
                pdfPreview.innerHTML = `
                    <div class="pdf-preview-header">
                        <h4 class="pdf-preview-title">${file.name}</h4>
                        <button class="pdf-preview-close">&times;</button>
                    </div>
                    <div class="pdf-preview-content"></div>
                `;
                document.body.appendChild(pdfPreview);

                // Add close button handler
                pdfPreview.querySelector('.pdf-preview-close').addEventListener('click', () => {
                    pdfPreview.classList.remove('active');
                });

                // Show the preview
                pdfPreview.classList.add('active');

                // Get content div
                contentDiv = pdfPreview.querySelector('.pdf-preview-content');
            }

            // Use Google Drive's embedded viewer
            const viewerUrl = file.webViewLink.replace('/view', '/preview');

            // Update the content with an iframe
            contentDiv.innerHTML = `
                <div class="pdf-iframe-container">
                    <iframe
                        src="${viewerUrl}"
                        width="100%"
                        height="100%"
                        frameborder="0"
                        allowfullscreen
                        allow="autoplay"
                    ></iframe>
                </div>
            `;

            // Hide the navigation buttons if they exist
            const footer = pdfPreview.querySelector('.pdf-preview-footer');
            if (footer) {
                footer.style.display = 'none';
            }

        } catch (fallbackError) {
            console.error('Error with Google Drive viewer:', fallbackError);
            if (contentDiv) {
                contentDiv.innerHTML = `
                    <div class="pdf-error">
                        <p>Error loading PDF. <a href="${file.webViewLink}" target="_blank">Open in Google Drive</a></p>
                    </div>
                `;
            } else {
                // If all else fails, just open in a new tab
                window.open(file.webViewLink, '_blank');
            }
        }
    }

    openImagePreview(file) {
        // Create modal for image preview
        let imagePreview = document.getElementById('imagePreview');
        if (!imagePreview) {
            imagePreview = document.createElement('div');
            imagePreview.id = 'imagePreview';
            imagePreview.className = 'pdf-preview';  // Reuse the same styling
            imagePreview.innerHTML = `
                <div class="pdf-preview-header">
                    <h4 class="pdf-preview-title">${file.name}</h4>
                    <button class="pdf-preview-close">&times;</button>
                </div>
                <div class="pdf-preview-content">
                    <img src="${file.webContentLink}" alt="${file.name}" style="max-width: 100%; max-height: 80vh;">
                </div>
            `;
            document.body.appendChild(imagePreview);

            // Add close button handler
            imagePreview.querySelector('.pdf-preview-close').addEventListener('click', () => {
                imagePreview.classList.remove('active');
            });
        } else {
            imagePreview.querySelector('.pdf-preview-title').textContent = file.name;
            imagePreview.querySelector('img').src = file.webContentLink;
            imagePreview.querySelector('img').alt = file.name;
        }

        // Show the preview
        imagePreview.classList.add('active');
    }

    renderSubtasksTo(subtasks, container) {
        subtasks.forEach(subtask => {
            const item = document.createElement('div');
            item.className = 'subtask-item';
            item.innerHTML = `
                <div class="subtask-checkbox ${subtask.completed ? 'completed' : ''}">
                    <i class="bi ${subtask.completed ? 'bi-check-circle-fill' : 'bi-circle'}"></i>
                </div>
                <div class="subtask-title">${subtask.title}</div>
            `;
            container.appendChild(item);
        });
    }

    renderLinksTo(links, container) {
        links.forEach(link => {
            const item = document.createElement('div');
            item.className = 'link-item';
            item.innerHTML = `
                <div class="link-icon"><i class="bi bi-link-45deg"></i></div>
                <div class="link-info">
                    <div class="link-title">${link.title}</div>
                    <div class="link-url text-truncate">${link.url}</div>
                </div>
                <button class="link-action-btn" onclick="window.open('${link.url}', '_blank')">
                    <i class="bi bi-box-arrow-up-right"></i>
                </button>
            `;
            container.appendChild(item);
        });
    }

    // Add new method for file deletion
    async deleteFile(file) {
        if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
            try {
                // Show loading state
                showToast('Deleting file...', 'info');

                // Call parent window's Google Drive API delete method
                await window.parent.googleDriveAPI.deleteFile(file.id);

                // Show success message
                showToast('File deleted successfully', 'success');

                // Refresh the attachments list
                await this.loadTaskAttachments(this.currentTask);
            } catch (error) {
                console.error('Error deleting file:', error);
                showToast('Error deleting file: ' + error.message, 'error');
            }
        }
    }
}

// Export the class for other modules
window.WorkspaceAttachments = WorkspaceAttachments;

