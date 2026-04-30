/**
 * API Settings Manager Module
 * Handles API key management and related UI interactions
 */

// Open API settings modal
// Get secure storage with fallback
const getSecureStorage = () => window.SecureStorage || {
    getSecure: async (k, d) => storageService.get(k) || d,
    setSecure: async (k, v) => { storageService.set(k, v); return true; }
};

async function openApiSettings() {
    // Create new modal instance if it doesn't exist
    const modalElement = document.getElementById('apiSettingsModal');
    let modal = bootstrap.Modal.getInstance(modalElement);
    if (!modal) {
        modal = new bootstrap.Modal(modalElement);
    }

    // Load saved API key if exists
    const secureStorage = getSecureStorage();
    const savedKey = await secureStorage.getSecure('geminiApiKey');
    if (savedKey) {
        document.getElementById('geminiApiKey').value = savedKey;
    }
    const savedKey2 = await secureStorage.getSecure('geminiApiKey2');
    if (savedKey2 && document.getElementById('geminiApiKey2')) {
        document.getElementById('geminiApiKey2').value = savedKey2;
    }
    const savedKey3 = await secureStorage.getSecure('geminiApiKey3');
    if (savedKey3 && document.getElementById('geminiApiKey3')) {
        document.getElementById('geminiApiKey3').value = savedKey3;
    }

    // Show the modal
    modal.show();
}

// Toggle API key visibility between password and text
function toggleApiKeyVisibility(fieldId) {
    const id = fieldId || 'geminiApiKey';
    const input = document.getElementById(id);
    // Find the icon within the button that immediately follows the input
    const icon = input.parentElement.querySelector('button i');

    if (input.type === 'password') {
        input.type = 'text';
        if (icon) icon.className = 'bi bi-eye-slash';
    } else {
        input.type = 'password';
        if (icon) icon.className = 'bi bi-eye';
    }
}

// Save and test API key
async function saveApiKey() {
    const apiKey = document.getElementById('geminiApiKey').value.trim();
    const apiKey2 = document.getElementById('geminiApiKey2') ? document.getElementById('geminiApiKey2').value.trim() : '';
    const apiKey3 = document.getElementById('geminiApiKey3') ? document.getElementById('geminiApiKey3').value.trim() : '';
    const statusDiv = document.getElementById('apiKeyStatus');

    if (!apiKey) {
        showStatus('Please enter an API key', 'danger');
        return;
    }

    try {
        // Test the API key
        const response = await fetch('/api/test-api-key', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ apiKey })
        });

        const result = await response.json();

        if (result.success) {
            const secureStorage = getSecureStorage();
            await secureStorage.setSecure('geminiApiKey', apiKey);
            if (apiKey2) await secureStorage.setSecure('geminiApiKey2', apiKey2);
            if (apiKey3) await secureStorage.setSecure('geminiApiKey3', apiKey3);
            showStatus('API keys validated and saved successfully!', 'success');
            setTimeout(() => {
                location.reload(); // Reload to reinitialize with new key
            }, 1500);
        } else {
            showStatus('Invalid API key. Please check and try again.', 'danger');
        }
    } catch (error) {
        showStatus('Error testing API key. Please try again.', 'danger');
    }
}

// Show status message in the API settings modal
function showStatus(message, type) {
    const statusDiv = document.getElementById('apiKeyStatus');
    statusDiv.className = `alert alert-${type}`;
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
}

// Show error toast notification
function showErrorToast(message) {
    const toastEl = document.getElementById('errorToast');
    const toast = new bootstrap.Toast(toastEl);
    toastEl.querySelector('.toast-body').textContent = message;
    toast.show();
}

// Initialize API settings manager
function initializeApiSettingsManager() {
    // Add event listener to API settings button
    const apiSettingsBtn = document.getElementById('apiSettingsBtn');
    if (apiSettingsBtn) {
        apiSettingsBtn.addEventListener('click', openApiSettings);
    }

    // Add event listener to toggle API key visibility button
    const toggleVisibilityBtn = document.getElementById('toggleApiKeyBtn');
    if (toggleVisibilityBtn) {
        toggleVisibilityBtn.addEventListener('click', toggleApiKeyVisibility);
    }

    // Add event listener to save API key button
    const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
    if (saveApiKeyBtn) {
        saveApiKeyBtn.addEventListener('click', saveApiKey);
    }

    // Check if API key is configured
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            const secureStorage = getSecureStorage();
            const savedKey = await secureStorage.getSecure('geminiApiKey');
            if (!savedKey) {
                showErrorToast('Please configure your Gemini API key in settings');
                return;
            }

            // Initialize with saved key
            const response = await fetch('/api/initialize-analyzer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ apiKey: savedKey })
            });

            const result = await response.json();

            if (!result.success) {
                showErrorToast('Failed to initialize image analysis. Please check your API key in settings.');
                return;
            }

            console.log('ImageAnalyzer initialized successfully');
        } catch (error) {
            console.error('Error initializing ImageAnalyzer:', error);
            showErrorToast('Failed to initialize image analysis. Please try again or check your settings.');
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApiSettingsManager);

// Export functions for global use
window.openApiSettings = openApiSettings;
window.toggleApiKeyVisibility = toggleApiKeyVisibility;
window.saveApiKey = saveApiKey;
window.showErrorToast = showErrorToast;

