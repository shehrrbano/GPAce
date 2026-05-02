/**
 * TimerController - Centralized Pomodoro Timer Management
 * 
 * This module consolidates all timer functionality that was previously
 * scattered across multiple inline scripts in grind.html.
 * 
 * Features:
 * - Unified timer state management
 * - Title updates with timer display
 * - Focus/Break mode switching
 * - Stats tracking integration
 * - Cross-tab synchronization
 */

// Timer Constants
const TIMER_STATES = Object.freeze({
    FOCUS: 'focus',
    BREAK: 'break',
    PAUSED: 'paused'
});

const TIMER_DURATIONS = Object.freeze({
    POMODORO: 25 * 60,      // 25 minutes
    SHORT_BREAK: 5 * 60,    // 5 minutes
    LONG_BREAK: 15 * 60,    // 15 minutes
    MIN_TIME: 1 * 60,       // 1 minute minimum
    MAX_TIME: 60 * 60       // 1 hour maximum
});

class TimerController {
    constructor() {
        // Unified state object - single source of truth
        this.state = {
            timeLeft: TIMER_DURATIONS.POMODORO,
            currentState: TIMER_STATES.FOCUS,
            pomodoroCount: 0,
            timerInterval: null,
            startTime: null,
            isRunning: false,
            originalTitle: 'GPAce - Current Task',
            endTime: null
        };

        // Worker reference
        this.worker = null;
        this._initWorker();

        // Title update interval reference
        this.titleInterval = null;

        // Alarm sound interval
        this._soundLoopInterval = null;

        // Timer state batching for performance (reduce localStorage writes)
        this.ticksSinceLastSave = 0;
        this.SAVE_INTERVAL = 10; // Save every 10 seconds instead of every second

        // Stats integration
        this.stats = {
            totalWorkTime: 0,
            activeTimerStart: null,
            pausedTime: 0,
            sessionHistory: [],
            lastSessionDate: null
        };

        // User preferences
        this.preferences = {
            defaultPomodoroTime: TIMER_DURATIONS.POMODORO,
            soundEnabled: true,
            notifications: true,
            autoStartBreaks: false
        };

        // Bind methods to maintain context
        this.startTimer = this.startTimer.bind(this);
        this.pauseTimer = this.pauseTimer.bind(this);
        this.resetTimer = this.resetTimer.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.handleToggle = this.handleToggle.bind(this);
        this.skipSession = this.skipSession.bind(this);
        this.skipBreak = this.skipBreak.bind(this);
        this.handleTimerComplete = this.handleTimerComplete.bind(this);

        // Initialize
        this._loadState();
        this._loadStats();
        this._loadPreferences();
        // this._setupEventListeners(); // Moved to init
        this._setupVisibilityHandler();
    }

    /**
     * Initialize the Web Worker for reliable heartbeats
     * @private
     */
    _initWorker() {
        if (typeof Worker !== 'undefined') {
            try {
                // Use absolute path for worker to ensure it works across different pages
                this.worker = new Worker('/js/timerWorker.js');
                this.worker.onmessage = (e) => {
                    if (e.data.type === 'tick') {
                        this._handleTick();
                    }
                };
                console.log('Timer Worker initialized');
            } catch (e) {
                console.error('Failed to initialize Timer Worker:', e);
            }
        }
    }

    /**
     * Centralized tick handler for both Worker and Interval fallbacks
     * @private
     */
    _handleTick() {
        if (this.state.isRunning && this.state.endTime) {
            const now = Date.now();
            const newTimeLeft = Math.max(0, Math.ceil((this.state.endTime - now) / 1000));
            
            // Only update if the second has actually changed
            if (newTimeLeft !== this.state.timeLeft) {
                this.state.timeLeft = newTimeLeft;
                this.ticksSinceLastSave++;

                // Batched save: only save every 10 seconds OR on completion
                if (this.ticksSinceLastSave >= this.SAVE_INTERVAL || this.state.timeLeft === 0) {
                    this._saveState();
                    this.ticksSinceLastSave = 0;
                }

                this.updateDisplay();
                this._updateTitleDisplay(); // Specialized title update

                if (this.state.timeLeft <= 0) {
                    this.handleTimerComplete();
                }
            }
        } else {
            // Timer is not running, but we still update the title with the real-time clock
            this._updateTitleDisplay();
        }
    }

