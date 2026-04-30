/**
 * workspace-tables-links.js
 * Handles table and link insertion and management
 */

import globals from './core/globals.js';

/**
 * Show table insertion dialog
 */
function insertTable() {
    const el = document.getElementById('tableModal');
    if (el) el.style.display = 'block';
}

/**
 * Close table dialog
 */
function closeTableDialog() {
    const el = document.getElementById('tableModal');
    if (el) el.style.display = 'none';
}

/**
 * Insert table from dialog
 */
function insertTableFromDialog() {
    const quill = globals.get('quill');
    if (!quill) return;

    const rowsInput = document.getElementById('tableRows');
    const colsInput = document.getElementById('tableColumns');
    const rows = parseInt(rowsInput ? rowsInput.value : '2') || 2;
    const cols = parseInt(colsInput ? colsInput.value : '2') || 2;

    if (rows > 0 && cols > 0) {
        let tableHTML = '<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">';
        tableHTML += '<tbody>';

        for (let i = 0; i < rows; i++) {
            tableHTML += '<tr>';
            for (let j = 0; j < cols; j++) {
                tableHTML += '<td style="border: 1px solid #ccc; padding: 8px; min-width: 50px;">Cell</td>';
            }
            tableHTML += '</tr>';
        }

        tableHTML += '</tbody></table><p><br></p>';

        const range = quill.getSelection(true);
        if (range) {
            const currentPosition = range.index;
            const currentLine = quill.getLine(currentPosition)[0];
            const indexAtLineStart = currentLine ? quill.getIndex(currentLine) : 0;

            if (currentPosition > 0 && currentPosition !== indexAtLineStart) {
                quill.insertText(currentPosition, '\n');
                quill.setSelection(currentPosition + 1, 0);
                quill.clipboard.dangerouslyPasteHTML(currentPosition + 1, tableHTML);
            } else {
                quill.clipboard.dangerouslyPasteHTML(currentPosition, tableHTML);
            }
        } else {
            const length = quill.getLength();
            quill.clipboard.dangerouslyPasteHTML(length, tableHTML);
        }

        closeTableDialog();
        if (window.showToast) window.showToast(`Table with ${rows} rows and ${cols} columns inserted`, 'success');
    } else {
        if (window.showToast) window.showToast('Please enter valid numbers for rows and columns', 'error');
    }
}

/**
 * Show link insertion dialog
 */
function insertLink() {
    const quill = globals.get('quill');
    if (!quill) return;

    const modal = document.getElementById('linkUrlModal');
    if (modal) modal.style.display = 'block';
    
    const urlInput = document.getElementById('linkUrl');
    const textInput = document.getElementById('linkText');
    if (urlInput) urlInput.value = '';
    if (textInput) textInput.value = '';

    const range = quill.getSelection();
    if (range && range.length > 0 && textInput) {
        const text = quill.getText(range.index, range.length);
        textInput.value = text;
    }
}

/**
 * Close link dialog
 */
function closeLinkDialog() {
    const el = document.getElementById('linkUrlModal');
    if (el) el.style.display = 'none';
}

/**
 * Insert link from dialog
 */
function insertLinkFromDialog() {
    const quill = globals.get('quill');
    if (!quill) return;

    const urlInput = document.getElementById('linkUrl');
    const textInput = document.getElementById('linkText');
    let url = urlInput ? urlInput.value : '';
    const text = (textInput ? textInput.value : '') || url;

    if (url) {
        if (!/^https?:\/\//i.test(url)) {
            url = 'http://' + url;
        }

        const range = quill.getSelection(true);

        if (range) {
            if (range.length > 0) {
                quill.deleteText(range.index, range.length);
            }
            quill.insertText(range.index, text, 'link', url);
            quill.setSelection(range.index + text.length);
        } else {
            const length = quill.getLength();
            quill.insertText(length - 1, text, 'link', url);
            quill.setSelection(length - 1 + text.length);
        }

        closeLinkDialog();
        if (window.showToast) window.showToast('Link inserted', 'success');
    } else {
        if (window.showToast) window.showToast('Please enter a URL', 'error');
    }
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        if (window.showToast) window.showToast('Link copied to clipboard', 'success');
    }).catch(err => {
        if (window.showToast) window.showToast('Failed to copy link', 'error');
    });
}

/**
 * Edit link at index
 */
function editLinkAtIndex(url, index, text) {
    const quill = globals.get('quill');
    if (!quill) return;

    const urlInput = document.getElementById('linkUrl');
    const textInput = document.getElementById('linkText');
    const modal = document.getElementById('linkUrlModal');
    
    if (urlInput) urlInput.value = url;
    if (textInput) textInput.value = text;
    if (modal) modal.style.display = 'block';
    
    const tooltip = createLinkTooltip();
    if (tooltip) tooltip.style.display = 'none';

    quill.setSelection(index, text.length);
}

/**
 * Create link tooltip
 */
function createLinkTooltip() {
    if (!window.linkTooltip) {
        window.linkTooltip = document.createElement('div');
        window.linkTooltip.className = 'link-tooltip';
        window.linkTooltip.style.cssText = `
            position: absolute;
            z-index: 999;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 8px;
            font-size: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            display: none;
            max-width: 300px;
            word-break: break-all;
        `;
        document.body.appendChild(window.linkTooltip);
    }
    return window.linkTooltip;
}

/**
 * Setup link preview functionality
 */
