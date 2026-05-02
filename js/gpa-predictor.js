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
            <div class="predictor-card-legacy" role="region" aria-label="GPA Predictor">
                <div class="predictor-header-legacy">
                    <div class="predictor-title-wrap">
                        <i class="bi bi-calculator" style="font-size: 24px; color: #ff2d55;"></i>
                        <h3 style="color: white; font-weight: 700;">GPA Predictor</h3>
                    </div>
                    <div class="gpa-predictor-controls">
                        <div class="scale-selector" style="display: flex; align-items: center; gap: 10px;">
                            <label for="gpaScale" style="font-size: 13px; color: #888;">Scale:</label>
                            <select id="gpaScale" class="row-input-legacy" style="width: auto; padding: 4px 10px;">
                                ${Object.entries(this.service.scales).map(([key, s]) => `
                                    <option value="${key}" ${key === this.currentScale ? 'selected' : ''}>
                                        ${s.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="input-mode-toggle" style="margin-top: 10px; display: flex; gap: 5px;">
                            <button type="button" class="btn btn-outline-light btn-xs ${this.inputMode === 'marks' ? 'active' : ''}" data-mode="marks" style="font-size: 11px; padding: 2px 8px;">Marks</button>
                            <button type="button" class="btn btn-outline-light btn-xs ${this.inputMode === 'grade' ? 'active' : ''}" data-mode="grade" style="font-size: 11px; padding: 2px 8px;">Grade</button>
                        </div>
                    </div>
                </div>

                <div class="gpa-main-display-legacy">
                    <div id="gpaMainValue" class="gpa-value-large empty">—</div>
                    <div class="gpa-label-sub">Academic GPA (Out of ${scale.maxGPA.toFixed(1)})</div>
                </div>

                <div class="predictor-stats-row">
                    <div class="stat-box-legacy">
                        <span id="totalCredits" class="val">0</span>
                        <span class="lbl">Total Credits</span>
                    </div>
                    <div class="stat-box-legacy">
                        <span id="averageMarks" class="val">—</span>
                        <span class="lbl">Avg. Percentage</span>
                    </div>
                </div>

                <div class="gpa-subjects-container" style="background: rgba(0,0,0,0.2); border-radius: 8px; padding: 20px;">
                    <table class="subjects-table-legacy">
                        <thead>
                            <tr>
                                <th style="width: 40%;">SUBJECT</th>
                                <th style="width: 15%;">CREDITS</th>
                                <th style="width: 15%;">${this.inputMode === 'marks' ? 'MARKS' : 'GRADE'}</th>
                                <th style="width: 15%;">RESULT</th>
                                <th style="width: 10%;">GP</th>
                                <th style="width: 5%;"></th>
                            </tr>
                        </thead>
                        <tbody id="subjectRowsContainer">
                            ${this.renderSubjectRows()}
                        </tbody>
                    </table>
                </div>

                <div style="margin-top: 20px;">
                    <button type="button" class="btn btn-outline-primary btn-sm" id="addSubjectBtn" style="width: 100%; justify-content: center; border-style: dashed; opacity: 0.8;">
                        <i class="bi bi-plus-circle"></i> Add Subject
                    </button>
                    </div>
                    <div class="d-flex gap-2 mt-3">
                    <button type="button" class="btn btn-outline-danger btn-sm flex-grow-1" id="resetBtn"><i class="bi bi-trash"></i> Reset</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderSubjectRows() {
        if (this.subjects.length === 0) {
            return '<tr><td colspan="6" style="text-align: center; color: #666; padding: 40px;">No subjects added. Click "Add Subject Entry" to start.</td></tr>';
        }
        return this.subjects.map((s, i) => this.renderSubjectRow(s, i)).join('');
    }

    renderSubjectRow(s, i) {
        const info = this.service.getGradeInfo(s.marks);
        return `
            <tr data-index="${i}">
                <td><input type="text" class="row-input-legacy subject-name-input" data-index="${i}" value="${s.name}" placeholder="Name"></td>
                <td><input type="number" class="row-input-legacy subject-credits-input" data-index="${i}" value="${s.credits}" min="0" max="12"></td>
                <td>
                    <input type="number" class="row-input-legacy subject-marks-input" data-index="${i}" value="${s.marks || ''}" 
                           style="display: ${this.inputMode === 'marks' ? 'block' : 'none'}">
                    <select class="row-input-legacy subject-grade-select" data-index="${i}"
                            style="display: ${this.inputMode === 'grade' ? 'block' : 'none'}">
                        <option value="">Select</option>
                        ${this.service.scales[this.currentScale].grades.map(g => `
                            <option value="${g.grade}" ${s.selectedGrade === g.grade ? 'selected' : ''}>${g.grade}</option>
                        `).join('')}
                    </select>
                </td>
                <td style="color: ${info.grade === 'F' ? '#ff4b5c' : '#00ff88'}; font-weight: 700;">${info.grade || '—'}</td>
                <td style="font-weight: 600;">${info.gp !== null ? info.gp.toFixed(1) : '—'}</td>
                <td><button type="button" class="btn-remove-row" data-index="${i}" style="background: none; border: none; color: #555; cursor: pointer;"><i class="bi bi-x-lg"></i></button></td>
            </tr>
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
