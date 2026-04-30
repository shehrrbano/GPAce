/**
 * Firestore Service Module
 * Handles all Firestore operations for the application
 * 
 * Uses centralized FirebaseConfig and StorageAdapter
 */

// Import necessary Firestore functions
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc, onSnapshot, runTransaction } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Import centralized Firebase config
import { firebaseConfig, getOrCreateFirebaseApp } from './firebaseConfig.js';
// Removed: import { auth as centralizedAuth } from './auth.js';

// Initialize Firebase using the centralized config
const app = await getOrCreateFirebaseApp(initializeApp, getApps);
const db = getFirestore(app);

// Critical: Use getAuth(app) directly to avoid circular dependency with auth.js
// This resolves the "Select a Task" fetch error by establishing auth before DB calls
const auth = getAuth(app);

if (typeof window !== 'undefined') {
    if (!window.auth) window.auth = auth;
    if (!window.db) window.db = db;
    // Expose modular functions for legacy compatibility
    window.firestore = {
        doc, setDoc, getDoc, collection, onSnapshot, runTransaction, getDocs, deleteDoc
    };
    window.dispatchEvent(new CustomEvent('firestore-ready', { detail: { db, auth } }));
    console.log('[Firestore] Service exposed and ready event dispatched');
}


// Promise that resolves when auth state is determined (user or null)
let authStateResolved = false;
let authStatePromise = null;

/**
 * Wait for Firebase Auth to determine the current user's auth state.
 * This is useful for functions that need to check auth.currentUser on page load,
 * as Firebase Auth asynchronously restores the user session from persistence.
 * 
 * @param {number} timeoutMs - Maximum time to wait (default: 5000ms)
 * @returns {Promise<User|null>} - Resolves with the user (if signed in) or null
 */
function waitForAuth(timeoutMs = 5000) {
  // If auth state is already resolved, return current state immediately
  if (authStateResolved) {
    return Promise.resolve(auth.currentUser);
  }

  // If we're already waiting, return the existing promise
  if (authStatePromise) {
    return authStatePromise;
  }

  // Create a new promise that resolves on auth state change
  authStatePromise = new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      console.debug('[Auth] waitForAuth timed out, using current state');
      authStateResolved = true;
      resolve(auth.currentUser);
    }, timeoutMs);

    const unsubscribe = auth.onAuthStateChanged((user) => {
      clearTimeout(timeoutId);
      unsubscribe();
      authStateResolved = true;
      authStatePromise = null;
      resolve(user);
    });
  });

  return authStatePromise;
}

// Export waitForAuth for other modules
export { waitForAuth };

// Also expose globally for non-module scripts
window.waitForAuth = waitForAuth;

// Use globally exposed StorageAdapter with fallback
const getStorage = () => window.StorageAdapter?.getStorage?.() || window.StorageService || {
  get: (k, d) => { try { return JSON.parse(storageService.get(k)) ?? d; } catch { return d; } },
  set: (k, v) => storageService.set(k, v),
  remove: (k) => storageService.remove(k)
};

// Get STORAGE_KEYS from StorageAdapter if available
const getStorageKeys = () => window.StorageAdapter?.STORAGE_KEYS || {
  CURRENT_SEMESTER: 'currentAcademicSemester',
  SEMESTERS: 'academicSemesters'
};

////////////////////////////SAVING/////////////////////////////////////////

// Function to save subjects to Firestore
export async function saveSubjectsToFirestore(subjects, semesterName = 'default') {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('No user is signed in');
      return;
    }

    const timestamp = new Date().getTime(); // Use timestamp as version
    console.log(`Saving subjects for semester: ${semesterName}`);

    // Save the subjects to the specific semester document
    const semesterRef = doc(db, 'users', user.uid, 'semesters', semesterName);
    await setDoc(semesterRef, {
      subjects: subjects,
      lastUpdated: new Date(),
      version: timestamp
    });

    // Also save to current for backwards compatibility
    const storage = getStorage();
    const STORAGE_KEYS = getStorageKeys();
    if (semesterName === storage.get(STORAGE_KEYS.CURRENT_SEMESTER)) {
      const userSubjectsRef = doc(db, 'users', user.uid, 'subjects', 'current');
      await setDoc(userSubjectsRef, {
        subjects: subjects,
        lastUpdated: new Date(),
        version: timestamp,
        activeSemester: semesterName
      });
    }

    // Store version to local storage
    storage.set('academicSubjectsVersion', timestamp);

    console.log('Subjects successfully saved to Firestore for semester:', semesterName);
  } catch (error) {
    console.error('Error saving subjects to Firestore:', error);
    throw error;
  }
}

