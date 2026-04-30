/**
 * SpeechRecognitionService.js
 * Logic for managing speech-to-text recognition using the Web Speech API.
 * Extracted from SpeechRecognitionManager (Batch 18).
 */

class SpeechRecognitionService {
    constructor() {
        this.isSupported = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
        this.recognition = null;
        this.isRecording = false;
        
        if (this.isSupported) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
        }
    }

    start(lang = 'en-US') {
        if (!this.isSupported || this.isRecording) return;
        this.recognition.lang = lang;
        this.recognition.start();
        this.isRecording = true;
    }

    stop() {
        if (!this.isSupported || !this.isRecording) return;
        this.recognition.stop();
        this.isRecording = false;
    }

    setLanguage(lang) {
        if (!this.isSupported) return;
        const wasRecording = this.isRecording;
        if (wasRecording) this.stop();
        this.recognition.lang = lang;
        if (wasRecording) this.start(lang);
    }

    onResult(callback) {
        if (!this.isSupported) return;
        this.recognition.onresult = (event) => {
            const results = Array.from(event.results);
            const transcript = results
                .map(result => result[0].transcript)
                .join('');
            const isFinal = results[event.resultIndex].isFinal;
            callback({ transcript, isFinal, event });
        };
    }

    onError(callback) {
        if (!this.isSupported) return;
        this.recognition.onerror = callback;
    }

    onEnd(callback) {
        if (!this.isSupported) return;
        this.recognition.onend = () => {
            this.isRecording = false;
            callback();
        };
    }
}

const speechRecognitionService = new SpeechRecognitionService();
export default speechRecognitionService;
export { speechRecognitionService, SpeechRecognitionService };
