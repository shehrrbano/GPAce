/**
 * Speech Recognition Module for GPAce Workspace
 * Facade for real-time transcription and summarization.
 * Part of Batch 18: Speech Service Extraction.
 */

import { speechRecognitionService } from './services/SpeechRecognitionService.js';
import { storageService } from './services/StorageService.js';

class SpeechRecognitionManager {
    constructor() {
        this.service = speechRecognitionService;
        this.isSupported = this.service.isSupported;
        
        if (!this.isSupported) return;

        this.isRecording = false;
        this.isPaused = false;
        
        // Language settings
        this.primaryLanguage = storageService.get('primaryRecognitionLang', 'en-US');
        this.secondaryLanguage = storageService.get('secondaryRecognitionLang', 'hi-IN');
        this.currentLanguage = this.primaryLanguage;

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.service.onResult((data) => {
            console.log('[SpeechRecognition] Result:', data.transcript);
            this.handleTranscription(data);
        });

        this.service.onError((err) => {
            console.error('[SpeechRecognition] Error:', err);
            if (window.showToast) window.showToast(`Speech Error: \${err.error}`, 'error');
        });
    }

    handleTranscription(data) {
        const quill = window.quill;
        if (!quill) return;

        // Simplified transcription logic for facade
        if (data.isFinal) {
            const range = quill.getSelection() || { index: quill.getLength(), length: 0 };
            quill.insertText(range.index, data.transcript + ' ');
            quill.setSelection(range.index + data.transcript.length + 1, 0);
        }
    }

    start() {
        this.service.start(this.currentLanguage);
        this.isRecording = true;
        this.updateUI(true);
    }

    stop() {
        this.service.stop();
        this.isRecording = false;
        this.updateUI(false);
    }

    updateUI(isRecording) {
        const btn = document.getElementById('speechRecognitionBtn');
        if (btn) {
            btn.innerHTML = isRecording ? '<i class="bi bi-mic-fill"></i>' : '<i class="bi bi-mic"></i>';
        }
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === this.primaryLanguage ? this.secondaryLanguage : this.primaryLanguage;
        this.service.setLanguage(this.currentLanguage);
        if (window.showToast) window.showToast(`Language: \${this.currentLanguage}`, 'info');
    }
}

// Singleton and Globals
const speechRecognitionManager = new SpeechRecognitionManager();
window.speechRecognitionManager = speechRecognitionManager;

window.toggleSpeechRecognition = () => {
    if (speechRecognitionManager.isRecording) {
        speechRecognitionManager.stop();
    } else {
        speechRecognitionManager.start();
    }
};

export default speechRecognitionManager;
