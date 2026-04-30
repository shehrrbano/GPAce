/**
 * gpa-predictor.js
 * Real-time GPA Predictor Module - Refactored (Batch 9)
 */

import { gpaService } from './services/GPAService.js';

class GPAPredictor {
    constructor(containerId = 'gpaPredictorContainer') {
        this.containerId = containerId;
        this.container = null;
        this.service = gpaService;
        this.debounceTimer = null;
        this.isInitialized = false;

        // Bind methods
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleAddSubject = this.handleAddSubject.bind(this);
        this.handleRemoveSubject = this.handleRemoveSubject.bind(this);
        this.handleScaleChange = this.handleScaleChange.bind(this);
        this.handleReset = this.handleReset.bind(this);
    }

    get subjects() { return this.service.subjects; }
    get currentScale() { return this.service.currentScale; }
    get inputMode() { return this.service.inputMode; }

    init() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) return;

        this.service.load();
        this.render();
        this.setupEventListeners();
        this.calculateGPA();
        this.isInitialized = true;
    }

    render() {
        const scale = this.service.scales[this.currentScale];
        this.container.innerHTML = `
            <div class="gpa-predictor-section" role="region" aria-label="GPA Predictor">
                <div class="gpa-predictor-header">
                    <div class="gpa-predictor-title">
                        <span class="icon">📊</span>
                        <h3>GPA Predictor</h3>
                    </div>
                    <div class="gpa-predictor-controls">
                        <div class="scale-selector">
                            <label for="gpaScale">Scale:</label>
                            <select id="gpaScale">
                                ${Object.entries(this.service.scales).map(([key, s]) => `
                                    <option value="${key}" ${key === this.currentScale ? 'selected' : ''}>
                                        ${s.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="input-mode-toggle">
                            <button type="button" class="${this.inputMode === 'marks' ? 'active' : ''}" data-mode="marks">Marks</button>
                            <button type="button" class="${this.inputMode === 'grade' ? 'active' : ''}" data-mode="grade">Grade</button>
                        </div>
                    </div>
                </div>

                <div class="gpa-display-card">
                    <div id="gpaMainValue" class="gpa-main-value empty">—</div>
                    <div class="gpa-scale-indicator">out of ${scale.maxGPA.toFixed(1)}</div>
                    <div id="gpaClassification" class="gpa-classification" style="display:none;"></div>
                    <div class="gpa-progress-container">
                        <div class="gpa-progress-track">
                            <div id="gpaProgressFill" class="gpa-progress-fill" style="width: 0%;"></div>
                        </div>
                    </div>
                </div>

                <div class="gpa-stats-grid">
                    <div class="gpa-stat-card"><div id="totalCredits" class="gpa-stat-value">0</div><div class="gpa-stat-label">Total Credits</div></div>
                    <div class="gpa-stat-card"><div id="totalGradePoints" class="gpa-stat-value">0</div><div class="gpa-stat-label">Grade Points</div></div>
                    <div class="gpa-stat-card"><div id="subjectCount" class="gpa-stat-value">0</div><div class="gpa-stat-label">Subjects</div></div>
                    <div class="gpa-stat-card"><div id="averageMarks" class="gpa-stat-value">—</div><div class="gpa-stat-label">Avg. Marks</div></div>
                </div>

                <div class="gpa-subjects-container">
                    <div class="gpa-subjects-header">
                        <span>Subject</span><span>Credits</span><span>${this.inputMode === 'marks' ? 'Marks' : 'Grade'}</span><span>Grade</span><span>GP</span><span></span>
                    </div>
                    <div id="subjectRowsContainer" class="gpa-subjects-list">${this.renderSubjectRows()}</div>
                </div>

                <button type="button" class="btn-add-subject" id="addSubjectBtn">Add New Subject</button>

                <div class="what-if-section">
                    <h4>🎯 What-If Scenario</h4>
                    <div class="what-if-slider-container">
                        <div class="what-if-slider-label">If I score in remaining subjects: <span id="whatIfValue">75%</span></div>
                        <input type="range" id="whatIfSlider" min="0" max="100" value="75">
                        <div class="what-if-result">Projected GPA: <span id="whatIfGPA">—</span></div>
                    </div>
                </div>

                <div class="gpa-actions">
                    <button type="button" class="btn-gpa-action secondary" id="syncBtn">🔄 Sync</button>
                    <button type="button" class="btn-gpa-action danger" id="resetBtn">🗑️ Reset</button>
                </div>
            </div>
        `;
    }

    renderSubjectRows() {
        if (this.subjects.length === 0) {
            return '<div class="gpa-empty-state"><h4>No Subjects</h4><p>Click "Add New Subject" to start.</p></div>';
        }
        return this.subjects.map((s, i) => this.renderSubjectRow(s, i)).join('');
    }

    renderSubjectRow(s, i) {
        const info = this.service.getGradeInfo(s.marks);
        return `
            <div class="gpa-subject-row" data-index="${i}">
                <input type="text" class="subject-name-input" data-index="${i}" value="${s.name}" placeholder="Name">
                <input type="number" class="subject-credits-input" data-index="${i}" value="${s.credits}" min="0" max="12">
                <div class="marks-grade-input-wrapper">
                    <input type="number" class="subject-marks-input" data-index="${i}" value="${s.marks || ''}" 
                           style="display: ${this.inputMode === 'marks' ? 'block' : 'none'}">
                    <select class="subject-grade-select" data-index="${i}"
                            style="display: ${this.inputMode === 'grade' ? 'block' : 'none'}">
                        <option value="">Select</option>
                        ${this.service.scales[this.currentScale].grades.map(g => `
                            <option value="${g.grade}" ${s.selectedGrade === g.grade ? 'selected' : ''}>${g.grade}</option>
                        `).join('')}
                    </select>
                </div>
                <span class="grade-badge">${info.grade || '—'}</span>
                <span class="grade-point-display">${info.gp !== null ? info.gp.toFixed(1) : '—'}</span>
                <button type="button" class="btn-remove-row" data-index="${i}">✕</button>
            </div>
        `;
    }

    setupEventListeners() {
        this.container.addEventListener('input', (e) => {
            if (e.target.dataset.index !== undefined) this.handleInputChange(e);
            if (e.target.id === 'whatIfSlider') this.handleWhatIfChange(e);
        });

        this.container.addEventListener('change', (e) => {
            if (e.target.id === 'gpaScale') this.handleScaleChange(e);
            if (e.target.classList.contains('subject-grade-select')) this.handleGradeSelect(e);
        });

        this.container.addEventListener('click', (e) => {
            const target = e.target;
            if (target.closest('#addSubjectBtn')) this.handleAddSubject();
            if (target.closest('.btn-remove-row')) this.handleRemoveSubject(parseInt(target.closest('.btn-remove-row').dataset.index));
            if (target.closest('.input-mode-toggle button')) this.handleInputModeChange(target.closest('button').dataset.mode);
            if (target.closest('#resetBtn')) this.handleReset();
            if (target.closest('#syncBtn')) this.handleSync();
        });
    }

    handleInputChange(e) {
        const index = parseInt(e.target.dataset.index);
        const subject = this.subjects[index];
        if (!subject) return;

        if (e.target.classList.contains('subject-name-input')) {
            subject.name = e.target.value.trim();
        } else if (e.target.classList.contains('subject-credits-input')) {
            subject.credits = Math.min(12, Math.max(0, parseFloat(e.target.value) || 0));
        } else if (e.target.classList.contains('subject-marks-input')) {
            subject.marks = e.target.value === '' ? null : Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
            subject.selectedGrade = null;
        }

        this.debouncedUpdate();
    }

    handleGradeSelect(e) {
        const index = parseInt(e.target.dataset.index);
        const subject = this.subjects[index];
        if (!subject) return;

        subject.selectedGrade = e.target.value;
        const info = this.service.scales[this.currentScale].grades.find(g => g.grade === subject.selectedGrade);
        subject.marks = info ? (info.min + info.max) / 2 : null;
        this.debouncedUpdate();
    }

    handleAddSubject() {
        this.subjects.push({ id: 'subj_' + Date.now(), name: '', credits: 3, marks: null, selectedGrade: null });
        this.refreshSubjectRows();
        this.service.save();
    }

    handleRemoveSubject(index) {
        this.subjects.splice(index, 1);
        this.refreshSubjectRows();
        this.calculateGPA();
        this.service.save();
    }

    handleScaleChange(e) {
        this.service.currentScale = e.target.value;
        this.render();
        this.setupEventListeners();
        this.calculateGPA();
        this.service.save();
    }

    handleInputModeChange(mode) {
        this.service.inputMode = mode;
        this.render();
        this.setupEventListeners();
        this.calculateGPA();
        this.service.save();
    }

    handleWhatIfChange(e) {
        const val = parseInt(e.target.value);
        const el = document.getElementById('whatIfValue');
        if (el) el.textContent = `${val}%`;
        const projected = this.service.calculateWhatIf(val);
        const gpaEl = document.getElementById('whatIfGPA');
        if (gpaEl) gpaEl.textContent = projected ? projected.toFixed(2) : '—';
    }

    handleReset() {
        if (confirm('Reset all?')) {
            this.service.subjects = [];
            this.service.save();
            this.render();
            this.setupEventListeners();
            this.calculateGPA();
        }
    }

    handleSync() {
        this.service.importFromAcademic();
        this.render();
        this.setupEventListeners();
        this.calculateGPA();
    }

    calculateGPA() {
        const data = this.service.calculate();
        const gpaValue = this.container.querySelector('#gpaMainValue');
        const gpaProgress = this.container.querySelector('#gpaProgressFill');
        const gpaClassification = this.container.querySelector('#gpaClassification');

        if (data.gpa !== null) {
            gpaValue.textContent = data.gpa.toFixed(2);
            gpaValue.classList.remove('empty');
            const classification = this.service.getClassification(data.gpa);
            gpaValue.className = `gpa-main-value ${classification.class}`;
            if (gpaProgress) gpaProgress.style.width = `${(data.gpa / this.service.scales[this.currentScale].maxGPA) * 100}%`;
            if (gpaClassification) {
                gpaClassification.textContent = classification.label;
                gpaClassification.style.display = 'inline-block';
            }
        } else {
            gpaValue.textContent = '—';
            gpaValue.classList.add('empty');
            if (gpaProgress) gpaProgress.style.width = '0%';
            if (gpaClassification) gpaClassification.style.display = 'none';
        }

        const setVal = (id, val) => { const el = this.container.querySelector(id); if (el) el.textContent = val; };
        setVal('#totalCredits', data.totalCredits);
        setVal('#totalGradePoints', data.totalGradePoints.toFixed(1));
        setVal('#subjectCount', data.validSubjects);
        setVal('#averageMarks', data.averageMarks ? `${data.averageMarks.toFixed(1)}%` : '—');
    }

    refreshSubjectRows() {
        const el = this.container.querySelector('#subjectRowsContainer');
        if (el) el.innerHTML = this.renderSubjectRows();
    }

    debouncedUpdate() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.calculateGPA();
            this.service.save();
        }, 50);
    }
}

window.GPAPredictor = GPAPredictor;
window.initGPAPredictor = (id) => { const p = new GPAPredictor(id); p.init(); return p; };

export { GPAPredictor };
