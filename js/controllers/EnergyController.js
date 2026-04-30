/**
 * EnergyController - Centralized Energy Level Management
 * 
 * This module consolidates all energy tracking functionality that was previously
 * scattered across multiple inline scripts in grind.html.
 * 
 * Features:
 * - Energy chart management (Chart.js)
 * - Hologram visualization updates
 * - Fatigue level tracking
 * - Energy level persistence
 */

class EnergyController {
    constructor() {
        this.energyChart = null;
        this.energyLabels = {
            1: 'Exhausted',
            2: 'Very Tired',
            3: 'Tired',
            4: 'Okay',
            5: 'Good',
            6: 'Energetic',
            7: 'Peaking'
        };

        this.pendingAutoStart = false;

        // Bind methods
        this.updateEnergyChart = this.updateEnergyChart.bind(this);
        this.updateEnergyVisualization = this.updateEnergyVisualization.bind(this);
        this.handleFatigueSelection = this.handleFatigueSelection.bind(this);
    }

    /**
     * Initialize the energy controller
     */
    init() {
        console.log('EnergyController.init() called');

        // Create a fallback EnergyTracker class if not available
        if (typeof window.EnergyTracker === 'undefined') {
            console.log('Creating fallback EnergyTracker class');
            window.EnergyTracker = class EnergyTracker {
                constructor() {
                    this.energyLevels = this.loadEnergyLevels();
                }
                addEnergyLevel(level, description) {
                    const entry = { timestamp: new Date().toISOString(), level, description };
                    this.energyLevels.push(entry);
                    this.saveEnergyLevels();
                    return entry;
                }
                loadEnergyLevels() {
                    try { return JSON.parse(storageService.get('energyLevels')) || []; }
                    catch { return []; }
                }
                saveEnergyLevels() {
                    storageService.set('energyLevels', this.energyLevels);
                }
                getEnergyLevels() { return this.energyLevels; }
                getTodayEnergyLevels() {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return this.energyLevels.filter(entry => {
                        const entryDate = new Date(entry.timestamp);
                        entryDate.setHours(0, 0, 0, 0);
                        return entryDate.getTime() === today.getTime();
                    }).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                }
            };
        }

        // Ensure energyTracker instance exists
        if (!window.energyTracker) {
            console.log('Creating energyTracker instance');
            window.energyTracker = new window.EnergyTracker();
        }

        this._setupEventListeners();
        this._initEnergyGraph();
        this._loadStoredEnergyLevel();

        // Expose global functions expected by legacy code
        window.showFatigueModal = this.showFatigueModal.bind(this);
        window.hideFatigueModal = this.hideFatigueModal.bind(this);
        window.handleFatigueSelection = this.handleFatigueSelection.bind(this);
        window.updateHologramEnergy = (level) => {
            const container = document.getElementById('hologramContainer');
            if (container) {
                const event = new CustomEvent('updateEnergy', { detail: { level: parseInt(level) } });
                container.dispatchEvent(event);
            }
        };

        console.log('EnergyController initialized');
        return this;
    }

    /**
     * Update the energy chart with latest data
     */
    updateEnergyChart() {
        console.log('updateEnergyChart called (Redesign 2.0)');

        // CRITICAL: Existence check to prevent state collapse crash
        if (!document.getElementById('energyGraph') && !document.getElementById('energyWaveSvg')) {
            console.warn('[EnergyController] Drawing targets not found, skipping update');
            return;
        }

        if (!window.energyTracker) {
            console.warn('EnergyTracker not available for chart update');
            return;
        }

        const todayLevels = window.energyTracker.getTodayEnergyLevels();
        
        // Update Chart.js if it exists (legacy)
        if (this.energyChart) {
            this._updateLegacyChart(todayLevels);
        }

        // Render Redesign 2.0 SVG Wave
        this._renderEnergyWave(todayLevels);
        
        // Update other stats (Fatigue, Cog Load)
        this._updateStatsUI();
    }

    /**
     * Render the smooth SVG wave for the energy curve
     * @private
     */
    _renderEnergyWave(levels) {
        const svg = document.getElementById('energyWaveSvg');
        if (!svg) return;

        // Ensure wave path exists
        const path = svg.querySelector('.energy-path');
        if (!path) return;

        // If no levels, use placeholders
        const dataPoints = levels.length > 1 ? 
            levels.map(l => l.level) : 
            [4, 5, 3, 6, 4, 5, 4]; // Default wave shape
            
        // ... rest of method ...

        const width = 800;
        const height = 100;
        const padding = 10;
        
        const dx = width / (dataPoints.length - 1);
        
        // Map 1-7 level to height (inverted: 1 is top, 7 is bottom)
        const getY = (level) => height - ((level / 7) * (height - 2 * padding) + padding);

        let pathData = `M 0,${getY(dataPoints[0])}`;
        
        for (let i = 0; i < dataPoints.length - 1; i++) {
            const x1 = i * dx;
            const y1 = getY(dataPoints[i]);
            const x2 = (i + 1) * dx;
            const y2 = getY(dataPoints[i+1]);
            
            const cx = (x1 + x2) / 2;
            pathData += ` C ${cx},${y1} ${cx},${y2} ${x2},${y2}`;
        }

        if (path) {
            path.setAttribute('d', pathData);
        }
    }

