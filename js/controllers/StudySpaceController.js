/**
 * StudySpaceController - Handles study space CRUD, image upload, and Firestore sync
 */

class StudySpaceController {
    constructor() {
        this.studySpaces = [];
        this.currentImage = null;
        this.editingId = null;
        this.userId = 'default';
        this.syncStatus = {
            lastSynced: null,
            isSyncing: false,
            error: null
        };
    }

    /**
     * Initialize the controller
     */
    init() {
        this.setupUploadArea();
        this.setupFormHandlers();
        this.setupViewToggle();
        this.loadStudySpaces();
    }

    /**
     * Set user ID
     */
    setUserId(userId) {
        this.userId = userId;
    }

    /**
     * Setup the upload area with drag and drop
     */
    setupUploadArea() {
        const uploadArea = document.getElementById('studySpaceUpload');
        const spaceImageInput = document.getElementById('spaceImageInput');

        if (!uploadArea || !spaceImageInput) {
            console.warn('StudySpaceController: Upload elements not found');
            return;
        }

        // Drag and drop handlers
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.handleImageUpload(file);
            }
        });

        // Click upload
        uploadArea.addEventListener('click', () => {
            spaceImageInput.click();
        });

        spaceImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleImageUpload(file);
            }
        });
    }

    /**
     * Setup form submission and cancel handlers
     */
    setupFormHandlers() {
        const saveBtn = document.getElementById('saveStudySpace');
        const cancelBtn = document.getElementById('cancelStudySpace');

        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveStudySpace());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.resetForm());
        }
    }

    /**
     * Setup grid/list view toggle
     */
    setupViewToggle() {
        const gridBtn = document.getElementById('gridViewBtn');
        const listBtn = document.getElementById('listViewBtn');
        const container = document.getElementById('studySpacesContainer');

        if (gridBtn && listBtn && container) {
            gridBtn.addEventListener('click', () => {
                container.classList.remove('list-view');
                gridBtn.classList.add('active');
                listBtn.classList.remove('active');
            });

            listBtn.addEventListener('click', () => {
                container.classList.add('list-view');
                listBtn.classList.add('active');
                gridBtn.classList.remove('active');
            });
        }
    }

    /**
     * Handle image upload - read as base64.
     * Mirrors the preview into the modal-form preview slot;
     * the persistent add-tile keeps its design.
     */
    handleImageUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentImage = e.target.result;

            const form = document.querySelector('.study-space-form');
            if (form) form.style.display = 'block';

            const formPreview = document.getElementById('ssFormPreview');
            if (formPreview) {
                formPreview.innerHTML = `<img src="${this.currentImage}" alt="Study space preview">`;
                formPreview.style.display = '';
            }

            const modal = document.getElementById('studySpaceFormModal');
            if (modal) modal.classList.add('show');
        };
        reader.readAsDataURL(file);
    }

    /**
     * Save a new study space
     */
    async saveStudySpace() {
        const spaceName = document.getElementById('spaceName')?.value;
        const spaceLocation = document.getElementById('spaceLocation')?.value;
        const spaceDescription = document.getElementById('spaceDescription')?.value || '';
        const amenities = Array.from(document.querySelectorAll('.amenities input:checked'))
            .map(cb => cb.value);

        if (!spaceName || !spaceLocation) {
            this.showToast('Please fill in the name and location fields.', 'warning');
            return;
        }

        if (!this.currentImage) {
            this.showToast('Please upload an image of the study space.', 'warning');
            return;
        }

        const now = new Date().toISOString();

        if (this.editingId != null) {
            // Update existing entry, preserve createdAt
            const idx = this.studySpaces.findIndex(s => s.id === this.editingId);
            if (idx >= 0) {
                const prev = this.studySpaces[idx];
                this.studySpaces[idx] = {
                    ...prev,
                    name: spaceName,
                    location: spaceLocation,
                    description: spaceDescription,
                    amenities: amenities,
                    image: this.currentImage,
                    lastModified: now
                };
            }
            this.editingId = null;
        } else {
            this.studySpaces.push({
                id: Date.now(),
                name: spaceName,
                location: spaceLocation,
                description: spaceDescription,
                amenities: amenities,
                image: this.currentImage,
                createdAt: now,
                lastModified: now,
                userId: this.userId
            });
        }

        // Save to localStorage
        this.saveToLocalStorage();

        // Sync to Firestore
        await this.syncToFirestore();

        // Reset form
        this.resetForm();

        // Refresh display
        this.displayStudySpaces();

        // Show success
        this.showToast('Study space saved successfully!', 'success');
    }

    /**
     * Reset the form — clears fields, hides modal, restores ss-add tile markup
     */
    resetForm() {
        const spaceName = document.getElementById('spaceName');
        const spaceLocation = document.getElementById('spaceLocation');
        const spaceDescription = document.getElementById('spaceDescription');
        const form = document.querySelector('.study-space-form');

        if (spaceName) spaceName.value = '';
        if (spaceLocation) spaceLocation.value = '';
        if (spaceDescription) spaceDescription.value = '';

        document.querySelectorAll('.amenities input').forEach(cb => cb.checked = false);

        // Hide modal preview
        const formPreview = document.getElementById('ssFormPreview');
        if (formPreview) {
            formPreview.innerHTML = '';
            formPreview.style.display = 'none';
        }

        // Hide modal
        const modal = document.getElementById('studySpaceFormModal');
        if (modal) modal.classList.remove('show');

        // Keep the inline form in the DOM (lifted into the modal); the modal-class
        // controls visibility on the page.
        if (form) form.style.display = 'block';

        this.currentImage = null;
    }

    /**
     * Load study spaces from Firestore or localStorage
     * Waits for auth state to be ready before attempting Firestore operations
     */
    async loadStudySpaces() {
        try {
            // Wait for auth to be ready (either Firebase compat or modular)
            const waitForAuth = () => {
                return new Promise((resolve) => {
                    // Check if firebase.auth exists (compat SDK from HTML)
                    if (typeof firebase !== 'undefined' && firebase.auth) {
                        // Already have a user
                        if (firebase.auth().currentUser) {
                            resolve(firebase.auth().currentUser);
                            return;
                        }
                        // Wait for auth state change
                        const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
                            unsubscribe();
                            resolve(user);
                        });
                        // Timeout after 3 seconds
                        setTimeout(() => resolve(null), 3000);
                    } else if (window.auth && window.auth.currentUser) {
                        resolve(window.auth.currentUser);
                    } else {
                        // No auth available, resolve with null
                        setTimeout(() => resolve(null), 500);
                    }
                });
            };

            const user = await waitForAuth();

            if (!user) {
                console.log('StudySpaceController: No user signed in, loading from local storage only');
                // Fallback to localStorage
                const storage = window.getStorage ? window.getStorage() : {
                    get: (k, d) => { try { return JSON.parse(storageService.get(k)) ?? d; } catch { return d; } }
                };
                this.studySpaces = storage.get('studySpaces', []);
                this.displayStudySpaces();
                return;
            }

            // Try Firestore
            if (typeof window.loadStudySpacesFromFirestore === 'function') {
                this.setSyncStatus(true, null);
                const firestoreSpaces = await window.loadStudySpacesFromFirestore();

                if (firestoreSpaces && Array.isArray(firestoreSpaces)) {
                    this.studySpaces = firestoreSpaces;
                    this.setSyncStatus(false, null);
                    this.syncStatus.lastSynced = new Date();
                    this.updateSyncStatusUI();
                    this.displayStudySpaces();
                    return;
                }
            }

            // Fallback to localStorage
            const storage = window.getStorage ? window.getStorage() : {
                get: (k, d) => { try { return JSON.parse(storageService.get(k)) ?? d; } catch { return d; } }
            };
            this.studySpaces = storage.get('studySpaces', []);
            this.displayStudySpaces();

        } catch (error) {
            console.error('Error loading study spaces:', error);
            this.setSyncStatus(false, error.message);
            this.studySpaces = [];
            this.displayStudySpaces();
        }
    }

    /**
     * Pick a deterministic icon + hue for a card from its name.
     * Real-data-driven: same input → same visual identity, no randomness.
     */
    visualForSpace(space) {
        const icons = [
            'bi-book', 'bi-mortarboard', 'bi-laptop', 'bi-bookshelf',
            'bi-cup-hot', 'bi-tree', 'bi-building', 'bi-house-heart',
            'bi-pencil-square', 'bi-headphones', 'bi-graph-up', 'bi-braces'
        ];
        const seed = String(space.name || space.id || '');
        let h = 0;
        for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
        const icon = icons[Math.abs(h) % icons.length];
        // Hue palette aligned with the page accent (cyan/blue) ± neighbours
        const hues = [217, 195, 245, 175, 230, 200, 260, 185];
        const hue = hues[Math.abs(h >> 4) % hues.length];
        return { icon, hue };
    }

    /**
     * Display study spaces in the container — new card design,
     * fields all bound to real persisted study-space data.
     */
    displayStudySpaces() {
        const container = document.getElementById('studySpacesContainer');
        const noSpacesMessage = document.getElementById('noSpacesMessage');
        const addTile = document.getElementById('studySpaceUpload');

        if (!container) return;

        // Remove existing card nodes (preserve the persistent add-tile)
        container.querySelectorAll('.ss-card').forEach(n => n.remove());

        if (this.studySpaces.length === 0) {
            if (noSpacesMessage) {
                noSpacesMessage.classList.remove('d-none');
                noSpacesMessage.removeAttribute('hidden');
            }
        } else if (noSpacesMessage) {
            noSpacesMessage.classList.add('d-none');
            noSpacesMessage.setAttribute('hidden', '');
        }

        const frag = document.createDocumentFragment();

        this.studySpaces.forEach(space => {
            const { icon, hue } = this.visualForSpace(space);
            const card = document.createElement('article');
            card.className = 'ss-card';
            card.style.setProperty('--card-hue', hue);

            const amenityCount = Array.isArray(space.amenities) ? space.amenities.length : 0;
            const created = space.createdAt ? this.getTimeAgo(space.createdAt) : '—';
            const updated = space.lastModified ? this.getTimeAgo(space.lastModified) : created;
            const safeName = this.escapeHtml(space.name || 'Untitled space');
            const safeLoc  = this.escapeHtml(space.location || '');
            const amenitiesHtml = (space.amenities || [])
                .slice(0, 5)
                .map(a => `<span class="badge">${this.escapeHtml(a)}</span>`)
                .join('');

            card.innerHTML = `
                ${space.image ? `<div class="ss-card-thumb"><img src="${space.image}" alt="${safeName}"></div>` : ''}
                <div class="ss-card-top">
                    <div class="ss-icon"><i class="bi ${icon}"></i></div>
                    <div class="ss-actions">
                        <button class="ss-btn js-edit" aria-label="Edit"><i class="bi bi-pencil"></i></button>
                        <button class="ss-btn js-delete" aria-label="Delete"><i class="bi bi-trash"></i></button>
                    </div>
                </div>
                <h3 class="ss-name">${safeName}</h3>
                ${safeLoc ? `<p class="ss-loc"><i class="bi bi-geo-alt"></i>${safeLoc}</p>` : ''}
                ${amenitiesHtml ? `<div class="ss-amen">${amenitiesHtml}</div>` : ''}
                <div class="ss-meta">
                    <div><strong>${amenityCount}</strong><span>amenities</span></div>
                    <div><strong class="muted-strong">${created}</strong><span>added</span></div>
                    <div><strong class="muted-strong">${updated}</strong><span>last used</span></div>
                </div>
                <button type="button" class="ss-open js-open">
                    Open <i class="bi bi-arrow-right"></i>
                </button>
            `;

            card.querySelector('.js-delete')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteSpace(space.id);
            });
            card.querySelector('.js-edit')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editSpace(space);
            });
            card.querySelector('.js-open')?.addEventListener('click', () => this.showSpaceDetails(space));

            frag.appendChild(card);
        });

        // Insert before the add-tile so the "+" stays last
        if (addTile && addTile.parentNode === container) {
            container.insertBefore(frag, addTile);
        } else {
            container.appendChild(frag);
        }
    }

    /**
     * Open the form modal prefilled with the space's data and stash the editing id
     */
    editSpace(space) {
        this.editingId = space.id;
        const name = document.getElementById('spaceName');
        const loc  = document.getElementById('spaceLocation');
        const desc = document.getElementById('spaceDescription');
        if (name) name.value = space.name || '';
        if (loc)  loc.value  = space.location || '';
        if (desc) desc.value = space.description || '';
        document.querySelectorAll('.amenities input').forEach(cb => {
            cb.checked = (space.amenities || []).includes(cb.value);
        });
        const formPreview = document.getElementById('ssFormPreview');
        if (formPreview && space.image) {
            formPreview.innerHTML = `<img src="${space.image}" alt="Study space preview">`;
            formPreview.style.display = '';
        }
        this.currentImage = space.image || null;
        const modal = document.getElementById('studySpaceFormModal');
        if (modal) modal.classList.add('show');
    }

    /**
     * Show detail popover for a space (uses image preview as detail surface)
     */
    showSpaceDetails(space) {
        const w = window.open('', '_blank', 'width=720,height=560');
        if (!w) return;
        const safe = (s) => String(s ?? '').replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
        w.document.write(`
            <!doctype html><html><head><meta charset="utf-8"><title>${safe(space.name)}</title>
            <style>
                body{margin:0;font-family:Inter,system-ui,sans-serif;background:#050b18;color:#f1f5f9;padding:24px}
                img{width:100%;border-radius:12px;margin-bottom:16px;border:1px solid rgba(255,255,255,0.08)}
                h1{margin:0 0 8px;font-size:22px}
                p{color:#94a3b8;margin:4px 0}
                .badge{display:inline-block;padding:4px 10px;background:rgba(34,211,238,0.18);
                       border:1px solid rgba(34,211,238,0.32);color:#67e8f9;border-radius:6px;
                       font-size:11px;margin:4px 4px 0 0;text-transform:uppercase;letter-spacing:0.06em}
            </style></head><body>
            ${space.image ? `<img src="${space.image}" alt="">` : ''}
            <h1>${safe(space.name)}</h1>
            <p><strong>Location:</strong> ${safe(space.location)}</p>
            ${space.description ? `<p>${safe(space.description)}</p>` : ''}
            <div>${(space.amenities || []).map(a => `<span class="badge">${safe(a)}</span>`).join('')}</div>
            </body></html>
        `);
        w.document.close();
    }

    /**
     * Minimal HTML escape for user-provided strings injected into innerHTML
     */
    escapeHtml(s) {
        return String(s ?? '').replace(/[<>&"']/g, c => ({
            '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    /**
     * Delete a study space
     */
    async deleteSpace(id) {
        if (!confirm('Are you sure you want to delete this study space?')) {
            return;
        }

        // Remove from array
        this.studySpaces = this.studySpaces.filter(space => space.id !== id);

        // Update localStorage
        this.saveToLocalStorage();

        // Delete from Firestore
        if (typeof window.deleteStudySpaceFromFirestore === 'function') {
            try {
                this.setSyncStatus(true, null);
                await window.deleteStudySpaceFromFirestore(id);
                this.setSyncStatus(false, null);
                this.syncStatus.lastSynced = new Date();
            } catch (error) {
                console.error('Error deleting from Firestore:', error);
                this.setSyncStatus(false, error.message);
            }
        }

        // Update UI
        this.displayStudySpaces();
        this.updateSyncStatusUI();
        this.showToast('Study space deleted', 'success');
    }

    /**
     * Save to localStorage
     */
    saveToLocalStorage() {
        const storage = window.getStorage ? window.getStorage() : {
            set: (k, v) => storageService.set(k, v)
        };
        storage.set('studySpaces', this.studySpaces);
    }

    /**
     * Sync to Firestore
     */
    async syncToFirestore() {
        if (typeof window.saveStudySpacesToFirestore !== 'function') {
            console.warn('Firestore integration not available');
            return false;
        }

        try {
            this.setSyncStatus(true, null);
            const success = await window.saveStudySpacesToFirestore(this.studySpaces);

            if (success) {
                this.syncStatus.lastSynced = new Date();
                this.setSyncStatus(false, null);
                return true;
            } else {
                this.setSyncStatus(false, 'Failed to sync with Firestore');
                return false;
            }
        } catch (error) {
            console.error('Error syncing to Firestore:', error);
            this.setSyncStatus(false, error.message);
            return false;
        }
    }

    /**
     * Force sync now
     */
    async forceSync() {
        const success = await this.syncToFirestore();
        if (success) {
            this.showToast('Study spaces synced successfully!', 'success');
        } else {
            this.showToast('Failed to sync. Please try again.', 'danger');
        }
        this.updateSyncStatusUI();
        return success;
    }

    /**
     * Set sync status
     */
    setSyncStatus(isSyncing, error) {
        this.syncStatus.isSyncing = isSyncing;
        this.syncStatus.error = error;
        this.updateSyncStatusUI();
    }

    /**
     * Update sync status UI
     */
    updateSyncStatusUI() {
        const syncStatusEl = document.getElementById('syncStatus');
        const syncIndicator = document.getElementById('syncStatusIndicator');
        const syncText = document.getElementById('syncStatusText');

        if (syncIndicator && syncText) {
            if (this.syncStatus.isSyncing) {
                syncIndicator.innerHTML = '<i class="bi bi-arrow-repeat text-warning"></i>';
                syncText.textContent = 'Syncing...';
            } else if (this.syncStatus.error) {
                syncIndicator.innerHTML = '<i class="bi bi-exclamation-triangle-fill text-danger"></i>';
                syncText.textContent = 'Sync error';
            } else if (this.syncStatus.lastSynced) {
                syncIndicator.innerHTML = '<i class="bi bi-check-circle-fill text-success"></i>';
                syncText.textContent = `Synced ${this.getTimeAgo(this.syncStatus.lastSynced)}`;
            } else {
                syncIndicator.innerHTML = '<i class="bi bi-cloud text-muted"></i>';
                syncText.textContent = 'Not synced';
            }
        }

        if (syncStatusEl) {
            if (this.syncStatus.isSyncing) {
                syncStatusEl.innerHTML = '<span class="badge bg-warning"><i class="bi bi-arrow-repeat"></i> Syncing...</span>';
                syncStatusEl.classList.remove('d-none');
            } else if (this.syncStatus.lastSynced) {
                syncStatusEl.innerHTML = '<span class="badge bg-success"><i class="bi bi-cloud-check"></i> Synced</span>';
                syncStatusEl.classList.remove('d-none');
            }
        }
    }

    /**
     * Format date for display
     */
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString();
        } catch {
            return 'Unknown';
        }
    }

    /**
     * Get time ago string
     */
    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    /**
     * Show toast message
     */
    showToast(message, type = 'success') {
        const toastEl = document.getElementById('syncToast');
        if (!toastEl) {
            console.log(`[${type.toUpperCase()}] ${message}`);
            return;
        }

        const toastHeader = toastEl.querySelector('.toast-header');
        const toastBody = toastEl.querySelector('.toast-body');

        if (toastHeader) {
            toastHeader.className = `toast-header bg-${type} text-white`;
        }

        if (toastBody) {
            toastBody.textContent = message;
        }

        try {
            const toast = new bootstrap.Toast(toastEl);
            toast.show();
        } catch (e) {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.StudySpaceController = StudySpaceController;
}