    /**
     * Initialize the timer controller
     */
    init() {
        this._setupEventListeners();
        this.updateDisplay();
        this._updateTitleDisplay();
        
        // Ensure heartbeat interval is running even if worker is not available
        if (!this.state.timerInterval) {
            this.state.timerInterval = setInterval(() => this._handleTick(), 1000);
        }
        
        console.log('TimerController initialized');
        return this;
    }

    /**
     * Start the timer
     */
    startTimer() {
        if (this.state.timerInterval) {
            return; // Already running
        }

        // Get time from display if available
        const timerDisplay = document.getElementById('timer');
        if (timerDisplay) {
            const [minutes, seconds] = timerDisplay.textContent.split(':').map(Number);
            if (!isNaN(minutes) && !isNaN(seconds)) {
                this.state.timeLeft = minutes * 60 + seconds;
            }
        }
        
        // ... rest of method ...


        // Stop any active alarm
        this._stopAlarm();

        // Set start time if not resuming
        if (!this.state.isRunning) {
            this.state.startTime = Date.now();
            this.stats.activeTimerStart = Date.now();
        }

        this.state.isRunning = true;

        // Set absolute end time
        this.state.endTime = Date.now() + (this.state.timeLeft * 1000);

        // Start the worker heartbeat
        if (this.worker) {
            this.worker.postMessage({ action: 'start' });
        }

        // Ensure interval is running (init usually handles this)
        if (!this.state.timerInterval) {
            this.state.timerInterval = setInterval(() => {
                this._handleTick();
            }, 1000);
        }

        // Update display immediately
        this.updateDisplay();
        this._updateTitleDisplay();

        // Update button UI
        this._updateButtonState('running');

        // Reset batch counter on start
        this.ticksSinceLastSave = 0;

        // Save state immediately on start
        this._saveState();

        // Show notification
        this._showNotification('Timer started', 'success');
    }

    /**
     * Pause the timer
     */
    pauseTimer() {
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
            this.state.timerInterval = null;
        }

        this.state.isRunning = false;

        // Track paused time for stats
        if (this.stats.activeTimerStart) {
            this.stats.pausedTime += Date.now() - this.stats.activeTimerStart;
        }

        // We don't stop the worker or interval anymore because they drive the clock
        
