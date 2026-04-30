/**
 * GeminiService.js
 * Pure logic for interacting with Google Gemini API, including
 * key rotation, PDF processing, and research execution.
 */

import { GoogleGenerativeAI } from 'https://esm.run/@google/generative-ai';
import { secretManager } from '../config/SecretManager.js';
import geminiKeyManager from '../GeminiKeyManager.js';
import storageService from './StorageService.js';

class GeminiService {
    constructor() {
        this.modelName = 'gemini-3-flash-preview';
        this.temperature = 0.4;
        this.keyIndex = 0;
        this.keys = [];
    }

    async init() {
        // Sync API keys from secretManager if needed
        const primaryKey = await secretManager.getGeminiKey();
        this.keys = [primaryKey].filter(k => k);

        // Read settings from storage
        this.modelName = storageService.get('api.geminiModel', 'gemini-3-flash-preview');
        this.temperature = storageService.get('api.geminiTemperature', 0.4);
        
        console.log(`[GeminiService] Initialized with model: ${this.modelName}, temp: ${this.temperature}`);
    }

    async getModel(apiKey) {
        const genAI = new GoogleGenerativeAI(apiKey);
        return genAI.getGenerativeModel({
            model: this.modelName,
            generationConfig: { temperature: this.temperature }
        });
    }

    async research(query, options = {}) {
        const { image, pdf, context } = options;
        
        // Refresh settings from storage to pick up recent changes
        this.modelName = storageService.get('api.geminiModel', 'gemini-3-flash-preview');
        this.temperature = storageService.get('api.geminiTemperature', 0.4);

        try {
            return await this._executeResearch(query, { image, pdf, context, model: this.modelName });
        } catch (error) {
            const errorMsg = error?.message || String(error);
            // If we hit a 429 on the primary model, try a fallback model automatically
            if (errorMsg.includes('429') || errorMsg.toLowerCase().includes('quota')) {
                const fallbackModel = 'gemini-3-flash-preview';
                if (this.modelName !== fallbackModel) {
                    console.warn(`[GeminiService] Primary model ${this.modelName} exhausted. Falling back to ${fallbackModel}...`);
                    return await this._executeResearch(query, { image, pdf, context, model: fallbackModel });
                }
            }
            throw error;
        }
    }

    async _executeResearch(query, options) {
        const { image, pdf, context, model: modelName } = options;

        return await geminiKeyManager.withKeyRotation(async (apiKey) => {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: { temperature: this.temperature }
            });

            if (image) {
                return this._researchWithImage(model, query, image, context);
            } else if (pdf) {
                return this._researchWithPdf(model, query, pdf, context);
            } else {
                return this._researchText(model, query, context);
            }
        }, { label: `Researcher API call (${modelName})` });
    }

    async _researchText(model, query, context = '') {
        let prompt = `${query}\n\nFORMATTING RULES: Avoid LaTeX. Use standard chemical notation (e.g., H2O, NaCl) and Unicode for superscripts/subscripts (e.g., Na⁺, Mg²⁺, SO₄²⁻). Use plain Markdown for structure.`;
        
        if (context) {
            prompt = `Context of previous conversation:\n${context}\n\nUser follow-up question: ${query}\n\nProvide a concise and helpful follow-up response based on the context above. Use standard chemical notation and Unicode. Avoid LaTeX.`;
        }

        const result = await model.generateContent(prompt);
        return result.response.text();
    }

    async _researchWithImage(model, query, imageFile, context = '') {
        const imagePart = await this.fileToGenerativePart(imageFile);
        const basePrompt = query || "Analyze this image in detail";
        let prompt = `${basePrompt}\n\nFORMATTING RULES: Avoid LaTeX. Use standard chemical notation and Unicode for charges/subscripts.`;
        
        if (context) {
            prompt = `Previous Context: ${context}\n\nFollow-up question about the image: ${query || 'Explain more about this.'}\n\nFORMATTING RULES: Avoid LaTeX. Use standard chemical notation and Unicode.`;
        }

        const result = await model.generateContent([prompt, imagePart]);
        return result.response.text();
    }

    async _researchWithPdf(model, query, pdfFile, context = '') {
        // Simple implementation - in a real app, you might use a PDF parser or 
        // Gemini's native PDF support if available via File API.
        // For now, we'll treat it as a request to analyze a PDF.
        const basePrompt = query || "Analyze this document";
        let prompt = `${basePrompt}\n\nNote: A PDF document was uploaded. Please provide general insights if you can process it, or explain how to help further.\n\nFORMATTING RULES: Avoid LaTeX. Use standard chemical notation and Unicode.`;

        if (context) {
            prompt = `Previous Context: ${context}\n\nFollow-up question about the PDF: ${query || 'Explain more.'}\n\nFORMATTING RULES: Avoid LaTeX. Use standard chemical notation and Unicode.`;
        }

        const result = await model.generateContent(prompt);
        return result.response.text();
    }

    async fileToGenerativePart(file) {
        const base64EncodedData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(file);
        });
        return {
            inlineData: {
                data: base64EncodedData,
                mimeType: file.type
            }
        };
    }

    // PDF processing logic would be ported here as well
    // (keeping it minimal for the first pass)
}

const geminiService = new GeminiService();
export default geminiService;
export { geminiService, GeminiService };
