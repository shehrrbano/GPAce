/**
 * GPAService.js
 * Logic for GPA calculations, grading scales, and academic data synchronization.
 * Extracted from GPAPredictor (Batch 9).
 */

import { storageService } from './StorageService.js';

const GRADING_SCALES = {
    '4.0': {
        name: '4.0 Scale (US Standard)',
        maxGPA: 4.0,
        grades: [
            { min: 90, max: 100, grade: 'A+', gp: 4.0 },
            { min: 85, max: 89.99, grade: 'A', gp: 4.0 },
            { min: 80, max: 84.99, grade: 'A-', gp: 3.7 },
            { min: 75, max: 79.99, grade: 'B+', gp: 3.3 },
            { min: 70, max: 74.99, grade: 'B', gp: 3.0 },
            { min: 65, max: 69.99, grade: 'B-', gp: 2.7 },
            { min: 60, max: 64.99, grade: 'C+', gp: 2.3 },
            { min: 55, max: 59.99, grade: 'C', gp: 2.0 },
            { min: 50, max: 54.99, grade: 'C-', gp: 1.7 },
            { min: 45, max: 49.99, grade: 'D', gp: 1.0 },
            { min: 0, max: 44.99, grade: 'F', gp: 0.0 }
        ]
    },
    '10.0': {
        name: '10.0 Scale (India/Europe)',
        maxGPA: 10.0,
        grades: [
            { min: 90, max: 100, grade: 'O', gp: 10.0 },
            { min: 80, max: 89.99, grade: 'A+', gp: 9.0 },
            { min: 70, max: 79.99, grade: 'A', gp: 8.0 },
            { min: 60, max: 69.99, grade: 'B+', gp: 7.0 },
            { min: 50, max: 59.99, grade: 'B', gp: 6.0 },
            { min: 45, max: 49.99, grade: 'C', gp: 5.0 },
            { min: 40, max: 44.99, grade: 'D', gp: 4.0 },
            { min: 0, max: 39.99, grade: 'F', gp: 0.0 }
        ]
    },
    '5.0': {
        name: '5.0 Scale',
        maxGPA: 5.0,
        grades: [
            { min: 90, max: 100, grade: 'A+', gp: 5.0 },
            { min: 85, max: 89.99, grade: 'A', gp: 4.5 },
            { min: 80, max: 84.99, grade: 'A-', gp: 4.0 },
            { min: 75, max: 79.99, grade: 'B+', gp: 3.5 },
            { min: 70, max: 74.99, grade: 'B', gp: 3.0 },
            { min: 65, max: 69.99, grade: 'B-', gp: 2.5 },
            { min: 60, max: 64.99, grade: 'C+', gp: 2.0 },
            { min: 55, max: 59.99, grade: 'C', gp: 1.5 },
            { min: 50, max: 54.99, grade: 'D', gp: 1.0 },
            { min: 0, max: 49.99, grade: 'F', gp: 0.0 }
        ]
    }
};

const STORAGE_KEY = 'gpa_predictor_data_v3';

class GPAService {
    constructor() {
        this.subjects = [];
        this.currentScale = '4.0';
        this.inputMode = 'marks';
    }

    get scales() { return GRADING_SCALES; }

    load() {
        const data = storageService.get(STORAGE_KEY, null);
        if (data) {
            this.subjects = data.subjects || [];
            this.currentScale = data.currentScale || '4.0';
            this.inputMode = data.inputMode || 'marks';
        } else {
            this.importFromAcademic();
        }
    }

    save() {
        storageService.set(STORAGE_KEY, {
            subjects: this.subjects,
            currentScale: this.currentScale,
            inputMode: this.inputMode
        });
    }

    importFromAcademic() {
        const academicRaw = storageService.get('academicSubjects');
        if (!academicRaw) return;

        try {
            const academic = JSON.parse(academicRaw);
            if (Array.isArray(academic)) {
                this.subjects = academic.map(s => ({
                    id: s.tag || `subj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                    name: s.name || 'Unnamed',
                    credits: parseFloat(s.creditHours || s.hours || 3),
                    marks: s.academicPerformance !== undefined ? parseFloat(s.academicPerformance) : null,
                    selectedGrade: null,
                    _sourceTag: s.tag
                }));
                this.save();
            }
        } catch (e) {
            console.error('[GPAService] Import failed:', e);
        }
    }

    getGradeInfo(marks, scaleKey = null) {
        if (marks === null || marks === undefined) return { grade: null, gp: null };
        const scale = GRADING_SCALES[scaleKey || this.currentScale];
        for (const g of scale.grades) {
            if (marks >= g.min && marks <= g.max) return { grade: g.grade, gp: g.gp };
        }
        return { grade: 'F', gp: 0 };
    }

    calculate() {
        let totalCredits = 0;
        let totalGradePoints = 0;
        let totalMarks = 0;
        let validSubjects = 0;
        let subjectsWithMarks = 0;

        this.subjects.forEach(s => {
            if (s.credits <= 0) return;
            const info = this.getGradeInfo(s.marks);
            if (info.gp !== null) {
                totalCredits += s.credits;
                totalGradePoints += s.credits * info.gp;
                validSubjects++;
                if (s.marks !== null) {
                    totalMarks += s.marks;
                    subjectsWithMarks++;
                }
            }
        });

        return {
            gpa: totalCredits > 0 ? totalGradePoints / totalCredits : null,
            totalCredits,
            totalGradePoints,
            validSubjects,
            averageMarks: subjectsWithMarks > 0 ? totalMarks / subjectsWithMarks : null
        };
    }

    calculateWhatIf(targetMarks) {
        let simGP = 0;
        let totalCredits = 0;

        this.subjects.forEach(s => {
            if (s.credits > 0) {
                totalCredits += s.credits;
                const marks = s.marks !== null ? s.marks : targetMarks;
                simGP += s.credits * (this.getGradeInfo(marks).gp || 0);
            }
        });

        return totalCredits > 0 ? simGP / totalCredits : null;
    }

    getClassification(gpa) {
        const scale = GRADING_SCALES[this.currentScale];
        const pct = (gpa / scale.maxGPA) * 100;
        if (pct >= 85) return { class: 'excellent', label: 'Excellent' };
        if (pct >= 70) return { class: 'good', label: 'Good' };
        if (pct >= 50) return { class: 'average', label: 'Average' };
        return { class: 'poor', label: 'Needs Improvement' };
    }
}

const gpaService = new GPAService();
export default gpaService;
export { gpaService, GPAService };

