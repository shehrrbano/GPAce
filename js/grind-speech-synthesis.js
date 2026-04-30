/**
 * Speech Synthesis Module for GPAce Grind
 * Facade for text-to-speech with word highlighting.
 * Part of Batch 18: Speech Service Extraction.
 */

import { speechSynthesisService } from './services/SpeechSynthesisService.js';
import { storageService } from './services/StorageService.js';

class GrindSpeechSynthesis {
    constructor() {
        this.service = speechSynthesisService;
        this.isSupported = this.service.isSupported;
        
        if (!this.isSupported) return;

        this.isSpeaking = false;
        this.loadPreferences();
    }

    loadPreferences() {
        const rate = storageService.get('tts-rate', '1.0');
        this.service.rate = parseFloat(rate);
        this.service.savedVoiceURI = storageService.get('tts-voice');
    }

    speak(text) {
        this.isSpeaking = true;
        this.service.speak(text, {
            onEnd: () => {
                this.isSpeaking = false;
                console.log('[GrindSpeech] Speaking complete.');
            }
        });
    }

    cancel() {
        this.service.cancel();
        this.isSpeaking = false;
    }
}

const grindSpeechSynthesis = new GrindSpeechSynthesis();
window.grindSpeechSynthesis = grindSpeechSynthesis;

window.speakText = (text) => grindSpeechSynthesis.speak(text);
window.stopSpeaking = () => grindSpeechSynthesis.cancel();

export default grindSpeechSynthesis;
