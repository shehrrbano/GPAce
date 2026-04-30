/**
 * workspace-document.js
 * Handles document operations (new, open, save, export)
 */

import globals from './core/globals.js';
import { editorState, updateLastSaved, updateCounts } from './workspace-core.js';

// Storage helper with fallback
const getStorage = () => window.getStorage?.() || window.StorageService || {
    get: (k, d) => { try { return JSON.parse(storageService.get(k)) ?? d; } catch { return d; } },
    set: (k, v) => storageService.set(k, v)
};

/**
 * Save content to storage and server if available
 */
function saveContent() {
    const quill = globals.get('quill');
    if (!quill) return;

    const storage = getStorage();
    const content = quill.getContents();
    const contentStr = JSON.stringify(content);

    // Save to storage
    storage.set('workspaceContent', content);

    // Try to save to server if available
    if (window.parent && window.parent.saveDocumentToServer) {
        try {
            window.parent.saveDocumentToServer(contentStr, 'workspace_document')
                .catch(error => {
                    console.warn('Could not save to server, using local storage only:', error);
                });
        } catch (error) {
            console.warn('Server save function not available, using local storage only');
        }
    }

    // Update save time
    editorState.lastSaved = new Date();
    updateLastSaved();
    if (window.showToast) window.showToast('Document saved', 'success');
}

/**
 * Create a new document
 */
function newDocument() {
    const quill = globals.get('quill');
    if (!quill) return;

    if (confirm('Create new document? Any unsaved changes will be lost.')) {
        quill.setContents([]);
        updateCounts();
        if (window.showToast) window.showToast('New document created', 'success');
    }
}

/**
 * Save the current document
 */
async function saveDocument() {
    try {
        saveContent();
    } catch (error) {
        console.error('Error saving document:', error);
        if (window.showToast) window.showToast('Error saving document', 'error');
    }
}

/**
 * Open a document from file
 */
function openDocument() {
    const quill = globals.get('quill');
    if (!quill) return;

    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,.txt,.html';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    // Handle file selection
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    // Try to parse as JSON (Quill Delta format)
                    const content = JSON.parse(e.target.result);
                    quill.setContents(content);
                    if (window.showToast) window.showToast(`Document '${file.name}' opened successfully`, 'success');
                } catch (error) {
                    // If not valid JSON, try to insert as plain text or HTML
                    try {
                        if (file.name.endsWith('.html')) {
                            quill.clipboard.dangerouslyPasteHTML(e.target.result);
                        } else {
                            quill.setText(e.target.result);
                        }
                        if (window.showToast) window.showToast(`Document '${file.name}' opened as text`, 'success');
                    } catch (err) {
                        console.error('Error opening document:', err);
                        if (window.showToast) window.showToast('Error opening document', 'error');
                    }
                }
                updateCounts();
            };

            reader.onerror = () => {
                if (window.showToast) window.showToast('Error reading file', 'error');
            };

            reader.readAsText(file);
        }

        // Clean up
        document.body.removeChild(fileInput);
    });

    // Trigger file selection dialog
    fileInput.click();
}

/**
 * Export document as JSON file
 */