// Expose saveSubjectsToFirestore globally for other modules (ui-utilities.js, semester-management.js)
window.saveSubjectsToFirestore = saveSubjectsToFirestore;

// Task versioning and sync functions
// Helper to merge task lists
function mergeTaskLists(serverTasks, localTasks) {
  const taskMap = new Map();

  // Index server tasks
  serverTasks.forEach(t => taskMap.set(t.id, t));

  // Merge local tasks
  localTasks.forEach(localTask => {
    if (taskMap.has(localTask.id)) {
      const serverTask = taskMap.get(localTask.id);
      // Conflict Resolution:
      // 1. If one is completed and other is not, favor completion (unless explicitly un-completed recently - we lack that metadata, so favor completion for "Zombie Task" fix)
      // 2. Favor newer `updatedAt` if available
      // 3. Fallback: Server wins if unknown

      const serverUpdated = new Date(serverTask.updatedAt || 0).getTime();
      const localUpdated = new Date(localTask.updatedAt || 0).getTime();

      // Special case: If server is completed and local is pending (old device state), keep server
      if (serverTask.completed && !localTask.completed) {
        // But what if user UNCHECKED it? We need an 'uncompletedAt'. 
        // Without that, satisfying the "Zombie Task" requires favoring COMPLETED => true.
        // "When I loaded on older device it is still even tho they were comleted" -> Server had completed, local had pending. Local overwrote server.
        // Fix: Keep server's completed task.
        return; // Keep server task in map
      }

      if (localUpdated > serverUpdated) {
        taskMap.set(localTask.id, localTask);
      }
      // Else keep server
    } else {
      // New local task
      taskMap.set(localTask.id, localTask);
    }
  });

  return Array.from(taskMap.values());
}

// Transactional Save with OCC and Exponential Backoff Retry
const MAX_TRANSACTION_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 200;

export async function saveTasksToFirestore(projectId, tasks, retryCount = 0) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('No user is signed in');
      return;
    }

    const taskRef = doc(db, 'users', user.uid, 'tasks', projectId);
    const storage = getStorage();

    // Optimistic locking strategy with simpler setDoc (Last Write Wins for the list)
    // This fixes the "Ghost Task" issue where transactions failed or merged incorrectly, restoring deleted tasks.

    // 1. Get current server state
    const serverDoc = await getDoc(taskRef);
    let finalTasks = tasks;
    let newVersion = new Date().getTime();

    if (serverDoc.exists()) {
      const serverData = serverDoc.data();
      const serverVersion = serverData.version || 0;
      const lastKnownVersion = parseInt(storage.get(`tasks-${projectId}-version`) || '0');

      // Only merge if server is strictly newer than what we knew about
      // AND significantly newer (to avoid clock skew issues with immediate saves)
      if (serverVersion > lastKnownVersion) {
        console.warn(`Conflict detected: Server has newer version (${serverVersion} > ${lastKnownVersion}).`);
        // We still prioritize LOCAL changes (deletions) if the version diff is small or likely from our own previous session
        // But if it's a true conflict, we might need to merge.
        // For now, to fix the specific "Ghost Task" bug, we will default to OVERWRITING if we are initiating a save.
        // We assume the local state represents the latest user intent (including deletions).
      }
    }

    // Update Metadata
    finalTasks.forEach(t => {
      if (!t.updatedAt) t.updatedAt = new Date().toISOString();
    });

    // 2. Write (Overwrite)
    await setDoc(taskRef, {
      tasks: finalTasks,
      lastUpdated: new Date(),
      version: newVersion
    });

    // 3. Update Local Storage
    storage.set(`tasks-${projectId}`, finalTasks);
    storage.set(`tasks-${projectId}-version`, newVersion);
    console.log(`[Firestore DEBUG] Tasks successfully saved to Firestore (Overwrite). Count: ${finalTasks.length}. Version: ${newVersion}`);

    // Notify UI
    window.dispatchEvent(new CustomEvent('dataSyncComplete', { detail: { type: 'save' } }));

  } catch (error) {
    console.error('Error saving tasks to Firestore:', error);
    // Retry logic could be simplified or removed since setDoc is less likely to fail with contention
    if (retryCount < 3) {
      setTimeout(() => saveTasksToFirestore(projectId, tasks, retryCount + 1), 500);
    }
  }
}