    /**
     * Update fatigue and cognitive load numeric displays
     * @private
     */
    _updateStatsUI() {
        // Update Fatigue %
        const storedLevel = storageService.get('currentEnergyLevel') || '4';
        const fatiguePercent = Math.round((parseInt(storedLevel) / 7) * 100);
        const fatigueEl = document.querySelector('#fatigueCard .stat-value');
        if (fatigueEl) fatigueEl.innerHTML = `${100 - fatiguePercent}<span class="unit">%</span>`;

        // Update Cognitive Load (Placeholder logic)
        const cogLoadEl = document.querySelector('#cognitiveCard .stat-value');
        if (cogLoadEl) cogLoadEl.innerHTML = `60<span class="unit">pts</span>`;
    }

    /**
     * Update energy visualization (hologram and chart)
     * @param {number} level - Energy level (1-7)
     * @param {string} description - Optional description
     */
    updateEnergyVisualization(level, description) {
        console.log('Updating energy visualization:', level, description);

        // Store the energy level
        storageService.set('currentEnergyLevel', level.toString());

        // Update hologram
        const hologramContainer = document.getElementById('hologramContainer');
        if (hologramContainer) {
            const event = new CustomEvent('updateEnergy', {
                detail: { level: level }
            });
            hologramContainer.dispatchEvent(event);
        }

        // Also try direct hologram update function
        if (typeof window.updateHologramEnergy === 'function') {
            window.updateHologramEnergy(level);
        }

        // Log the energy level
        if (description && window.energyTracker) {
            window.energyTracker.addEnergyLevel(level, description);
        }

        // Update chart immediately
        this.updateEnergyChart();
    }

    /**
     * Handle fatigue level selection
     * @param {number} level - Selected fatigue level
     * @param {string} description - Level description
     */
    handleFatigueSelection(level, description) {
        console.log('Fatigue level selected:', level, description);

        // Store the energy level
        storageService.set('currentEnergyLevel', level.toString());

        // Update visualizations
        this.updateEnergyVisualization(level, description);

        // Hide fatigue modal
        this.hideFatigueModal();

        // Update UI
        this._updateFatigueLevelUI(level);

        // Mark as logged in TimerController to prevent repeated prompts
        if (window.timerController?.state) {
            window.timerController.state.fatigueLogged = true;
        }

        // Auto-start timer if requested
        if (this.pendingAutoStart) {
            this.pendingAutoStart = false;
            // Use window.startTimer which eventually calls TimerController.startTimer
            // This bypasses the click handler check in TimerController
            if (typeof window.startTimer === 'function') {
                window.startTimer();
            } else if (window.timerController) {
                window.timerController.startTimer();
            }
        }
    }