function exportAsJson() {
    const quill = globals.get('quill');
    if (!quill) return;

    const content = quill.getContents();
    const contentStr = JSON.stringify(content, null, 2);

    // Create a blob and download link
    const blob = new Blob([contentStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'GPAce_Document.json';
    document.body.appendChild(link);

    // Trigger download
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (window.showToast) window.showToast('Document exported as JSON', 'success');
}

/**
 * Export document as PDF
 */
function exportAsPDF() {
    const quill = globals.get('quill');
    if (!quill) return;

    if (window.showToast) window.showToast('Preparing PDF export...', 'info');

    // Create a hidden iframe to print from
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    // Get and sanitize the editor content
    const content = window.DOMPurify ? window.DOMPurify.sanitize(quill.root.innerHTML) : quill.root.innerHTML;

    // Write the content to the iframe
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>GPAce Document</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.5;
                    margin: 1cm;
                }
                img {
                    max-width: 100%;
                }
                table {
                    border-collapse: collapse;
                    width: 100%;
                }
                table, th, td {
                    border: 1px solid #ddd;
                }
                th, td {
                    padding: 8px;
                    text-align: left;
                }
            </style>
        </head>
        <body>
            ${content}
        </body>
        </html>
    `);
    doc.close();

    // Wait for content to load then print
    iframe.onload = () => {
        try {
            iframe.contentWindow.print();
            if (window.showToast) window.showToast('PDF export ready', 'success');
        } catch (error) {
            console.error('Error printing document:', error);
            if (window.showToast) window.showToast('Error exporting to PDF', 'error');
        }

        // Clean up after printing dialog is closed
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
    };
}

/**
 * Export document as Word
 */
function exportAsWord() {
    const quill = globals.get('quill');
    if (!quill) return;
    
    if (!window.docx) {
        if (window.showToast) window.showToast('Docx library not loaded', 'error');
        return;
    }

    const toastId = window.showToast ? window.showToast('Preparing Word export...', 'info', 0) : null;

    try {
        // Create a new document with proper styling
        const doc = new window.docx.Document({
            styles: {
                paragraphStyles: [
                    {
                        id: 'Normal',
                        name: 'Normal',
                        run: {
                            font: 'Arial',
                            size: 24, // 12pt
                        },
                        paragraph: {
                            spacing: {
                                line: 276, // 1.15 line spacing
                            },
                        },
                    },
                ],
            },
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: 1440, // 1 inch in twips
                            right: 1440,
                            bottom: 1440,
                            left: 1440,
                        },
                    },
                },
                children: []
            }]
        });

        // Get the editor content as HTML
        const html = quill.root.innerHTML;

        // Create a temporary div to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Process the HTML content and add paragraphs to the document
        const children = [];

        // Process each element in the HTML
        tempDiv.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                // Handle text nodes
                if (node.textContent.trim()) {
                    children.push(new window.docx.Paragraph({
                        children: [new window.docx.TextRun(node.textContent)]
                    }));
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // Handle element nodes
                switch (node.tagName.toLowerCase()) {
                    case 'p':
                        const paragraph = new window.docx.Paragraph({
                            children: Array.from(node.childNodes).map(childNode => {
                                if (childNode.nodeType === Node.TEXT_NODE) {
                                    return new window.docx.TextRun(childNode.textContent);
                                } else if (childNode.nodeType === Node.ELEMENT_NODE) {
                                    // Handle formatting
                                    const options = { text: childNode.textContent };

                                    if (childNode.tagName.toLowerCase() === 'strong' || childNode.tagName.toLowerCase() === 'b') {
                                        options.bold = true;
                                    }
                                    if (childNode.tagName.toLowerCase() === 'em' || childNode.tagName.toLowerCase() === 'i') {
                                        options.italic = true;
                                    }
                                    if (childNode.tagName.toLowerCase() === 'u') {
                                        options.underline = {};
                                    }
                                    if (childNode.tagName.toLowerCase() === 's') {
                                        options.strike = true;
                                    }
                                    if (childNode.tagName.toLowerCase() === 'a') {
                                        options.color = '0000FF';
                                        options.underline = {};
                                    }
                                    if (childNode.style && childNode.style.color) {
                                        options.color = childNode.style.color.replace('#', '');
                                    }
                                    if (childNode.style && childNode.style.backgroundColor) {
                                        options.highlight = childNode.style.backgroundColor.replace('#', '');
                                    }

                                    return new window.docx.TextRun(options);
                                }
                                return new window.docx.TextRun('');
                            })
                        });
                        children.push(paragraph);
                        break;

                    case 'h1':
                    case 'h2':
                    case 'h3':
                    case 'h4':
                    case 'h5':
                    case 'h6':
                        const level = parseInt(node.tagName.charAt(1));
                        const headingLevel = level <= 6 ? level : 6;
                        children.push(new window.docx.Paragraph({
                            heading: window.docx.HeadingLevel[`HEADING_${headingLevel}`],
                            children: [new window.docx.TextRun(node.textContent)]
                        }));
                        break;

                    case 'ul':
                    case 'ol':
                        Array.from(node.querySelectorAll('li')).forEach(li => {
                            children.push(new window.docx.Paragraph({
                                bullet: { level: 0 },
                                children: [new window.docx.TextRun(li.textContent)]
                            }));
                        });
                        break;

                    case 'img':
                        // Skip images for now as they require more complex handling
                        children.push(new window.docx.Paragraph({
                            children: [new window.docx.TextRun('[Image]')]
                        }));
                        break;

                    case 'table':
                        // Skip tables for now as they require more complex handling
                        children.push(new window.docx.Paragraph({
                            children: [new window.docx.TextRun('[Table]')]
                        }));
                        break;

                    default:
                        // For other elements, just add their text content
                        if (node.textContent.trim()) {
                            children.push(new window.docx.Paragraph({
                                children: [new window.docx.TextRun(node.textContent)]
                            }));
                        }
                }
            }
        });

        // Add content to the document
        doc.addSection({
            children: children
        });

        // Generate the document
        window.docx.Packer.toBlob(doc).then(blob => {
            // Hide the loading toast
            if (window.hideToast && toastId) window.hideToast(toastId);

            // Create a download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'GPAce_Document.docx';
            document.body.appendChild(link);

            // Trigger download
            link.click();

            // Clean up
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            if (window.showToast) window.showToast('Word document exported successfully', 'success');
        }).catch(error => {
            if (window.hideToast && toastId) window.hideToast(toastId);
            console.error('Error generating Word document:', error);
            if (window.showToast) window.showToast('Error generating Word document', 'error');
        });
    } catch (error) {
        if (window.hideToast && toastId) window.hideToast(toastId);
        console.error('Error exporting to Word:', error);
        if (window.showToast) window.showToast('Error exporting to Word', 'error');
    }
}

// Global Registration
globals.register('saveContent', saveContent, { module: 'workspace-document' });
globals.register('newDocument', newDocument, { module: 'workspace-document' });
globals.register('saveDocument', saveDocument, { module: 'workspace-document' });
globals.register('openDocument', openDocument, { module: 'workspace-document' });
globals.register('exportAsJson', exportAsJson, { module: 'workspace-document' });
globals.register('exportAsPDF', exportAsPDF, { module: 'workspace-document' });
globals.register('exportAsWord', exportAsWord, { module: 'workspace-document' });

export {
    saveContent,
    newDocument,
    saveDocument,
    openDocument,
    exportAsJson,
    exportAsPDF,
    exportAsWord
};