// Function to save completed tasks to Firestore
export async function saveCompletedTaskToFirestore(projectId, completedTask) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('No user is signed in');
      return;
    }

    // Get existing completed tasks
    const completedRef = doc(db, 'users', user.uid, 'completed-tasks', projectId);
    const docSnap = await getDoc(completedRef);
    const existingTasks = docSnap.exists() ? docSnap.data().tasks : [];

    // Add new completed task
    const updatedTasks = [...existingTasks, completedTask];

    // Save to Firestore
    await setDoc(completedRef, {
      tasks: updatedTasks,
      lastUpdated: new Date()
    });

    // Update local storage
    const storage = getStorage();
    storage.set(`completed-tasks-${projectId}`, updatedTasks);

    console.log('Completed task saved successfully');
  } catch (error) {
    console.error('Error saving completed task:', error);
    throw error;
  }
}

// Function to save project weightages to Firestore
export async function saveWeightagesToFirestore(weightages) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('No user is signed in');
      return;
    }

    const weightagesRef = doc(db, 'users', user.uid, 'settings', 'weightages');
    await setDoc(weightagesRef, {
      projectWeightages: weightages,
      lastUpdated: new Date()
    });

    // Update local storage
    const storage = getStorage();
    storage.set('projectWeightages', weightages);
    console.log('Weightages saved successfully');
  } catch (error) {
    console.error('Error saving weightages:', error);
    throw error;
  }
}

// Function to save subject marks to Firestore
export async function saveSubjectMarksToFirestore(marks) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('No user is signed in');
      return false;
    }

    const marksRef = doc(db, 'users', user.uid, 'academic', 'marks');
    await setDoc(marksRef, { marks: marks });

    console.log('Subject marks saved to Firestore');
    return true;
  } catch (error) {
    console.error('Error saving subject marks to Firestore:', error);
    throw error;
  }
}

// Function to save subject weightages to Firestore
export async function saveSubjectWeightagesToFirestore(weightages) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('No user is signed in');
      return false;
    }

    const weightagesRef = doc(db, 'users', user.uid, 'academic', 'weightages');
    await setDoc(weightagesRef, { subjectWeightages: weightages });

    console.log('Subject weightages saved to Firestore');
    return true;
  } catch (error) {
    console.error('Error saving subject weightages to Firestore:', error);
    throw error;
  }
}

////////////////////////////////////////LOADING//////////////////////////////////////////////////

