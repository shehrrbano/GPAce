/**
 * workspace-formatting.js
 * Handles text formatting and toolbar state management
 */

import globals from './core/globals.js';
import { editorState } from './workspace-core.js';

/**
 * Toggle format (bold, italic, etc.)
 */
function toggleFormat(format) {
    const quill = globals.get('quill');
    if (!quill) return;

    const formats = quill.getFormat();

    // Handle alignment formats specially
    if (format === 'alignLeft') {
        quill.format('align', '');
    } else if (format === 'alignCenter' || format === 'alignRight' || format === 'justify') {
        quill.format('align', format.replace('align', '').toLowerCase());
    } else {
        quill.format(format, !formats[format]);
    }

    updateToolbarState();
}

/**
 * Update format (font, size, color, etc.)
 */
function updateFormat(type) {
    const quill = globals.get('quill');
    if (!quill) return;

    // Get current selection
    const range = quill.getSelection();
    if (!range) {
        if (window.showToast) window.showToast('Please select text to format', 'info');
        return;
    }

    switch (type) {
        case 'fontFamily':
            const fontEl = document.getElementById('fontFamily');
            if (fontEl) {
                const font = fontEl.value;
                quill.format('font', font);
                if (window.showToast) window.showToast(`Font changed to ${font}`, 'success');
            }
            break;

        case 'fontSize':
            const sizeEl = document.getElementById('fontSize');
            if (sizeEl) {
                const size = sizeEl.value;
                quill.format('size', size + 'px');
                if (window.showToast) window.showToast(`Font size changed to ${size}px`, 'success');
            }
            break;

        case 'color':
            const colorEl = document.getElementById('textColor');
            if (colorEl) quill.format('color', colorEl.value);
            break;

        case 'background':
            const bgColorEl = document.getElementById('backgroundColor');
            if (bgColorEl) quill.format('background', bgColorEl.value);
            break;
    }

    updateToolbarState();
}

/**
 * Update toolbar state based on current formatting
 */
function updateToolbarState() {
    const quill = globals.get('quill');
    if (!quill) return;

    const formats = quill.getFormat();

    // Update basic formatting buttons
    updateButtonState('bold', formats.bold);
    updateButtonState('italic', formats.italic);
    updateButtonState('underline', formats.underline);
    updateButtonState('strike', formats.strike);

    // Update alignment buttons
    updateButtonState('alignLeft', !formats.align);
    updateButtonState('alignCenter', formats.align === 'center');
    updateButtonState('alignRight', formats.align === 'right');
    updateButtonState('justify', formats.align === 'justify');

    // Update font family and size selectors
    const fontEl = document.getElementById('fontFamily');
    if (fontEl && formats.font) {
        fontEl.value = formats.font;
    }

    const sizeSelect = document.getElementById('fontSize');
    if (sizeSelect && formats.size) {
        const size = formats.size.replace('px', '');
        if (Array.from(sizeSelect.options).some(option => option.value === size)) {
            sizeSelect.value = size;
        }
    }

    // Update color pickers
    const colorEl = document.getElementById('textColor');
    if (colorEl && formats.color) {
        colorEl.value = formats.color;
    }

    const bgEl = document.getElementById('backgroundColor');
    if (bgEl && formats.background) {
        bgEl.value = formats.background;
    }
}

/**
 * Helper function to update button state
 */
function updateButtonState(format, isActive) {
    const buttons = document.querySelectorAll(`[data-format="${format}"]`);
    buttons.forEach(button => {
        if (isActive) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// Global Registration
globals.register('toggleFormat', toggleFormat, { module: 'workspace-formatting' });
globals.register('updateFormat', updateFormat, { module: 'workspace-formatting' });
globals.register('updateToolbarState', updateToolbarState, { module: 'workspace-formatting' });

export {
    toggleFormat,
    updateFormat,
    updateToolbarState,
    updateButtonState
};
