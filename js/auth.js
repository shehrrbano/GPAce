// Import necessary Firebase functions and the centralized config/init helper
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"; // Keep for getOrCreateFirebaseApp
import {
    getAuth,
    setPersistence,
    browserLocalPersistence,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// Removed circular import of firestore.js
import { firebaseConfig, getOrCreateFirebaseApp } from './firebaseConfig.js';
import { storageService } from './services/StorageService.js'; // Import shared config and init function

// Initialize Firebase Auth asynchronously without blocking the module graph
let auth = null;
const authReady = (async () => {
    try {
        const app = await getOrCreateFirebaseApp(initializeApp);
        auth = app ? getAuth(app) : null;
        
        if (auth) {
            window.auth = auth;
            console.log('[Auth] Firebase Auth instance ready');
        } else {
            console.error("Firebase Auth could not be initialized because the Firebase App instance is not available.");
        }
        return auth;
    } catch (error) {
        console.error('[Auth] Failed to initialize Firebase App:', error);
        return null;
    }
})();

export { auth, authReady };
const provider = new GoogleAuthProvider();

// --- MODIFICATION START ---
// Define the Google Drive scopes needed (should match googleDriveApi.js)
const DRIVE_SCOPES = [
    'https://www.googleapis.com/auth/drive.file',
    // 'https://www.googleapis.com/auth/drive.appdata' // Add if you still use appdata scope
];

// Add the Drive scopes to the Google Auth Provider
DRIVE_SCOPES.forEach(scope => {
    provider.addScope(scope);
});
// --- MODIFICATION END ---


// Configure Google Provider
provider.setCustomParameters({
    prompt: 'select_account'
});

// Handle Google Sign In
export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        updateUIForUser(user);

        try {
            const { loadSubjectsFromFirestore } = await import('./firestore.js');
            await loadSubjectsFromFirestore(); // Keep if needed
            console.log('Subjects loaded after login');
        } catch (error) {
            console.error('Error loading subjects after login:', error);
        }

        // --- ADDITION ---
        // After successful Firebase sign-in, ensure Drive API is ready
        if (window.googleDriveAPI) {
            console.log("signInWithGoogle: Syncing Drive API state...");
            if (typeof window.googleDriveAPI.handleFirebaseSignIn === 'function') {
                // Pass the result which contains the Google access token
                await window.googleDriveAPI.handleFirebaseSignIn(result);
            }
        } else {
            console.warn("signInWithGoogle: googleDriveAPI not found.");
        }
        // --- END ADDITION ---

        return user;
    } catch (error) {
        console.error("Error signing in with Google:", error);
        // Optional: Check for specific errors like 'popup_closed_by_user'
        // if (error.code !== 'auth/popup-closed-by-user') {
        //    throw error;
        //}
        throw error; // Re-throw by default
    }
}

// Handle Sign Out
export async function signOutUser() {
    try {
        await signOut(auth);
        // --- ADDITION ---
        // Also clear Drive API state on sign out
        if (window.googleDriveAPI && typeof window.googleDriveAPI.handleFirebaseSignOut === 'function') {
            window.googleDriveAPI.handleFirebaseSignOut();
        }
        // --- END ADDITION ---
        // updateUIForSignedOut(); // This will be called by onAuthStateChanged
    } catch (error) {
        console.error("Error signing out:", error);
        throw error;
    }
}

export async function handleSignOut() {
    return await signOutUser();
}

// Listen for auth state changes
export async function initializeAuth() {
    await authReady;
    if (!auth) return;

    try {
        await setPersistence(auth, browserLocalPersistence);
        console.log('🔐 Auth persistence set to LOCAL');
    } catch (error) {
        console.error('Error setting auth persistence:', error);
    }

    onAuthStateChanged(auth, async (user) => { // Make async
        if (user) {
            console.log('🔐 User authenticated via Firebase:', user.email);
            updateUIForUser(user);

            // --- MODIFICATION: Ensure Drive API syncs with Firebase state ---
            if (window.googleDriveAPI && typeof window.googleDriveAPI.handleFirebaseSignIn === 'function') {
                try {
                    console.log("onAuthStateChanged(user): Triggering Drive API sign-in handling...");
                    await window.googleDriveAPI.handleFirebaseSignIn();
                } catch (driveError) {
                    console.warn("Drive API failed to sync with Firebase sign-in on initial load:", driveError);
                    // App can continue, Drive features might require manual auth later
                }
            } else {
                console.debug("[Auth] googleDriveAPI not available yet, will retry when loaded.");
                // Set a flag to try again later if googleDriveAPI loads after auth state check
                window._pendingDriveAuthSync = true;
            }
            // --- END MODIFICATION ---


            // Keep device detection logic if needed
            const lastDevice = storageService.get('lastAuthDevice');
            const currentDevice = generateDeviceId();
            if (lastDevice !== currentDevice) {
                console.log('📱 New device detected, forcing Firestore sync');
                storageService.set('forceFirestoreSync', 'true');
                storageService.set('lastAuthDevice', currentDevice);
            }

            // Data initialization is now handled by DataInitializationService
            // which has its own auth state listener. Removed deprecated call to reduce redundancy.
            console.debug('[Auth] Auth state changed - DataInitializationService handles data loading');

        } else {
            console.log('🔒 User signed out from Firebase');
            // --- MODIFICATION: Ensure Drive API syncs with Firebase state ---
            if (window.googleDriveAPI && typeof window.googleDriveAPI.handleFirebaseSignOut === 'function') {
                window.googleDriveAPI.handleFirebaseSignOut();
            } else {
                console.debug("[Auth] googleDriveAPI not available to handle sign out.");
            }
            // --- END MODIFICATION ---
            updateUIForSignedOut();
        }
    });

    // Expose the auth state globally (keep as is)
    window.auth = auth;
}