// Function to load subjects from Firestore
export async function loadSubjectsFromFirestore(semesterName = 'default') {
  try {
    console.log(`Loading subjects for semester: ${semesterName}`);

    // Wait for auth state to be determined before checking user
    const user = await waitForAuth();
    if (!user) {
      console.debug('loadSubjectsFromFirestore: No user signed in, falling back to local storage');
      const storage = getStorage();
      const allSemesters = storage.get('academicSemesters', {});
      const subjects = allSemesters[semesterName]?.subjects || [];
      return subjects.length > 0 ? subjects : storage.get('academicSubjects', []);
    }

    // Try to load the specific semester first
    const semesterRef = doc(db, 'users', user.uid, 'semesters', semesterName);
    const semesterDoc = await getDoc(semesterRef);

    if (semesterDoc.exists()) {
      console.log(`Loaded semester data: ${semesterName}`);
      const subjectData = semesterDoc.data().subjects || [];

      // Store in storage for future use
      const storage = getStorage();
      const allSemesters = storage.get('academicSemesters', {});
      allSemesters[semesterName] = {
        subjects: subjectData,
        lastUpdated: new Date().toISOString()
      };
      storage.set('academicSemesters', allSemesters);

      // For current semester, also save to academicSubjects for compatibility
      if (semesterName === storage.get('currentAcademicSemester')) {
        storage.set('academicSubjects', subjectData);
      }

      return subjectData;
    }

    // Fallback to current subjects if the specific semester doesn't exist
    const userSubjectsRef = doc(db, 'users', user.uid, 'subjects', 'current');
    const docSnap = await getDoc(userSubjectsRef);

    if (docSnap.exists()) {
      console.log('Loaded current subjects as fallback');
      const subjectData = docSnap.data().subjects || [];

      // Save to storage
      const storage = getStorage();
      storage.set('academicSubjects', subjectData);

      // If this is the first load for this semester, save the current subjects to the semester
      if (semesterName !== 'default') {
        await saveSubjectsToFirestore(subjectData, semesterName);
      }

      return subjectData;
    } else {
      console.log('No subject data found in Firestore');
      return [];
    }
  } catch (error) {
    console.error('Error loading subjects from Firestore:', error);
    // Fall back to local storage in case of error
    const storage = getStorage();
    const allSemesters = storage.get('academicSemesters', {});
    const subjects = allSemesters[semesterName]?.subjects || [];

    if (subjects.length === 0) {
      return storage.get('academicSubjects', []);
    }
    return subjects;
  }
}


//Load tasks
// Function to load tasks from Firestore (Pure Data Access)
export async function loadTasksFromFirestore(projectId) {
  try {
    // OPTIMIZATION: Check if TaskService has cached data - return it immediately
    // This maintains the existing check but strictly for returning what's already known
    // to avoid unnecessary network calls if the service already has valid data.
    if (window.TaskService?.getCachedTasks) {
      const cached = window.TaskService.getCachedTasks(projectId);
      if (cached !== null && cached !== undefined) {
        console.debug(`[Firestore] Returning cached data for ${projectId} (${cached.length} tasks)`);
        return cached;
      }
    }

    console.debug(`[Firestore] loadTasksFromFirestore() called for: ${projectId}`);

    // Guard against undefined/null projectId
    if (!projectId || projectId === 'undefined' || projectId === 'null') {
      console.warn('[Firestore] loadTasksFromFirestore: Invalid projectId, skipping load');
      return [];
    }

    // Wait for auth state to be determined before checking user
    const user = await waitForAuth();
    if (!user) {
      console.debug('loadTasksFromFirestore: No user signed in, returning empty array (Service should handle local fallback)');
      return [];
    }

    const taskRef = doc(db, 'users', user.uid, 'tasks', projectId);
    const docSnap = await getDoc(taskRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log(`[Firestore] Fetched ${data.tasks?.length || 0} tasks for ${projectId}`);
      return data.tasks || [];
    } else {
      console.log('[Firestore] No remote data found for', projectId);
      return [];
    }
  } catch (error) {
    console.error('Error loading tasks from Firestore:', error);
    return []; // Return empty on error, let caller handle fallback
  }
}





/////Weightage load
// Function to load project weightages from Firestore
export async function loadWeightagesFromFirestore() {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('No user is signed in');
      return null;
    }

    const weightagesRef = doc(db, 'users', user.uid, 'settings', 'weightages');
    const docSnap = await getDoc(weightagesRef);

    if (docSnap.exists()) {
      const data = docSnap.data().projectWeightages;
      const storage = getStorage();
      storage.set('projectWeightages', data);
      return data;
    } else {
      const storage = getStorage();
      const localData = storage.get('projectWeightages', {});
      if (Object.keys(localData).length > 0) {
        await saveWeightagesToFirestore(localData);
      }
      return localData;
    }
  } catch (error) {
    console.error('Error loading weightages:', error);
    const storage = getStorage();
    return storage.get('projectWeightages', {});
  }
}

