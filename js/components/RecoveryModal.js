/**
 * RecoveryModal.js
 * 
 * Recovery modal shown when data is empty but backups exist.
 * Forces user to acknowledge recovery before continuing.
 * 
 * @version 1.0.0
 * @created December 12, 2025
 */

class RecoveryModal {
    static _instance = null;
    static _container = null;
    static _backups = [];
    static _reason = null;
    static _resolveCallback = null;

    /**
     * Initialize the recovery modal.
     */
    static init() {
        if (this._instance) return;

        this._createStyles();
        this._createDOM();
        this._setupEventListeners();

        this._instance = true;
        console.log('[RecoveryModal] Initialized');
    }

    /**
     * Create component styles.
     */
    static _createStyles() {
        if (document.getElementById('gpac-recovery-modal-styles')) return;

        const style = document.createElement('style');
        style.id = 'gpac-recovery-modal-styles';
        style.textContent = `
            .gpac-recovery-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.92);
                z-index: 99999;
                justify-content: center;
                align-items: center;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            }
            
            .gpac-recovery-overlay.active {
                display: flex;
            }
            
            .gpac-recovery-modal {
                background: linear-gradient(180deg, #1a1f2e 0%, #0f1419 100%);
                border: 2px solid #9B59B6;
                border-radius: 20px;
                padding: 40px;
                max-width: 550px;
                width: 90%;
                text-align: center;
                box-shadow: 0 30px 80px rgba(155, 89, 182, 0.3);
            }
            
            .gpac-recovery-icon {
                font-size: 72px;
                margin-bottom: 24px;
                display: block;
                animation: gpac-float 2s ease-in-out infinite;
            }
            
            @keyframes gpac-float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            
            .gpac-recovery-title {
                font-size: 28px;
                font-weight: 700;
                color: #e8e8e8;
                margin: 0 0 12px;
            }
            
            .gpac-recovery-subtitle {
                font-size: 16px;
                color: #9B59B6;
                margin: 0 0 24px;
            }
            
            .gpac-recovery-message {
                color: #a0a0a0;
                line-height: 1.6;
                margin-bottom: 32px;
            }
            
            .gpac-recovery-backups {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 32px;
                text-align: left;
            }
            
            .gpac-recovery-backup-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 16px;
                background: rgba(155, 89, 182, 0.1);
                border: 1px solid rgba(155, 89, 182, 0.2);
                border-radius: 8px;
                margin-bottom: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .gpac-recovery-backup-item:last-child {
                margin-bottom: 0;
            }
            
            .gpac-recovery-backup-item:hover {
                background: rgba(155, 89, 182, 0.2);
                border-color: #9B59B6;
            }
            
            .gpac-recovery-backup-item.selected {
                background: rgba(155, 89, 182, 0.3);
                border-color: #9B59B6;
            }
            
            .gpac-recovery-backup-info {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .gpac-recovery-backup-slot {
                font-weight: 600;
                color: #e8e8e8;
                font-size: 14px;
            }
            
            .gpac-recovery-backup-date {
                font-size: 12px;
                color: #a0a0a0;
            }
            
            .gpac-recovery-backup-count {
                background: #9B59B6;
                color: white;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .gpac-recovery-actions {
                display: flex;
                gap: 16px;
                justify-content: center;
            }
            
            .gpac-recovery-btn {
                padding: 16px 32px;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                border: none;
            }
            
            .gpac-recovery-btn-restore {
                background: linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%);
                color: white;
            }
            
            .gpac-recovery-btn-restore:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(155, 89, 182, 0.4);
            }
            
            .gpac-recovery-btn-restore:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none;
            }
            
            .gpac-recovery-btn-skip {
                background: rgba(255, 255, 255, 0.1);
                color: #a0a0a0;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .gpac-recovery-btn-skip:hover {
                background: rgba(255, 255, 255, 0.15);
                color: #e8e8e8;
            }
            
            .gpac-recovery-warning {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 12px;
                background: rgba(231, 76, 60, 0.1);
                border-radius: 8px;
                margin-top: 24px;
                font-size: 12px;
                color: #E74C3C;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Create DOM elements.
     */
    static _createDOM() {
        if (document.getElementById('gpac-recovery-overlay')) return;

        this._container = document.createElement('div');
        this._container.id = 'gpac-recovery-overlay';
        this._container.className = 'gpac-recovery-overlay';

        this._container.innerHTML = `
            <div class="gpac-recovery-modal">
                <span class="gpac-recovery-icon">🔮</span>
                <h2 class="gpac-recovery-title">We Found Your Tasks!</h2>
                <p class="gpac-recovery-subtitle" id="gpac-recovery-reason">Backup recovery available</p>
                
                <p class="gpac-recovery-message">
                    Your task data appears to be empty or corrupted, but we found backup copies.
                    Select a backup to restore your tasks.
                </p>
                
                <div class="gpac-recovery-backups" id="gpac-recovery-backups">
                    <!-- Backup items will be inserted here -->
                </div>
                
                <div class="gpac-recovery-actions">
                    <button class="gpac-recovery-btn gpac-recovery-btn-restore" id="gpac-recovery-restore" disabled>
                        ✨ Restore Selected
                    </button>
                    <button class="gpac-recovery-btn gpac-recovery-btn-skip" id="gpac-recovery-skip">
                        Start Fresh
                    </button>
                </div>
                
                <div class="gpac-recovery-warning">
                    <span>⚠️</span>
                    <span>Starting fresh will permanently lose any unsaved changes</span>
                </div>
            </div>
        `;

        document.body.appendChild(this._container);
    }

    /**
     * Show the recovery modal.
     * @param {Array} backups - Available backup slots
     * @param {string} [reason] - Reason for recovery ('corruption' | 'empty')
     * @returns {Promise<{action: string, slot?: string}>} User's choice
     */
    static show(backups, reason = 'empty') {
        return new Promise((resolve) => {
            this.init();

            this._backups = backups;
            this._reason = reason;
            this._resolveCallback = resolve;

            // Update reason text
            const reasonEl = document.getElementById('gpac-recovery-reason');
            if (reasonEl) {
                if (reason === 'corruption') {
                    reasonEl.textContent = 'Data corruption detected - recovery required';
                } else {
                    reasonEl.textContent = 'Backup recovery available';
                }
            }

            // Render backups
            this._renderBackups();

            // Show modal
            this._container.classList.add('active');

            // Notify sync indicator
            if (window.SyncStatusIndicator) {
                window.SyncStatusIndicator.setState('recovering');
            }
        });
    }

    /**
     * Hide the modal.
     */
    static hide() {
        if (this._container) {
            this._container.classList.remove('active');
        }
    }

    /**
     * Render backup options.
     */
    static _renderBackups() {
        const container = document.getElementById('gpac-recovery-backups');
        if (!container) return;

        if (this._backups.length === 0) {
            container.innerHTML = `
                <p style="color: #a0a0a0; text-align: center;">No backups available</p>
            `;
            return;
        }

        const slotLabels = {
            'latest': '🕐 Latest Backup',
            '1h': '⏰ 1 Hour Ago',
            '6h': '📅 6 Hours Ago',
            '24h': '📆 24 Hours Ago',
            'manual': '💾 Manual Backup'
        };

        container.innerHTML = this._backups.map((backup, idx) => `
            <div class="gpac-recovery-backup-item ${idx === 0 ? 'selected' : ''}" data-slot="${backup.slot}">
                <div class="gpac-recovery-backup-info">
                    <span class="gpac-recovery-backup-slot">${slotLabels[backup.slot] || backup.slot}</span>
                    <span class="gpac-recovery-backup-date">${new Date(backup.createdAt).toLocaleString()}</span>
                </div>
                <span class="gpac-recovery-backup-count">${backup.taskCount} tasks</span>
            </div>
        `).join('');

        // Enable restore button if we have backups
        const restoreBtn = document.getElementById('gpac-recovery-restore');
        if (restoreBtn && this._backups.length > 0) {
            restoreBtn.disabled = false;
        }
    }

    /**
     * Get selected backup slot.
     */
    static _getSelectedSlot() {
        const selected = this._container?.querySelector('.gpac-recovery-backup-item.selected');
        return selected?.dataset.slot || null;
    }

    /**
     * Set up event listeners.
     */
    static _setupEventListeners() {
        // Listen for recovery events
        window.addEventListener('gpac_recovery_needed', (e) => {
            this.show(e.detail?.backups || [], e.detail?.reason);
        });

        // Backup item clicks
        document.addEventListener('click', (e) => {
            const item = e.target.closest('.gpac-recovery-backup-item');
            if (item) {
                // Deselect all
                this._container?.querySelectorAll('.gpac-recovery-backup-item').forEach(i => {
                    i.classList.remove('selected');
                });
                // Select this one
                item.classList.add('selected');
            }
        });

        // Restore button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'gpac-recovery-restore') {
                const slot = this._getSelectedSlot();
                if (slot) {
                    this.hide();
                    if (this._resolveCallback) {
                        this._resolveCallback({ action: 'restore', slot });
                        this._resolveCallback = null;
                    }

                    // Perform recovery
                    if (window.TaskRepository) {
                        window.TaskRepository.forceRecoveryFromBackup(slot);
                        setTimeout(() => location.reload(), 500);
                    }
                }
            }
        });

        // Skip button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'gpac-recovery-skip') {
                // Confirm skip
                const confirmed = confirm(
                    'Are you sure you want to start fresh?\n\n' +
                    'This will NOT restore your backed up tasks. ' +
                    'You can still recover them later from Settings.'
                );

                if (confirmed) {
                    this.hide();
                    if (this._resolveCallback) {
                        this._resolveCallback({ action: 'skip' });
                        this._resolveCallback = null;
                    }

                    // Update sync indicator
                    if (window.SyncStatusIndicator) {
                        window.SyncStatusIndicator.synced();
                    }
                }
            }
        });

        // Prevent closing with Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this._container?.classList.contains('active')) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }
}

// Auto-init when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        // document.addEventListener('DOMContentLoaded', () => // RecoveryModal.init());
    } else {
        // RecoveryModal.init();
    }
}

// Export
export default RecoveryModal;
export { RecoveryModal };

if (typeof window !== 'undefined') {
    window.RecoveryModal = RecoveryModal;
}