// Generate Device ID (keep as is)
function generateDeviceId() {
    const screenProps = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
    const browserProps = navigator.userAgent;
    let fingerprint = storageService.get('browserFingerprint');
    if (!fingerprint) {
        // Simple hash function (not cryptographically secure, just for basic ID)
        const rawId = `${screenProps}-${browserProps}-${Date.now()}`;
        let hash = 0;
        for (let i = 0; i < rawId.length; i++) {
            const char = rawId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convert to 32bit integer
        }
        fingerprint = String(hash);
        storageService.set('browserFingerprint', fingerprint);
    }
    return fingerprint;
}

// Update UI for signed-in user (Keep your existing implementation)
function updateUIForUser(user) {
    const authButton = document.getElementById('authButton');
    const userProfile = document.getElementById('userProfile');

    if (authButton) {
        // Sanitize names for safety
        const displayName = user.displayName || user.email || 'User';
        const photoURL = user.photoURL || 'default-avatar.png';
        
        authButton.innerHTML = `
            <img src="\${photoURL}" alt="User Avatar" class="user-avatar">
            <span class="user-name"></span>
            <button id="signOutBtn" class="logout-btn">Sign Out</button>
        `;
        
        const nameEl = authButton.querySelector('.user-name');
        if (nameEl) nameEl.textContent = displayName;

        const signOutBtn = document.getElementById('signOutBtn');
        if (signOutBtn) {
            signOutBtn.onclick = signOutUser;
        }
        authButton.onclick = null; // Remove previous sign-in handler
    }
    if (userProfile) {
        userProfile.style.display = 'flex'; // Or 'block'
        // Populate profile details if needed
    }
    console.log("UI Updated for Signed In User");
}

// Update UI for signed-out state (Keep your existing implementation)
function updateUIForSignedOut() {
    const authButton = document.getElementById('authButton'); // Assuming you have this button
    const userProfile = document.getElementById('userProfile'); // Assuming you have this profile area

    if (authButton) {
        // Example: Show sign-in button
        authButton.innerHTML = '<button id="signInBtn"><i class="fas fa-sign-in-alt"></i> Sign In with Google</button>';
        const signInBtn = document.getElementById('signInBtn');
        if (signInBtn) {
            signInBtn.onclick = signInWithGoogle;
        }
        authButton.onclick = null; // Remove potential sign-out handler
    }
    if (userProfile) {
        userProfile.style.display = 'none';
        // Clear profile details if needed
    }
    console.log("UI Updated for Signed Out User");
}


// Automatically initialize auth when this script is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔒 Initializing Firebase authentication...');
    await authReady;
    initializeAuth();

    // REMOVED: Pending firestore init check - DataInitializationService handles this now

    // Similar check for pending Drive auth sync
    if (window._pendingDriveAuthSync) {
        const driveCheckInterval = setInterval(async () => {
            if (window.googleDriveAPI && typeof window.googleDriveAPI.handleFirebaseSignIn === 'function') {
                if (auth.currentUser) { // Only run if user is actually signed in
                    console.log('🔄 googleDriveAPI now available, running pending auth sync...');
                    try {
                        await window.googleDriveAPI.handleFirebaseSignIn();
                    } catch (e) { console.error("Error during pending drive auth sync:", e); }
                    window._pendingDriveAuthSync = false; // Clear flag
                    clearInterval(driveCheckInterval);
                } else {
                    // User signed out before Drive API loaded, no sync needed
                    window._pendingDriveAuthSync = false;
                    clearInterval(driveCheckInterval);
                }
            }
        }, 500);
        setTimeout(() => {
            if (window._pendingDriveAuthSync) {
                console.warn("Drive auth sync check timed out.");
            }
            clearInterval(driveCheckInterval);
        }, 10000);
    }
});

// Export global auth instance (keep as is)
window.auth = auth;
window.signInWithGoogle = signInWithGoogle;
window.signOutUser = signOutUser;