// Function to load subject marks from Firestore
export async function loadSubjectMarksFromFirestore() {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('No user is signed in');
      return null;
    }

    const marksRef = doc(db, 'users', user.uid, 'academic', 'marks');
    const docSnap = await getDoc(marksRef);

    if (docSnap.exists()) {
      const marksData = docSnap.data().marks;
      const storage = getStorage();
      storage.set('subjectMarks', marksData);
      return marksData;
    } else {
      const storage = getStorage();
      const localMarks = storage.get('subjectMarks', {});
      await saveSubjectMarksToFirestore(localMarks);
      return localMarks;
    }
  } catch (error) {
    console.error('Error loading subject marks from Firestore:', error);
    const storage = getStorage();
    return storage.get('subjectMarks', {});
  }
}

// Function to load subject weightages from Firestore
export async function loadSubjectWeightagesFromFirestore() {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('No user is signed in');
      return null;
    }

    const weightagesRef = doc(db, 'users', user.uid, 'academic', 'weightages');
    const docSnap = await getDoc(weightagesRef);

    if (docSnap.exists()) {
      const weightagesData = docSnap.data().subjectWeightages;
      const storage = getStorage();
      storage.set('subjectWeightages', weightagesData);
      return weightagesData;
    } else {
      const storage = getStorage();
      const localWeightages = storage.get('subjectWeightages', {});
      await saveSubjectWeightagesToFirestore(localWeightages);
      return localWeightages;
    }
  } catch (error) {
    console.error('Error loading subject weightages from Firestore:', error);
    const storage = getStorage();
    return storage.get('subjectWeightages', {});
  }
}

// Function to list all semesters for a user
export async function listUserSemesters() {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('No user is signed in');
      throw new Error('User not authenticated');
    }

    const semestersCollection = collection(db, 'users', user.uid, 'semesters');
    const semestersSnapshot = await getDocs(semestersCollection);

    const semesters = [];
    semestersSnapshot.forEach(doc => {
      semesters.push({
        id: doc.id,
        lastUpdated: doc.data().lastUpdated?.toDate() || new Date(),
        subjectCount: (doc.data().subjects || []).length
      });
    });

    console.log(`Found ${semesters.length} semesters for user in Firestore`);
    return semesters;
  } catch (error) {
    console.error('Error listing semesters from Firestore:', error);
    throw error;
  }
}

// Function to delete a semester from Firestore
export async function deleteSemesterFromFirestore(semesterName) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('No user is signed in');
      throw new Error('User not authenticated');
    }

    // Delete the semester document
    const semesterRef = doc(db, 'users', user.uid, 'semesters', semesterName);
    await deleteDoc(semesterRef);

    console.log(`Semester "${semesterName}" successfully deleted from Firestore`);
    return true;
  } catch (error) {
    console.error(`Error deleting semester "${semesterName}" from Firestore:`, error);
    throw error;
  }
}

// Function to save text expansion snippets to Firestore
export async function saveSnippetsToFirestore(snippets) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('No user is signed in');
      return false;
    }

    const timestamp = new Date().getTime(); // Use timestamp as version
    console.log('Saving text expansion snippets to Firestore');

    // Save the snippets to Firestore
    const snippetsRef = doc(db, 'users', user.uid, 'settings', 'text-expansion');
    await setDoc(snippetsRef, {
      snippets: snippets,
      lastUpdated: new Date(),
      version: timestamp
    });

    // Store version to local storage
    const storage = getStorage();
    storage.set('gpace-snippets-version', timestamp);

    console.log('Text expansion snippets successfully saved to Firestore');
    return true;
  } catch (error) {
    console.error('Error saving text expansion snippets to Firestore:', error);
    return false;
  }
}

