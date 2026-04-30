/**
 * workspace-media.js
 * Handles image insertion, Google Drive integration, and file uploads
 */

import globals from './core/globals.js';

// Google Drive API Configuration
const GOOGLE_API_KEY = 'YOUR_API_KEY';
const GOOGLE_CLIENT_ID = 'YOUR_CLIENT_ID';
const GOOGLE_APP_ID = 'YOUR_APP_ID';
const GOOGLE_SCOPE = ['https://www.googleapis.com/auth/drive.file'];

// Image handling state
let googleApiInitialized = false;
let googlePickerInitialized = false;
let selectedImage = null;

/**
 * Show image options dropdown
 */
function showImageOptions(event) {
    const dropdown = document.getElementById('imageOptionsDropdown');
    if (dropdown) dropdown.classList.toggle('show');
    if (event) event.stopPropagation();
}

/**
 * Upload image from computer
 */
function uploadImage() {
    const el = document.getElementById('imageUpload');
    if (el) el.click();
}

/**
 * Handle image upload from file input
 */
async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            insertImage(e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

/**
 * Initialize Google API
 */
function initializeGoogleApi() {
    if (!window.gapi) {
        if (window.showToast) window.showToast('Google API not loaded', 'error');
        return;
    }
    window.gapi.load('picker', () => {
        window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: GOOGLE_SCOPE.join(' '),
            callback: (response) => {
                if (response.access_token) {
                    createPicker(response.access_token);
                }
            },
        });
        googleApiInitialized = true;
    });
}

/**
 * Open Google Picker
 */
function openGooglePicker() {
    if (!googleApiInitialized) {
        initializeGoogleApi();
        return;
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SCOPE.join(' '),
        callback: (response) => {
            if (response.access_token) {
                createPicker(response.access_token);
            }
        },
    });

    tokenClient.requestAccessToken();
}

/**
 * Create Google Picker
 */
function createPicker(oauthToken) {
    const view = new window.google.picker.View(window.google.picker.ViewId.DOCS);
    view.setMimeTypes('image/png,image/jpeg,image/jpg,image/gif');

    const picker = new window.google.picker.PickerBuilder()
        .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
        .setAppId(GOOGLE_APP_ID)
        .setOAuthToken(oauthToken)
        .addView(view)
        .setDeveloperKey(GOOGLE_API_KEY)
        .setCallback(pickerCallback)
        .build();

    picker.setVisible(true);
}

/**
 * Handle Google Picker callback
 */
function pickerCallback(data) {
    if (data.action === window.google.picker.Action.PICKED) {
        const file = data.docs[0];
        insertImage(file.url);
    }
}

/**
 * Show image URL dialog
 */
function insertImageUrl() {
    const modal = document.getElementById('imageUrlModal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'block';
    }
}

/**
 * Close image URL dialog
 */
function closeImageUrlDialog() {
    const modal = document.getElementById('imageUrlModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
    const input = document.getElementById('imageUrl');
    if (input) input.value = '';
}

/**
 * Insert image from URL dialog
 */
function insertImageFromUrl() {
    const input = document.getElementById('imageUrl');
    const url = input ? input.value : '';
    if (url) {
        insertImage(url);
        closeImageUrlDialog();
    } else {
        if (window.showToast) window.showToast('Please enter an image URL', 'error');
    }
}

/**
 * Insert image into editor
 */
function insertImage(url) {
    const quill = globals.get('quill');
    if (!quill) return;

    const img = new Image();
    const toastId = window.showToast ? window.showToast('Loading image...', 'info', 0) : null;

    img.onload = function () {
        if (window.hideToast && toastId) window.hideToast(toastId);

        const range = quill.getSelection(true) || { index: quill.getLength() - 1 };
        const currentPosition = range.index;
        const currentLine = quill.getLine(currentPosition)[0];
        const indexAtLineStart = currentLine ? quill.getIndex(currentLine) : 0;

        if (currentPosition > 0 && currentPosition !== indexAtLineStart) {
            quill.insertText(currentPosition, '\n');
            quill.setSelection(currentPosition + 1, 0);
            quill.insertEmbed(currentPosition + 1, 'image', url);
            quill.insertText(currentPosition + 2, '\n');
            quill.setSelection(currentPosition + 3, 0);
        } else {
            quill.insertEmbed(currentPosition, 'image', url);
            quill.insertText(currentPosition + 1, '\n');
            quill.setSelection(currentPosition + 2, 0);
        }

        if (window.showToast) window.showToast('Image inserted successfully', 'success');
    };

    img.onerror = function () {
        if (window.hideToast && toastId) window.hideToast(toastId);
        if (window.showToast) window.showToast('Failed to load image. Please check the URL.', 'error');
    };

    img.src = url;
}

/**
 * Handle drag over event
 */
function handleDragOver(event) {
    event.preventDefault();
    const el = document.getElementById('dropZone');
    if (el) el.classList.add('active');
}

/**
 * Handle drag leave event
 */
function handleDragLeave(event) {
    event.preventDefault();
    const el = document.getElementById('dropZone');
    if (el) el.classList.remove('active');
}

/**
 * Handle drop event
 */
async function handleDrop(event) {
    event.preventDefault();
    const el = document.getElementById('dropZone');
    if (el) el.classList.remove('active');

    const files = event.dataTransfer.files;
    if (files && files[0]) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                insertImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }
}

