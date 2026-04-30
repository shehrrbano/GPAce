/**
 * relaxed-mode/script.js
 * Thin facade for Relaxed Mode view.
 * Delegates to RelaxedController.js (Batch 14).
 */

import relaxedController from '../js/controllers/RelaxedController.js';

// Compatibility Layer for HTML event handlers
window.saveTask = () => relaxedController.saveTask();
window.deleteTask = (id) => relaxedController.deleteTask(id);
window.toggleTaskCompletion = (id) => relaxedController.completeTask(id);

// Initialize when ready
document.addEventListener('DOMContentLoaded', () => {
    relaxedController.init();
    
    // Setup event delegation for dynamic elements
    const list = document.getElementById('tasksList');
    if (list) {
        list.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            
            const id = btn.dataset.id;
            if (btn.dataset.action === 'delete') window.deleteTask(id);
        });
        
        list.addEventListener('change', (e) => {
            if (e.target.dataset.action === 'complete') window.toggleTaskCompletion(e.target.dataset.id);
        });
    }
});

export default relaxedController;