// Function to load text expansion snippets from Firestore
export async function loadSnippetsFromFirestore(isNewDeviceSession = false) {
  try {
    // Wait for auth state to be determined before checking user
    const user = await waitForAuth();
    if (!user) {
      console.debug('loadSnippetsFromFirestore: No user signed in, using local snippets');
      return null;
    }

    console.log('Loading text expansion snippets from Firestore');

    // Get local data and version
    const storage = getStorage();
    let localSnippets = storage.get('gpace-snippets', []);
    const localVersion = storage.get('gpace-snippets-version');

    // Get Firestore data
    const snippetsRef = doc(db, 'users', user.uid, 'settings', 'text-expansion');
    const docSnap = await getDoc(snippetsRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const firestoreVersion = data.version || 0;
      const localVersionNum = parseInt(localVersion) || 0;

      console.log(`Comparing versions - Firestore: ${firestoreVersion}, Local: ${localVersionNum}`);
      console.log(`Is new device session: ${isNewDeviceSession}`);

      // If Firestore version is newer OR this is a new device session, use Firestore data
      if (firestoreVersion > localVersionNum || isNewDeviceSession) {
        console.log('Using Firestore data (newer version or new device)');
        storage.set('gpace-snippets', data.snippets);
        storage.set('gpace-snippets-version', firestoreVersion);
        return data.snippets;
      }

      // If local version is newer or same, sync it to Firestore and keep using local
      console.log('Using local data and syncing to Firestore');
      const timestamp = new Date().getTime();
      await setDoc(snippetsRef, {
        snippets: localSnippets,
        lastUpdated: new Date(),
        version: timestamp
      });
      storage.set('gpace-snippets-version', timestamp);
      return localSnippets;
    } else {
      // No Firestore data exists yet, sync local data if it exists
      if (localSnippets.length > 0) {
        console.log('No Firestore data. Syncing local snippets to Firestore.');
        const timestamp = new Date().getTime();
        await setDoc(snippetsRef, {
          snippets: localSnippets,
          lastUpdated: new Date(),
          version: timestamp
        });
        storage.set('gpace-snippets-version', timestamp);
        return localSnippets;
      }

      console.log('No text expansion snippets found in Firestore or local storage');
      return null;
    }
  } catch (error) {
    console.error('Error loading text expansion snippets from Firestore:', error);
    return null;
  }
}

// Function to set up real-time sync for text expansion snippets
export function setupSnippetsRealtimeSync(callback) {
  const user = auth.currentUser;
  if (!user) {
    console.error('No user is signed in');
    return () => { }; // Return empty function as unsubscribe
  }

  const snippetsRef = doc(db, 'users', user.uid, 'settings', 'text-expansion');

  // Set up real-time listener
  return onSnapshot(snippetsRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      const firestoreVersion = data.version || 0;
      const storage = getStorage();
      const localVersion = storage.get('gpace-snippets-version');
      const localVersionNum = parseInt(localVersion) || 0;

      // Only update if Firestore version is newer
      if (firestoreVersion > localVersionNum) {
        console.log('Real-time update: New snippets version detected in Firestore');
        const storage = getStorage();
        storage.set('gpace-snippets', data.snippets);
        storage.set('gpace-snippets-version', firestoreVersion);

        // Call the callback with the updated snippets
        if (typeof callback === 'function') {
          callback(data.snippets);
        }
      }
    }
  }, (error) => {
    console.error('Error in real-time snippets sync:', error);
  });
}

// Expose additional functions globally for other modules
window.deleteSemesterFromFirestore = deleteSemesterFromFirestore;
window.listUserSemesters = listUserSemesters;

// Export auth and db for modules that need to import them
export { auth, db, app, onSnapshot, doc };

