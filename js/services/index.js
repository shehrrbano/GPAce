/**
 * js/services/index.js
 * Services Index - Re-exports all service modules.
 * Pure ESM implementation.
 */

import storageService from './StorageService.js';
import secureStorage from './SecureStorage.js';
import taskSystem from '../core/TaskSystem.js';
import semesterService from './SemesterService.js';
import calendarService from './CalendarService.js';
import gpaService from './GPAService.js';
import geminiService from './GeminiService.js';
import mathService from './MathService.js';
import speechRecognitionService from './SpeechRecognitionService.js';
import speechSynthesisService from './SpeechSynthesisService.js';
import googleDriveService from './GoogleDriveService.js';

export {
    storageService,
    secureStorage,
    taskSystem as taskService,
    semesterService,
    calendarService,
    gpaService,
    geminiService,
    mathService,
    speechRecognitionService,
    speechSynthesisService,
    googleDriveService
};

// Singleton collection for convenience
const Services = {
    storage: storageService,
    secure: secureStorage,
    tasks: taskSystem,
    semester: semesterService,
    calendar: calendarService,
    gpa: gpaService,
    gemini: geminiService,
    math: mathService,
    speechRecognition: speechRecognitionService,
    speechSynthesis: speechSynthesisService,
    drive: googleDriveService
};

export default Services;