        // Save state immediately on pause (important for data persistence)
        this._saveState();
        this._updateButtonState('paused');
        this._updateTitleDisplay();
        this._showNotification('Timer paused', 'info');
    }

    /**
     * Reset the timer to initial state
     */
    resetTimer() {
        // Stop any running interval
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
            this.state.timerInterval = null;
        }

        // We don't stop the worker or interval anymore because they drive the clock
        
        this.updateDisplay();
        this._updateButtonState('paused');
        // Save state immediately on reset (important for data persistence)
        this._saveState();
        this._updateTitleDisplay();
        this._showNotification('Timer reset', 'info');
    }

    /**
     * UI Handler for resetting the timer
     */
    handleReset() {
        this.resetTimer();
    }

    /**
     * Skip the current session
     */
    skipSession() {
        if (this.state.currentState === TIMER_STATES.FOCUS) {
            this.startBreak();
        } else {
            this.startFocus();
        }
    }

    /**
     * Skip the current break (alias for skipSession)
     */
    skipBreak() {
        this.skipSession();
    }

    /**
     * Set a custom timer duration
     */
    setCustomTime(minutes) {
        if (minutes > 0 && minutes <= 60) {
            this.state.timeLeft = minutes * 60;
            this.state.currentState = TIMER_STATES.FOCUS;
            this.updateDisplay();
            // Immediate save on custom time change
            this._saveState();
        }
    }

    /**
     * Switch to focus mode
     */
    startFocus() {
        this.state.currentState = TIMER_STATES.FOCUS;
        this.state.timeLeft = TIMER_DURATIONS.POMODORO;
        this.state.startTime = Date.now();
        this.updateDisplay();
        this._stopTitleUpdates();
        this.startTimer();
    }

    /**
     * Switch to break mode
     */
    startBreak() {
        this.state.currentState = TIMER_STATES.BREAK;
        this.state.timeLeft = (this.state.pomodoroCount % 4 === 0) ?
            TIMER_DURATIONS.LONG_BREAK : TIMER_DURATIONS.SHORT_BREAK;
        this.state.startTime = Date.now();
        this.updateDisplay();
        this._stopTitleUpdates();
        this.startTimer();
    }

    /**
     * Handle timer completion
     */
    handleTimerComplete() {
        this.state.isRunning = false;
        // We don't stop the worker or interval anymore because they drive the clock
        
        // Play notification sound (Alarm loop)
        this._startAlarm();

        // Show browser notification
        this._showBrowserNotification();

        if (this.state.currentState === TIMER_STATES.FOCUS) {
            // Update stats before transitioning
            const elapsedSeconds = Math.floor((Date.now() - this.stats.activeTimerStart - this.stats.pausedTime) / 1000);
            this.stats.totalWorkTime += elapsedSeconds;
            this._updateStatsDisplay();
            this._saveStats();

            this.state.pomodoroCount++;
            this.startBreak();
        } else {
            this.startFocus();
        }

        this._saveState();
    }


    /**
     * Update the timer display
     */
    updateDisplay() {
        const minutes = Math.floor(this.state.timeLeft / 60);
        const seconds = this.state.timeLeft % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Update timer display
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.textContent = display;
        }

        // Update session type label
        const sessionTypeElement = document.querySelector('.timer-label');
        if (sessionTypeElement) {
            sessionTypeElement.textContent =
                this.state.currentState === TIMER_STATES.FOCUS ? 'FOCUS TIME' :
                    (this.state.pomodoroCount % 4 === 0 ? 'LONG BREAK' : 'SHORT BREAK');
        }

        // Update progress ring (Bento Redesign 2.0)
        this._updateCircularProgress();

        // Update pomodoro count dots
        this._updatePomodoroDots();
    }

    /**
     * Update the SVG circular progress ring
     * @private
     */
    _updateCircularProgress() {
        const circle = document.querySelector('.timer-ring-progress');
        if (!circle) return;

        const totalTime = this.state.currentState === TIMER_STATES.FOCUS ?
            TIMER_DURATIONS.POMODORO :
            (this.state.pomodoroCount % 4 === 0 ? TIMER_DURATIONS.LONG_BREAK : TIMER_DURATIONS.SHORT_BREAK);
        
        const percent = ((totalTime - this.state.timeLeft) / totalTime) * 100;
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percent / 100) * circumference;

        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = offset;
    }

    /**
     * Update the session count indicator dots
     * @private
     */
    _updatePomodoroDots() {
        const dotsContainer = document.querySelector('.timer-dots');
        if (!dotsContainer) return;

        const dots = dotsContainer.querySelectorAll('.dot');
        const count = this.state.pomodoroCount % 4;

        dots.forEach((dot, index) => {
            if (index < count) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    /**
     * Toggle timer with fatigue check
     */
    handleToggle() {
        if (this.state.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    /**
     * Legacy toggle for backward compatibility
     */
    toggle() {
        this.handleToggle();
    }

    // ==================== Private Methods ====================

    /**
     * Dedicated method to update title based on current state
     * @private
     */
    _updateTitleDisplay() {
        if (this.state.isRunning) {
            const minutes = Math.floor(this.state.timeLeft / 60);
            const seconds = this.state.timeLeft % 60;
            const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            const timerType = this.state.currentState === TIMER_STATES.FOCUS ? 'Focus' : 'Break';
            document.title = `${display} - ${timerType} - GPAce`;
        } else {
            this._updateTitleWithCurrentTime();
        }
    }

    /**
     * Legacy title update methods - now using _updateTitleDisplay
     */
    _startTitleUpdates() {
        this._updateTitleDisplay();
    }

    _stopTitleUpdates() {
        // No-op, managed by _updateTitleDisplay
    }

    /**
     * Update title with current time (when timer not running)
     */
    _updateTitleWithCurrentTime() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.title = `${formattedTime} - GPAce`;
    }

    _updateButtonState(state) {
        const startBtn = document.getElementById('startBtn');
        if (!startBtn) return;

        if (state === 'running') {
            startBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
            startBtn.setAttribute('data-state', 'running');
            startBtn.classList.add('running');
        } else {
            startBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
            startBtn.setAttribute('data-state', 'paused');
            startBtn.classList.remove('running');
        }
    }

    /**
     * Setup event listeners for timer controls
     */
    _setupEventListeners() {
        // Start/Pause button
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                const state = startBtn.getAttribute('data-state');
                if (state === 'paused') {
                    this.startTimer();
                } else if (state === 'running') {
                    this.pauseTimer();
                }
            });
        }

        // Reset button
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetTimer());
        }

        // Mode buttons
        document.querySelectorAll('.timer-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                const time = parseInt(btn.dataset.time);

                // Update active state
                document.querySelectorAll('.timer-mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update timer
                this.state.currentState = mode;
                this.state.timeLeft = time * 60;
                this.updateDisplay();
                this._saveState();
            });
        });

        // Custom time input
        const customTimeInput = document.getElementById('customTimeInput');
        if (customTimeInput) {
            customTimeInput.addEventListener('input', (e) => {
                let value = parseInt(e.target.value);
                if (isNaN(value) || value < 1) {
                    e.target.value = 1;
                    value = 1;
                } else if (value > 60) {
                    e.target.value = 60;
                    value = 60;
                }
                this.setCustomTime(value);
            });
        }
    }

    /**
     * Handle visibility changes to ensure title updates work
     */
    _setupVisibilityHandler() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                // Force an immediate sync when returning to the tab
                if (this.state.isRunning && this.state.endTime) {
                    this._handleTick();
                }
                this._updateTitleDisplay();
            }
        });
    }

    /**
     * Start the repeating notification sound
     */
    _startAlarm() {
        this._stopAlarm(); // Ensure no overlapping alarms
        
        const playSound = () => {
            try {
                if (this.preferences.soundEnabled) {
                    const audio = new Audio('assets/sounds/notification.mp3');
                    audio.play().catch(e => console.log('Audio play failed', e));
                }
            } catch (e) {
                console.error('Error playing sound:', e);
            }
        };

        playSound(); // Play immediately
        this._soundLoopInterval = setInterval(playSound, 2000); // Repeat every 2 seconds
    }

    /**
     * Stop the repeating notification sound
     */
    _stopAlarm() {
        if (this._soundLoopInterval) {
            clearInterval(this._soundLoopInterval);
            this._soundLoopInterval = null;
            console.log('Alarm stopped');
        }
    }

    /**
     * Legacy sound method
     */
    _playNotificationSound() {
        this._startAlarm();
    }

    /**
     * Show browser notification
     */
    _showBrowserNotification() {
        if (!this.preferences.notifications || Notification.permission !== 'granted') return;

        const title = this.state.currentState === TIMER_STATES.FOCUS ? 'Focus Session Complete!' : 'Break Over!';
        const body = this.state.currentState === TIMER_STATES.FOCUS ?
            'Great job! Take a break.' : 'Time to get back to work!';

        new Notification(title, {
            body: body,
            icon: 'assets/icons/icon-192x192.png'
        });
    }

    /**
     * Show toast notification
     */
    _showNotification(message, type = 'info') {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            console.log(`Notification (${type}): ${message}`);
        }
    }

    _loadState() {
        const savedState = storageService.get('timerState');
        if (savedState) {
            try {
                const parsed = typeof savedState === 'string' ? JSON.parse(savedState) : savedState;
                if (parsed && typeof parsed === 'object') {
                    if (parsed.timeLeft !== undefined) this.state.timeLeft = parsed.timeLeft;
                    if (parsed.currentState !== undefined) this.state.currentState = parsed.currentState;
                    this.state.pomodoroCount = parsed.pomodoroCount || 0;
                }
            } catch (e) {
                console.error('Error loading timer state', e);
            }
        }
    }

    _saveState() {
        // Use Validators for safe localStorage writes if available
        const stateData = {
            timeLeft: this.state.timeLeft,
            currentState: this.state.currentState,
            pomodoroCount: this.state.pomodoroCount
        };

        if (typeof window.Validators !== 'undefined' && typeof window.Validators.setValidatedStorageItem === 'function') {
            window.Validators.setValidatedStorageItem('timerState', stateData);
        } else {
            // Fallback to direct localStorage (StorageService handles serialization)
            storageService.set('timerState', stateData);
        }
    }

    _loadStats() {
        if (typeof window.loadStats === 'function') {
            // Stats are managed by StatsController now, but we might keep local ref
            // For now, we update global stats directly via window.stats if available
        }
    }

    _updateStatsDisplay() {
        if (typeof window.updateStatsDisplay === 'function') {
            window.updateStatsDisplay();
        }
    }

    _saveStats() {
        // Delegate to StatsController (via saveStats global)
        if (typeof window.saveStats === 'function') {
            window.saveStats();
        }
    }

    _loadPreferences() {
        // Could load from localStorage if we had settings
    }
}

const timerController = new TimerController();
export default timerController;

// Expose to window for legacy scripts
if (typeof window !== 'undefined') {
    window.timerController = timerController;
    // Map legacy functions
    window.startTimer = timerController.startTimer;
    window.pauseTimer = timerController.pauseTimer;
    window.resetTimer = timerController.resetTimer;
    window.toggleTimer = () => timerController.toggle();
}

