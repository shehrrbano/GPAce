/**
 * ConflictModal.js
 * 
 * Non-dismissable conflict resolution modal.
 * Forces user to resolve data conflicts before continuing.
 * 
 * @version 1.0.0
 * @created December 12, 2025
 */

class ConflictModal {
    static _instance = null;
    static _container = null;
    static _remoteData = null;
    static _localData = null;
    static _resolveCallback = null;

    /**
     * Initialize the conflict modal.
     */
    static init() {
        if (this._instance) return;

        this._createStyles();
        this._createDOM();
        this._setupEventListeners();

        this._instance = true;
        console.log('[ConflictModal] Initialized');
    }

    /**
     * Create component styles.
     */
    static _createStyles() {
        if (document.getElementById('gpac-conflict-modal-styles')) return;

        const style = document.createElement('style');
        style.id = 'gpac-conflict-modal-styles';
        style.textContent = `
            .gpac-conflict-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.9);
                z-index: 99999;
                justify-content: center;
                align-items: center;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            }
            
            .gpac-conflict-overlay.active {
                display: flex;
            }
            
            .gpac-conflict-modal {
                background: #1a1a2e;
                border: 2px solid #E74C3C;
                border-radius: 16px;
                padding: 32px;
                max-width: 600px;
                width: 90%;
                max-height: 85vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(231, 76, 60, 0.3);
            }
            
            .gpac-conflict-header {
                display: flex;
                align-items: center;
                gap: 16px;
                margin-bottom: 24px;
                padding-bottom: 16px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .gpac-conflict-icon {
                font-size: 48px;
                animation: gpac-shake 0.5s ease-in-out infinite;
            }
            
            @keyframes gpac-shake {
                0%, 100% { transform: rotate(-5deg); }
                50% { transform: rotate(5deg); }
            }
            
            .gpac-conflict-title {
                font-size: 24px;
                font-weight: 700;
                color: #E74C3C;
                margin: 0;
            }
            
            .gpac-conflict-subtitle {
                font-size: 14px;
                color: #a0a0a0;
                margin: 4px 0 0;
            }
            
            .gpac-conflict-message {
                color: #e8e8e8;
                line-height: 1.6;
                margin-bottom: 24px;
            }
            
            .gpac-conflict-details {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 24px;
            }
            
            .gpac-conflict-detail-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                font-size: 13px;
            }
            
            .gpac-conflict-detail-row:last-child {
                border-bottom: none;
            }
            
            .gpac-conflict-detail-label {
                color: #a0a0a0;
            }
            
            .gpac-conflict-detail-value {
                color: #e8e8e8;
                font-weight: 500;
            }
            
            .gpac-conflict-options {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .gpac-conflict-btn {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px 20px;
                border-radius: 12px;
                border: 2px solid transparent;
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: left;
            }
            
            .gpac-conflict-btn-icon {
                font-size: 24px;
            }
            
            .gpac-conflict-btn-text {
                flex: 1;
            }
            
            .gpac-conflict-btn-title {
                font-size: 15px;
                font-weight: 600;
                margin-bottom: 4px;
            }
            
            .gpac-conflict-btn-desc {
                font-size: 12px;
                opacity: 0.7;
            }
            
            .gpac-conflict-btn-local {
                background: rgba(39, 174, 96, 0.15);
                border-color: rgba(39, 174, 96, 0.3);
                color: #27AE60;
            }
            
            .gpac-conflict-btn-local:hover {
                background: rgba(39, 174, 96, 0.25);
                border-color: #27AE60;
            }
            
            .gpac-conflict-btn-remote {
                background: rgba(52, 152, 219, 0.15);
                border-color: rgba(52, 152, 219, 0.3);
                color: #3498DB;
            }
            
            .gpac-conflict-btn-remote:hover {
                background: rgba(52, 152, 219, 0.25);
                border-color: #3498DB;
            }
            
            .gpac-conflict-btn-merge {
                background: rgba(155, 89, 182, 0.15);
                border-color: rgba(155, 89, 182, 0.3);
                color: #9B59B6;
            }
            
            .gpac-conflict-btn-merge:hover {
                background: rgba(155, 89, 182, 0.25);
                border-color: #9B59B6;
            }
            
            .gpac-conflict-btn-diff {
                background: rgba(241, 196, 15, 0.15);
                border-color: rgba(241, 196, 15, 0.3);
                color: #F1C40F;
            }
            
            .gpac-conflict-btn-diff:hover {
                background: rgba(241, 196, 15, 0.25);
                border-color: #F1C40F;
            }
            
            .gpac-conflict-warning {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px;
                background: rgba(231, 76, 60, 0.1);
                border-radius: 8px;
                margin-top: 24px;
                font-size: 12px;
                color: #E74C3C;
            }
            
            .gpac-diff-view {
                display: none;
                max-height: 300px;
                overflow-y: auto;
                background: rgba(0, 0, 0, 0.4);
                border-radius: 8px;
                padding: 16px;
                margin-top: 16px;
                font-family: monospace;
                font-size: 12px;
            }
            
            .gpac-diff-view.active {
                display: block;
            }
            
            .gpac-diff-local {
                color: #27AE60;
            }
            
            .gpac-diff-remote {
                color: #3498DB;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Create DOM elements.
     */
    static _createDOM() {
        if (document.getElementById('gpac-conflict-overlay')) return;

        this._container = document.createElement('div');
        this._container.id = 'gpac-conflict-overlay';
        this._container.className = 'gpac-conflict-overlay';

        this._container.innerHTML = `
            <div class="gpac-conflict-modal">
                <div class="gpac-conflict-header">
                    <span class="gpac-conflict-icon">⚠️</span>
                    <div>
                        <h2 class="gpac-conflict-title">Data Conflict Detected</h2>
                        <p class="gpac-conflict-subtitle">Changes were made on another device</p>
                    </div>
                </div>
                
                <p class="gpac-conflict-message">
                    Your tasks have been modified on another device or browser tab. 
                    To prevent data loss, please choose how to resolve this conflict.
                </p>
                
                <div class="gpac-conflict-details">
                    <div class="gpac-conflict-detail-row">
                        <span class="gpac-conflict-detail-label">This Device</span>
                        <span class="gpac-conflict-detail-value" id="gpac-local-info">Loading...</span>
                    </div>
                    <div class="gpac-conflict-detail-row">
                        <span class="gpac-conflict-detail-label">Other Device</span>
                        <span class="gpac-conflict-detail-value" id="gpac-remote-info">Loading...</span>
                    </div>
                    <div class="gpac-conflict-detail-row">
                        <span class="gpac-conflict-detail-label">Time Difference</span>
                        <span class="gpac-conflict-detail-value" id="gpac-time-diff">Calculating...</span>
                    </div>
                </div>
                
                <div class="gpac-conflict-options">
                    <button class="gpac-conflict-btn gpac-conflict-btn-local" data-action="local">
                        <span class="gpac-conflict-btn-icon">💻</span>
                        <div class="gpac-conflict-btn-text">
                            <div class="gpac-conflict-btn-title">Keep THIS Device</div>
                            <div class="gpac-conflict-btn-desc">Use your current local changes, discard remote changes</div>
                        </div>
                    </button>
                    
                    <button class="gpac-conflict-btn gpac-conflict-btn-remote" data-action="remote">
                        <span class="gpac-conflict-btn-icon">☁️</span>
                        <div class="gpac-conflict-btn-text">
                            <div class="gpac-conflict-btn-title">Keep OTHER Device</div>
                            <div class="gpac-conflict-btn-desc">Use changes from the other device/tab</div>
                        </div>
                    </button>
                    
                    <button class="gpac-conflict-btn gpac-conflict-btn-merge" data-action="merge">
                        <span class="gpac-conflict-btn-icon">🔀</span>
                        <div class="gpac-conflict-btn-text">
                            <div class="gpac-conflict-btn-title">Smart Merge (Recommended)</div>
                            <div class="gpac-conflict-btn-desc">Combine both versions, keeping all unique changes</div>
                        </div>
                    </button>
                    
                    <button class="gpac-conflict-btn gpac-conflict-btn-diff" data-action="diff">
                        <span class="gpac-conflict-btn-icon">📋</span>
                        <div class="gpac-conflict-btn-text">
                            <div class="gpac-conflict-btn-title">View Diff</div>
                            <div class="gpac-conflict-btn-desc">See exactly what changed before deciding</div>
                        </div>
                    </button>
                </div>
                
                <div class="gpac-diff-view" id="gpac-diff-view"></div>
                
                <div class="gpac-conflict-warning">
                    <span>🚫</span>
                    <span>This window cannot be closed. You must resolve the conflict to continue.</span>
                </div>
            </div>
        `;

        document.body.appendChild(this._container);
    }

    /**
     * Show the conflict modal.
     * @param {Object} localData - Local data state
     * @param {Object} remoteData - Remote data state
     * @returns {Promise<string>} Resolution choice: 'local' | 'remote' | 'merge'
     */
    static show(localData, remoteData) {
        return new Promise((resolve) => {
            this.init();

            this._localData = localData;
            this._remoteData = remoteData;
            this._resolveCallback = resolve;

            // Update details
            this._updateDetails();

            // Show modal
            this._container.classList.add('active');

            // Notify sync indicator
            if (window.SyncStatusIndicator) {
                window.SyncStatusIndicator.setState('conflict');
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
     * Update conflict details display.
     */
    static _updateDetails() {
        const localInfo = document.getElementById('gpac-local-info');
        const remoteInfo = document.getElementById('gpac-remote-info');
        const timeDiff = document.getElementById('gpac-time-diff');

        if (localInfo) {
            const localTs = this._localData?.ts || Date.now();
            localInfo.textContent = new Date(localTs).toLocaleString();
        }

        if (remoteInfo) {
            const remoteTs = this._remoteData?.ts || Date.now();
            remoteInfo.textContent = new Date(remoteTs).toLocaleString();
        }

        if (timeDiff) {
            const diff = Math.abs((this._localData?.ts || 0) - (this._remoteData?.ts || 0));
            const seconds = Math.floor(diff / 1000);
            if (seconds < 60) {
                timeDiff.textContent = `${seconds} seconds`;
            } else {
                timeDiff.textContent = `${Math.floor(seconds / 60)} minutes`;
            }
        }
    }

    /**
     * Handle resolution action.
     */
    static _handleAction(action) {
        if (action === 'diff') {
            this._showDiff();
            return;
        }

        this.hide();

        if (this._resolveCallback) {
            this._resolveCallback(action);
            this._resolveCallback = null;
        }

        // Update sync indicator
        if (window.SyncStatusIndicator) {
            window.SyncStatusIndicator.setState('syncing');
            setTimeout(() => {
                window.SyncStatusIndicator.synced();
            }, 1000);
        }
    }

    /**
     * Show diff view.
     */
    static _showDiff() {
        const diffView = document.getElementById('gpac-diff-view');
        if (!diffView) return;

        diffView.classList.toggle('active');

        if (diffView.classList.contains('active')) {
            // Generate simple diff
            const localStr = JSON.stringify(this._localData?.data || {}, null, 2);
            const remoteStr = JSON.stringify(this._remoteData?.data || {}, null, 2);

            diffView.innerHTML = `
                <div style="margin-bottom: 16px;">
                    <strong class="gpac-diff-local">LOCAL DATA:</strong>
                    <pre style="margin: 8px 0; max-height: 100px; overflow-y: auto;">${this._escapeHtml(localStr.slice(0, 500))}...</pre>
                </div>
                <div>
                    <strong class="gpac-diff-remote">REMOTE DATA:</strong>
                    <pre style="margin: 8px 0; max-height: 100px; overflow-y: auto;">${this._escapeHtml(remoteStr.slice(0, 500))}...</pre>
                </div>
            `;
        }
    }

    /**
     * Escape HTML for safe display.
     */
    static _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Set up event listeners.
     */
    static _setupEventListeners() {
        // Listen for conflict events
        window.addEventListener('gpac_conflict', (e) => {
            this.show(
                { ts: Date.now(), data: e.detail?.localData },
                e.detail?.remoteChange
            );
        });

        // Button clicks
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.gpac-conflict-btn');
            if (btn) {
                const action = btn.dataset.action;
                if (action) {
                    this._handleAction(action);
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
        document.addEventListener('DOMContentLoaded', () => ConflictModal.init());
    } else {
        ConflictModal.init();
    }
}

// Export
export default ConflictModal;
export { ConflictModal };

if (typeof window !== 'undefined') {
    window.ConflictModal = ConflictModal;
}