/**
 * Add resize handle to selected image
 */
function addResizeHandle(image) {
    removeResizeHandle();
    const handle = document.createElement('div');
    handle.className = 'image-resize-handle';
    handle.style.bottom = '0';
    handle.style.right = '0';

    let startX, startY, startWidth, startHeight;

    handle.addEventListener('mousedown', function (e) {
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;
        startWidth = image.width;
        startHeight = image.height;

        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    });

    function resize(e) {
        const width = startWidth + (e.clientX - startX);
        const height = startHeight + (e.clientY - startY);
        image.style.width = width + 'px';
        image.style.height = height + 'px';
    }

    function stopResize() {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
    }

    if (image.parentNode) {
        image.parentNode.style.position = 'relative';
        image.parentNode.appendChild(handle);
    }
}

/**
 * Remove resize handle
 */
function removeResizeHandle() {
    const handles = document.querySelectorAll('.image-resize-handle');
    handles.forEach(handle => handle.remove());
}

/**
 * Setup image selection and resizing
 */
function setupImageHandling() {
    const quill = globals.get('quill');
    if (!quill) {
        console.warn('[workspace-media] Quill not available yet, will retry in 100ms');
        setTimeout(setupImageHandling, 100);
        return;
    }

    quill.on('selection-change', function (range) {
        if (range) {
            const [leaf] = quill.getLeaf(range.index);
            if (leaf && leaf.domNode && leaf.domNode.tagName === 'IMG') {
                selectedImage = leaf.domNode;
                selectedImage.classList.add('selected');
                addResizeHandle(selectedImage);
            } else if (selectedImage) {
                selectedImage.classList.remove('selected');
                removeResizeHandle();
                selectedImage = null;
            }
        }
    });

    document.addEventListener('click', function (event) {
        if (!event.target.closest('.toolbar-button')) {
            const dropdown = document.getElementById('imageOptionsDropdown');
            if (dropdown) dropdown.classList.remove('show');
        }
    });

    const uploadEl = document.getElementById('imageUpload');
    if (uploadEl) uploadEl.addEventListener('change', handleImageUpload);

    console.log('[workspace-media] Image handling setup complete');
}

/**
 * Initialize image dialogs
 */
function initImageDialogs() {
    const safeAddListener = (id, event, handler) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener(event, handler);
    };

    safeAddListener('closeImageUrlBtn', 'click', closeImageUrlDialog);
    safeAddListener('insertImageFromUrlBtn', 'click', insertImageFromUrl);
    safeAddListener('uploadImageBtn', 'click', uploadImage);
    safeAddListener('openGooglePickerBtn', 'click', openGooglePicker);
    safeAddListener('insertImageUrlBtn', 'click', insertImageUrl);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupImageHandling();
    initImageDialogs();
});

// Global Registration
globals.register('showImageOptions', showImageOptions, { module: 'workspace-media' });
globals.register('uploadImage', uploadImage, { module: 'workspace-media' });
globals.register('handleImageUpload', handleImageUpload, { module: 'workspace-media' });
globals.register('openGooglePicker', openGooglePicker, { module: 'workspace-media' });
globals.register('insertImageUrl', insertImageUrl, { module: 'workspace-media' });
globals.register('closeImageUrlDialog', closeImageUrlDialog, { module: 'workspace-media' });
globals.register('insertImageFromUrl', insertImageFromUrl, { module: 'workspace-media' });
globals.register('insertImage', insertImage, { module: 'workspace-media' });
globals.register('handleDragOver', handleDragOver, { module: 'workspace-media' });
globals.register('handleDragLeave', handleDragLeave, { module: 'workspace-media' });
globals.register('handleDrop', handleDrop, { module: 'workspace-media' });

export {
    showImageOptions,
    uploadImage,
    handleImageUpload,
    openGooglePicker,
    insertImageUrl,
    closeImageUrlDialog,
    insertImageFromUrl,
    insertImage,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    addResizeHandle,
    removeResizeHandle,
    setupImageHandling,
    initImageDialogs
};
