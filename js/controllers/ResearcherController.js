/**
 * ResearcherController.js
 * UI management for AI Researcher.
 * Extracted from ai-researcher.js (Batch 12).
 */

import geminiService from '../services/GeminiService.js';
import { storageService } from '../services/StorageService.js';

class ResearcherController {
    constructor() {
        this.uploadedImage = null;
        this.uploadedPdf = null;
        this.isResearching = false;
    }

    init() {
        console.log('[ResearcherController] Initializing...');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const searchBtn = document.getElementById('performSearchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.handleSearch());
        }

        const fileInput = document.getElementById('imageUpload');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.uploadedImage = e.target.files[0];
                console.log('[ResearcherController] Image selected:', this.uploadedImage?.name);
            });
        }
    }

    async handleSearch() {
        if (this.isResearching) return;
        
        const query = document.getElementById('searchQuery')?.value.trim();
        if (!query && !this.uploadedImage && !this.uploadedPdf) {
            alert('Please enter a query or upload a file.');
            return;
        }

        // Open modal immediately to show "Analyzing" state
        const modal = document.getElementById('searchResultsModal');
        if (modal) {
            modal.style.display = 'flex';
            const container = document.getElementById('searchResults');
            if (container) {
                container.innerHTML = `
                    <div class="empty-results">
                        <i class="bi bi-stars"></i>
                        <p>AI is analyzing your query...</p>
                    </div>
                `;
            }
        }

        this.isResearching = true;
        this.updateUIStatus('Researching...');

        try {
            const result = await geminiService.research(query, {
                image: this.uploadedImage,
                pdf: this.uploadedPdf
            });
            this.displayResult(result);
        } catch (error) {
            console.error('[ResearcherController] Research failed:', error);
            this.updateUIStatus('Error: ' + error.message);
            
            // Show error in the results container too
            const container = document.getElementById('searchResults');
            if (container) {
                container.innerHTML = `
                    <div class="alert alert-danger">
                        <h5>Research Failed</h5>
                        <p>${error.message}</p>
                    </div>
                `;
            }
        } finally {
            this.isResearching = false;
        }
    }

    async handleFollowup() {
        if (this.isResearching) return;

        const followupInput = document.getElementById('followupSearchQuery');
        const query = followupInput?.value.trim();
        
        if (!query) return;

        // Clear input immediately
        followupInput.value = '';

        const container = document.getElementById('searchResults');
        if (container) {
            // Append the user's question to the results
            const userQueryDiv = document.createElement('div');
            userQueryDiv.className = 'user-followup-query mt-4 pt-3 border-top';
            userQueryDiv.innerHTML = `<h5 class="text-accent"><i class="bi bi-person"></i> You asked:</h5><p>${query}</p>`;
            container.appendChild(userQueryDiv);
            
            // Add a loading indicator for the AI response
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'followupLoading';
            loadingDiv.className = 'ai-followup-loading mt-3';
            loadingDiv.innerHTML = `<div class="d-flex align-items-center gap-2 text-muted small"><span class="spinner-border spinner-border-sm"></span> AI is thinking...</div>`;
            container.appendChild(loadingDiv);
            
            // Scroll to bottom
            container.scrollTop = container.scrollHeight;
        }

        this.isResearching = true;
        this.updateUIStatus('Thinking...');

        try {
            // We'll pass the whole container text as context for now to simulate "chat"
            // A better way would be actual chat history in GeminiService
            const context = container ? container.innerText : '';
            const result = await geminiService.research(query, {
                context: context
            });
            
            // Remove loading indicator
            const loadingDiv = document.getElementById('followupLoading');
            if (loadingDiv) loadingDiv.remove();

            // Append the AI's answer
            if (container) {
                const aiResponseDiv = document.createElement('div');
                aiResponseDiv.className = 'ai-followup-response mt-3';
                
                let processedHtml = result;
                if (window.marked && typeof window.marked.parse === 'function') {
                    processedHtml = window.marked.parse(result);
                }

                if (window.DOMPurify) {
                    aiResponseDiv.innerHTML = window.DOMPurify.sanitize(processedHtml);
                } else {
                    aiResponseDiv.innerHTML = processedHtml;
                }
                
                container.appendChild(aiResponseDiv);

                // Render LaTeX if MathJax is available
                if (window.renderMathJax) {
                    window.renderMathJax(aiResponseDiv);
                }

                // Scroll to bottom again
                container.scrollTop = container.scrollHeight;
            }

            this.updateUIStatus('Complete');
        } catch (error) {
            console.error('[ResearcherController] Followup failed:', error);
            this.updateUIStatus('Error: ' + error.message);
            
            // Remove loading indicator and show error
            const loadingDiv = document.getElementById('followupLoading');
            if (loadingDiv) {
                loadingDiv.innerHTML = `<div class="alert alert-danger p-2 small">Error: ${error.message}</div>`;
            }
        } finally {
            this.isResearching = false;
        }
    }

    displayResult(html) {
        const container = document.getElementById('searchResults');
        if (container) {
            // Convert Markdown to HTML if marked is available
            let processedHtml = html;
            if (window.marked && typeof window.marked.parse === 'function') {
                processedHtml = window.marked.parse(html);
            }

            // Use DOMPurify if available for safety
            if (window.DOMPurify) {
                container.innerHTML = window.DOMPurify.sanitize(processedHtml);
            } else {
                container.innerHTML = processedHtml;
            }

            // Render LaTeX if MathJax is available
            if (window.renderMathJax) {
                window.renderMathJax(container);
            } else if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise([container]).catch(err => console.error('MathJax error:', err));
            }
        }
        
        // Ensure modal is visible
        const modal = document.getElementById('searchResultsModal');
        if (modal) modal.style.display = 'flex';
        
        this.updateUIStatus('Complete');
    }

    updateUIStatus(msg) {
        const status = document.getElementById('researchStatus');
        if (status) status.textContent = msg;
    }
}

const researcherController = new ResearcherController();
export default researcherController;

// document.addEventListener('DOMContentLoaded', () => // researcherController.init());
