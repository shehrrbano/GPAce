/**
 * ai-researcher.js
 * Legacy facade for AI Researcher components.
 * Delegates to GeminiService, MathService, and ResearcherController.
 * Part of Batch 12: AI Researcher Decoupling.
 */

import geminiService from './services/GeminiService.js';
import mathService from './services/MathService.js';
import researcherController from './controllers/ResearcherController.js';
import { storageService } from './services/StorageService.js';

// Compatibility Layer
window.geminiService = geminiService;
window.mathService = mathService;
window.researcherController = researcherController;

// Re-expose legacy functions if still called from HTML
window.performAISearch = () => researcherController.handleSearch();
window.toggleApiConfig = () => {
    const el = document.getElementById('apiConfigSection');
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

// Initialize services
document.addEventListener('DOMContentLoaded', async () => {
    await mathService.init();
    await geminiService.init();
    console.log('[AI Researcher] System initialized via decoupled services.');
});

export { geminiService, mathService, researcherController };