function setupLinkPreview() {
    const quill = globals.get('quill');
    if (!quill) {
        console.warn('[workspace-tables-links] Quill not available yet for link preview, will retry in 100ms');
        setTimeout(setupLinkPreview, 100);
        return;
    }

    const tooltip = createLinkTooltip();
    let tooltipTimeout;

    quill.root.addEventListener('mouseover', (e) => {
        const anchor = e.target.closest('a');
        if (anchor) {
            clearTimeout(tooltipTimeout);
            const rect = anchor.getBoundingClientRect();
            const url = anchor.getAttribute('href');

            tooltipTimeout = setTimeout(() => {
                let node = anchor;
                let index = 0;

                while (node.previousSibling) {
                    node = node.previousSibling;
                    if (node.textContent) {
                        index += node.textContent.length;
                    }
                }

                let parent = anchor.parentNode;
                while (parent && parent !== quill.root) {
                    node = parent;
                    while (node.previousSibling) {
                        node = node.previousSibling;
                        if (node.textContent) {
                            index += node.textContent.length;
                        }
                    }
                    parent = parent.parentNode;
                }

                tooltip.innerHTML = `
                    <div class="link-preview-url"></div>
                    <div class="link-preview-buttons">
                        <button class="link-preview-button" id="openLinkBtn">
                            <i class="bi bi-box-arrow-up-right"></i>
                            Open
                        </button>
                        <button class="link-preview-button" id="copyLinkBtn">
                            <i class="bi bi-clipboard"></i>
                            Copy
                        </button>
                        <button class="link-preview-button" id="editLinkBtn">
                            <i class="bi bi-pencil"></i>
                            Edit
                        </button>
                    </div>
                `;

                const urlDisplay = tooltip.querySelector('.link-preview-url');
                if (urlDisplay) urlDisplay.textContent = url;

                const openBtn = tooltip.querySelector('#openLinkBtn');
                if (openBtn) openBtn.onclick = () => window.open(url, '_blank');

                document.getElementById('copyLinkBtn').onclick = () => copyToClipboard(url);
                document.getElementById('editLinkBtn').onclick = () => editLinkAtIndex(url, index, anchor.textContent);

                tooltip.style.display = 'block';
                tooltip.style.left = `${rect.left}px`;
                tooltip.style.top = `${rect.bottom + 5}px`;
                
                document.getElementById('copyLinkBtn').onclick = () => copyToClipboard(url);
                document.getElementById('editLinkBtn').onclick = () => editLinkAtIndex(url, index, anchor.textContent);
            }, 300);
        }
    });

    quill.root.addEventListener('mouseout', (e) => {
        if (!e.target.closest('a')) {
            clearTimeout(tooltipTimeout);
            tooltip.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('a') && !e.target.closest('.link-tooltip')) {
            tooltip.style.display = 'none';
        }
    });

    console.log('[workspace-tables-links] Link preview setup complete');
}

/**
 * Setup Quill clipboard matchers for links and tables
 */
function setupClipboardMatchers() {
    const quill = globals.get('quill');
    if (!quill) {
        console.warn('[workspace-tables-links] Quill not available yet for clipboard matchers, will retry in 100ms');
        setTimeout(setupClipboardMatchers, 100);
        return;
    }

    quill.clipboard.addMatcher('A', function (node, delta) {
        const href = node.getAttribute('href');
        if (href) {
            delta.ops.forEach(op => {
                if (op.insert && typeof op.insert === 'string') {
                    op.attributes = op.attributes || {};
                    op.attributes.link = href;
                }
            });
        }
        return delta;
    });

    quill.clipboard.addMatcher('TABLE', function (node, delta) {
        return delta;
    });

    console.log('[workspace-tables-links] Clipboard matchers setup complete');
}

/**
 * Initialize tables and links functionality
 */
function initTablesAndLinks() {
    setupLinkPreview();
    setupClipboardMatchers();

    const safeAddListener = (selector, event, handler) => {
        const el = document.querySelector(selector) || document.getElementById(selector.replace('#', ''));
        if (el) el.addEventListener(event, handler);
    };

    safeAddListener('button[data-tooltip="Insert Table"]', 'click', insertTable);
    safeAddListener('button[data-tooltip="Insert Link"]', 'click', insertLink);
    safeAddListener('closeTableDialogBtn', 'click', closeTableDialog);
    safeAddListener('insertTableFromDialogBtn', 'click', insertTableFromDialog);
    safeAddListener('closeLinkDialogBtn', 'click', closeLinkDialog);
    safeAddListener('insertLinkFromDialogBtn', 'click', insertLinkFromDialog);
    safeAddListener('floatingInsertLinkBtn', 'click', insertLink);
}

// Initialize
document.addEventListener('DOMContentLoaded', initTablesAndLinks);

// Global Registration
globals.register('insertTable', insertTable, { module: 'workspace-tables-links' });
globals.register('closeTableDialog', closeTableDialog, { module: 'workspace-tables-links' });
globals.register('insertTableFromDialog', insertTableFromDialog, { module: 'workspace-tables-links' });
globals.register('insertLink', insertLink, { module: 'workspace-tables-links' });
globals.register('closeLinkDialog', closeLinkDialog, { module: 'workspace-tables-links' });
globals.register('insertLinkFromDialog', insertLinkFromDialog, { module: 'workspace-tables-links' });
globals.register('copyToClipboard', copyToClipboard, { module: 'workspace-tables-links' });
globals.register('editLinkAtIndex', editLinkAtIndex, { module: 'workspace-tables-links' });
globals.register('createLinkTooltip', createLinkTooltip, { module: 'workspace-tables-links' });

export {
    insertTable,
    closeTableDialog,
    insertTableFromDialog,
    insertLink,
    closeLinkDialog,
    insertLinkFromDialog,
    copyToClipboard,
    editLinkAtIndex,
    createLinkTooltip,
    setupLinkPreview,
    setupClipboardMatchers,
    initTablesAndLinks
};
