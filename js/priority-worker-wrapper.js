/**
 * Priority Worker Wrapper
 * 
 * This module provides a wrapper around the Node.js worker thread
 * that handles priority calculations. It offloads CPU-intensive
 * task priority calculations to a separate thread.
 * 
 * NOTE: This is a Node.js module. It does NOT have access to browser
 * globals like window, localStorage, or document. All data must be
 * passed in as parameters.
 */

const { Worker } = require('worker_threads');
const path = require('path');

/**
 * Run the priority calculation in a worker thread
 * @param {Object} input - Data needed for priority calculation
 * @returns {Promise} - Promise that resolves with the calculated priority tasks
 */
function runPriorityWorker(input) {
  return new Promise((resolve, reject) => {
    // Create a new worker instance
    const worker = new Worker(path.resolve(__dirname, '../worker.js'));

    // Send input data to the worker
    worker.postMessage(input);

    // Handle the result from the worker
    worker.on('message', resolve);

    // Handle any errors
    worker.on('error', reject);

    // Handle worker exit
    worker.on('exit', code => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

/**
 * Calculate priority scores for all tasks using the worker thread
 * 
 * @param {Object} storageData - Required data from storage (must be passed in from caller)
 * @param {Array} storageData.subjects - Array of academic subjects
 * @param {Object} storageData.subjectMarks - Subject marks data
 * @param {Object} storageData.subjectWeightages - Subject weightages
 * @param {Object} storageData.projectWeightages - Project weightages
 * @param {Function} [storageData.getTasksForSubject] - Optional function to get tasks for a subject tag
 * @param {Object} [storageData.allTasks] - Optional: pre-loaded tasks object { subjectTag: tasksArray }
 * @returns {Promise<Array>} - Promise that resolves with the calculated priority tasks
 */
async function calculatePrioritiesWithWorker(storageData = {}) {
  // Validate required input
  if (!storageData || typeof storageData !== 'object') {
    throw new Error('storageData parameter is required. This module runs in Node.js and cannot access browser storage.');
  }

  const {
    subjects = [],
    subjectMarks = {},
    subjectWeightages = {},
    projectWeightages = {},
    allTasks = {},
    getTasksForSubject = null
  } = storageData;

  try {
    const tasks = {};

    // Get tasks for each subject
    for (const subject of subjects) {
      if (allTasks[subject.tag]) {
        // Use pre-loaded tasks if available
        tasks[subject.tag] = allTasks[subject.tag];
      } else if (typeof getTasksForSubject === 'function') {
        // Use callback function if provided
        tasks[subject.tag] = getTasksForSubject(subject.tag) || [];
      } else {
        // Default to empty array
        tasks[subject.tag] = [];
      }
    }

    // Extract performance values for each subject
    const academicPerformance = {};
    Object.keys(subjectMarks).forEach(subjectId => {
      academicPerformance[subjectId] = subjectMarks[subjectId]._performance || 0;
    });

    // Prepare input data for the worker
    const input = {
      subjects,
      tasks,
      academicPerformance,
      taskWeightages: {
        subjectWeightages,
        projectWeightages
      }
    };

    // Run the worker and get the result
    const result = await runPriorityWorker(input);

    return result;
  } catch (error) {
    console.error('Error calculating priorities with worker:', error);
    throw error;
  }
}

/**
 * Helper function to prepare storage data from browser context
 * This should be called from the BROWSER side before invoking the worker
 * 
 * @param {Function} getStorage - Storage accessor function
 * @returns {Object} - Storage data object suitable for calculatePrioritiesWithWorker
 * 
 * @example
 * // In browser context:
 * const storage = window.StorageService || getStorage();
 * const storageData = prepareStorageData(storage);
 * // Then pass storageData to a server endpoint or IPC channel
 */
function prepareStorageData(storage) {
  if (!storage || typeof storage.get !== 'function') {
    throw new Error('Valid storage object with get() method is required');
  }

  const subjects = storage.get('academicSubjects', []);
  const allTasks = {};

  // Get tasks for each subject
  subjects.forEach(subject => {
    allTasks[subject.tag] = storage.get(`tasks-${subject.tag}`, []);
  });

  return {
    subjects,
    subjectMarks: storage.get('subjectMarks', {}),
    subjectWeightages: storage.get('subjectWeightages', {}),
    projectWeightages: storage.get('projectWeightages', {}),
    allTasks
  };
}

// Export the functions
module.exports = {
  calculatePrioritiesWithWorker,
  runPriorityWorker,
  prepareStorageData
};