    /**
     * Show the fatigue modal
     * @param {boolean} autoStart - Whether to auto-start timer after selection
     */
    showFatigueModal(autoStart = false) {
        this.pendingAutoStart = autoStart;

        // Reset selection state
        this.selectedLevel = null;
        this.selectedDescription = null;

        // Reset UI
        const fatigueLevels = document.querySelectorAll('.fatigue-level');
        fatigueLevels.forEach(el => el.classList.remove('active'));

        const confirmBtn = document.getElementById('confirmFatigue');
        if (confirmBtn) {
            confirmBtn.disabled = true;
        }

        const modal = document.getElementById('fatigueModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    /**
     * Hide the fatigue modal
     */
    hideFatigueModal() {
        const modal = document.getElementById('fatigueModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // ==================== Private Methods ====================

    /**
     * Initialize the energy graph
     */
    _initEnergyGraph() {
        const ctx = document.getElementById('energyGraph')?.getContext('2d');
        if (!ctx) {
            console.warn('Energy graph canvas not found');
            return;
        }

        // Check if energyTracker is available, retry if not
        if (!window.energyTracker) {
            console.log('EnergyTracker not available yet, retrying in 300ms...');
            setTimeout(() => this._initEnergyGraph(), 300);
            return;
        }

        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.log('Chart.js not loaded, retrying in 300ms...');
            setTimeout(() => this._initEnergyGraph(), 300);
            return;
        }

        // Prevent duplicate chart creation
        if (this.energyChart) {
            console.log('Energy chart already initialized');
            return;
        }

        const todayLevels = window.energyTracker.getTodayEnergyLevels();

        // If no data, add a placeholder to show the chart is working
        let displayData = todayLevels;
        let displayLabels;

        if (todayLevels.length === 0) {
            // No data yet - show a placeholder with current time and middle energy level
            const now = new Date();
            displayLabels = [now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })];
            displayData = [{ level: 4, timestamp: now.toISOString() }]; // Start at "Okay" level
        } else {
            displayLabels = todayLevels.map(entry => {
                const date = new Date(entry.timestamp);
                return date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            });
        }

        // Detect current theme
        const isLightMode = document.body.classList.contains('light-theme');

        this.energyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: displayLabels,
                datasets: [{
                    label: 'Energy',
                    data: displayData.map(entry => entry.level),
                    borderColor: '#fe2c55',
                    backgroundColor: 'rgba(254, 44, 85, 0.1)',
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.35,
                    pointRadius: todayLevels.length === 0 ? 6 : 0, // Show point if only placeholder
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#fe2c55',
                    pointBorderColor: isLightMode ? '#212529' : '#ffffff',
                    pointBorderWidth: 2,
                    pointHoverBorderWidth: 2,
                    pointHoverBackgroundColor: '#fe2c55',
                    pointHoverBorderColor: isLightMode ? '#212529' : '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: { top: 5, right: 5, bottom: 5, left: 5 }
                },
                animation: {
                    duration: 750,
                    easing: 'easeInOutQuart'
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 30, 30, 0.95)',
                        titleColor: isLightMode ? '#212529' : '#fff',
                        bodyColor: isLightMode ? '#212529' : '#fff',
                        padding: 10,
                        cornerRadius: 6,
                        displayColors: false,
                        callbacks: {
                            label: (context) => {
                                const entry = displayData[context.dataIndex];
                                if (entry) {
                                    return `Level ${entry.level}: ${this.energyLabels[entry.level] || 'Unknown'}`;
                                }
                                return '';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        reverse: true, // Lower number (1) is better/top
                        min: 0.5,
                        max: 7.5,
                        border: { display: false },
                        ticks: {
                            stepSize: 1,
                            color: isLightMode ? 'rgba(33, 37, 41, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                            font: { size: 10 },
                            callback: (val) => this.energyLabels[val] || ''
                        },
                        grid: {
                            color: isLightMode ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        }
                    },
                    x: {
                        display: false,
                        grid: { display: false }
                    }
                }
            }
        });

        console.log('Energy chart initialized successfully');
    }

    _loadStoredEnergyLevel() {
        const storedLevel = storageService.get('currentEnergyLevel');
        if (storedLevel && !isNaN(storedLevel)) {
            const level = parseInt(storedLevel);
            if (level >= 1 && level <= 7) {
                // Update UI without creating a new log entry
                this._updateFatigueLevelUI(level);

                // Initialize hologram
                const hologramContainer = document.getElementById('hologramContainer');
                if (hologramContainer) {
                    // Slight delay to ensure hologram component is ready
                    setTimeout(() => {
                        const event = new CustomEvent('updateEnergy', {
                            detail: { level: level }
                        });
                        hologramContainer.dispatchEvent(event);
                    }, 500);
                }
            }
        }
    }

    _updateFatigueLevelUI(level) {
        // Update any UI that shows current fatigue
        // (currently mostly handled by hologram and chart)
    }

    _setupEventListeners() {
        console.log('Setting up EnergyController event listeners');

        // Selected level tracking
        this.selectedLevel = null;
        this.selectedDescription = null;

        // Get fatigue level buttons
        const fatigueLevels = document.querySelectorAll('.fatigue-level');
        const confirmBtn = document.getElementById('confirmFatigue');
        const cancelBtn = document.getElementById('cancelFatigue');

        // Setup click handlers for each fatigue level option
        fatigueLevels.forEach(levelEl => {
            levelEl.addEventListener('click', () => {
                // Remove active class from all levels
                fatigueLevels.forEach(el => el.classList.remove('active'));

                // Add active class to selected
                levelEl.classList.add('active');

                // Store selected level
                this.selectedLevel = parseInt(levelEl.dataset.level);
                const h3 = levelEl.querySelector('h3');
                const p = levelEl.querySelector('p');
                this.selectedDescription = h3 ? h3.textContent : `Level ${this.selectedLevel}`;

                // Enable confirm button
                if (confirmBtn) {
                    confirmBtn.disabled = false;
                }

                console.log('Fatigue level selected:', this.selectedLevel, this.selectedDescription);
            });
        });

        // Confirm button handler
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                if (this.selectedLevel) {
                    this.handleFatigueSelection(this.selectedLevel, this.selectedDescription);
                }
            });
        }

        // Cancel button handler
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideFatigueModal();
                // Reset selection
                this.selectedLevel = null;
                this.selectedDescription = null;
                fatigueLevels.forEach(el => el.classList.remove('active'));
                if (confirmBtn) {
                    confirmBtn.disabled = true;
                }
            });
        }

        console.log('EnergyController event listeners set up');
    }
}

export { EnergyController };
const energyController = new EnergyController();
export default energyController;

if (typeof window !== 'undefined') {
    window.EnergyController = EnergyController;
    window.energyController = energyController;
}

