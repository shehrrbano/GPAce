/**
 * SpeechSynthesisService.js
 * Logic for managing text-to-speech synthesis using the Web Speech API.
 * Extracted from GrindSpeechSynthesis (Batch 18).
 */

class SpeechSynthesisService {
    constructor() {
        this.isSupported = 'speechSynthesis' in window;
        this.synthesis = this.isSupported ? window.speechSynthesis : null;
        this.currentVoice = null;
        this.rate = 1.0;
        this.pitch = 1.0;
        this.volume = 1.0;
    }

    getVoices() {
        if (!this.isSupported) return [];
        return this.synthesis.getVoices();
    }

    speak(text, options = {}) {
        if (!this.isSupported || !text) return;

        this.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = options.voice || this.currentVoice;
        utterance.rate = options.rate || this.rate;
        utterance.pitch = options.pitch || this.pitch;
        utterance.volume = options.volume || this.volume;

        if (options.onBoundary) utterance.onboundary = options.onBoundary;
        if (options.onEnd) utterance.onend = options.onEnd;
        if (options.onError) utterance.onerror = options.onError;

        this.synthesis.speak(utterance);
        return utterance;
    }

    pause() {
        if (this.isSupported) this.synthesis.pause();
    }

    resume() {
        if (this.isSupported) this.synthesis.resume();
    }

    cancel() {
        if (this.isSupported) this.synthesis.cancel();
    }

    setVoice(voiceURI) {
        const voices = this.getVoices();
        this.currentVoice = voices.find(v => v.voiceURI === voiceURI) || voices[0];
    }
}

const speechSynthesisService = new SpeechSynthesisService();
export default speechSynthesisService;
export { speechSynthesisService, SpeechSynthesisService };
