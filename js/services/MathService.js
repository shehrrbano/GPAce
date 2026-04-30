/**
 * MathService.js
 * Logic for rendering LaTeX math using KaTeX.
 * Extracted from ai-researcher.js (Batch 12).
 */

class MathService {
    constructor() {
        this.initialized = false;
        this.katexLoaded = false;
        this.patterns = [
            { regex: /\$\$([\s\S]+?)\$\$/g, display: true },
            { regex: /\\\[([\s\S]+?)\\\]/g, display: true },
            { regex: /\\begin\{([a-z]+)\}([\s\S]+?)\\end\{\1\}/g, display: true },
            { regex: /\$([^$\n]+?)\$/g, display: false },
            { regex: /\\\((.+?)\\\)/g, display: false }
        ];
    }

    async init() {
        if (this.initialized) return;
        
        // Load KaTeX CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
        document.head.appendChild(link);

        // Load KaTeX JS
        await new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
            script.onload = () => {
                this.katexLoaded = true;
                resolve();
            };
            document.head.appendChild(script);
        });

        this.initialized = true;
    }

    renderElement(element) {
        if (!element || !this.katexLoaded) return;
        
        const { text, blocks } = this.prepare(element.innerHTML);
        element.innerHTML = this.restore(text, blocks);
    }

    prepare(text) {
        if (!text) return { text: '', blocks: [] };
        const blocks = [];
        let processedText = text;

        this.patterns.forEach((pattern) => {
            processedText = processedText.replace(pattern.regex, (match, latex) => {
                if (!latex || !latex.trim()) return match;
                const id = `MATHBLOCK${blocks.length}X${Date.now()}`;
                let rendered = match;

                try {
                    rendered = window.katex.renderToString(latex, {
                        displayMode: pattern.display,
                        throwOnError: false,
                        strict: false
                    });
                } catch (e) {
                    console.warn('[MathService] Render error:', e);
                }

                const wrapper = `<span class="math-container" data-latex="${encodeURIComponent(latex)}">${rendered}</span>`;
                blocks.push({ id, content: wrapper });
                return id;
            });
        });

        return { text: processedText, blocks };
    }

    restore(html, blocks) {
        let restoredHtml = html;
        blocks.forEach(block => {
            restoredHtml = restoredHtml.replace(new RegExp(block.id, 'g'), block.content);
        });
        return restoredHtml;
    }
}

const mathService = new MathService();
export default mathService;
export { mathService, MathService };