// Function to save calculated priority tasks to Firestore
export async function savePriorityTasksToFirestore(tasks) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn('No user logged in, skipping Firestore save');
      return;
    }

    const priorityRef = doc(db, 'users', user.uid, 'settings', 'priorityTasks');
    await setDoc(priorityRef, {
      tasks: tasks,
      version: Date.now(),
      updatedAt: new Date().toISOString()
    });

    console.log('📤 Saved calculated priority tasks to Firestore:', tasks.length);
  } catch (error) {
    console.error('Error saving priority tasks to Firestore:', error);
    throw error;
  }
}

// Expose for non-module scripts
window.savePriorityTasksToFirestore = savePriorityTasksToFirestore;

// =========================================
// Nuclear Ghost Task Fixes
// =========================================

/**
 * NUCLEAR: Delete ALL tasks for a project from Firestore.
 * Use this when ghost tasks keep coming back.
 * @param {string} projectId - The project to clear
 * @returns {Promise<boolean>} True if successful
 */
export async function deleteAllTasksFromFirestore(projectId) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('[Firestore] No user signed in');
      return false;
    }

    console.log(`[Firestore] 🔥 DELETING all tasks for project: ${projectId}`);

    // Delete the tasks document completely
    const taskRef = doc(db, 'users', user.uid, 'tasks', projectId);
    await deleteDoc(taskRef);

    // Also delete completed tasks
    const completedRef = doc(db, 'users', user.uid, 'completed-tasks', projectId);
    await deleteDoc(completedRef);

    // Clear local storage for this project
    const storage = getStorage();
    storage.remove(`tasks-${projectId}`);
    storage.remove(`tasks-${projectId}-version`);
    storage.remove(`completed-tasks-${projectId}`);

    console.log(`[Firestore] ✅ Deleted all tasks for ${projectId} from Firestore and localStorage`);
    return true;
  } catch (error) {
    console.error(`[Firestore] Error deleting tasks for ${projectId}:`, error);
    return false;
  }
}

/**
 * NUCLEAR: List and delete ALL task projects for current user.
 * This completely wipes all task data.
 * @returns {Promise<Object>} Results with deleted projects
 */
export async function nukeAllTasks() {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('[Firestore] No user signed in');
      return { success: false, message: 'Not logged in' };
    }

    console.log('[Firestore] 🔥🔥🔥 NUKING ALL TASKS 🔥🔥🔥');

    // Get all task documents
    const tasksCollection = collection(db, 'users', user.uid, 'tasks');
    const tasksSnapshot = await getDocs(tasksCollection);

    const results = { deleted: [], failed: [] };

    // Delete each task document
    for (const taskDoc of tasksSnapshot.docs) {
      try {
        await deleteDoc(taskDoc.ref);
        results.deleted.push(taskDoc.id);
        console.log(`[Firestore] Deleted: ${taskDoc.id}`);
      } catch (e) {
        results.failed.push({ id: taskDoc.id, error: e.message });
      }
    }

    // Also get completed tasks
    const completedCollection = collection(db, 'users', user.uid, 'completed-tasks');
    const completedSnapshot = await getDocs(completedCollection);

    for (const completedDoc of completedSnapshot.docs) {
      try {
        await deleteDoc(completedDoc.ref);
        results.deleted.push(`completed-${completedDoc.id}`);
      } catch (e) {
        results.failed.push({ id: `completed-${completedDoc.id}`, error: e.message });
      }
    }

    // Clear ALL task-related localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('tasks-') || key.startsWith('completed-tasks-') || key === 'calculatedPriorityTasks')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => storageService.remove(key));

    console.log('[Firestore] ✅ NUKE COMPLETE:', results);
    return { success: true, results };
  } catch (error) {
    console.error('[Firestore] NUKE FAILED:', error);
    return { success: false, error: error.message };
  }
}

// Expose globally for legacy components and workspace iframe
if (typeof window !== 'undefined') {
    window.loadTasksFromFirestore = loadTasksFromFirestore;
    window.saveTasksToFirestore = saveTasksToFirestore;
    window.deleteAllTasksFromFirestore = deleteAllTasksFromFirestore;
    window.nukeAllTasks = nukeAllTasks;
}

