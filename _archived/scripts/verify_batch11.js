const fs = require('fs');

async function verify() {
  console.log('Verifying Batch 11 Task System Consolidation...');
  
  // 1. Unified TaskSystem exists
  if (!fs.existsSync('js/core/TaskSystem.js')) throw new Error('FAIL: TaskSystem.js missing');
  console.log('PASS: TaskSystem.js exists.');

  // 2. Redundant files removed
  if (fs.existsSync('js/core/TaskRepository.js')) throw new Error('FAIL: TaskRepository.js still exists');
  if (fs.existsSync('js/services/TaskService.js')) throw new Error('FAIL: TaskService.js still exists');
  console.log('PASS: Consolidated files removed.');

  // 3. Loader updated
  const loader = fs.readFileSync('js/core/TaskSystemLoader.js', 'utf8');
  if (!loader.includes("import taskSystem from './TaskSystem.js'")) throw new Error('FAIL: Loader not using TaskSystem');
  if (!loader.includes("window.TaskSystem = taskSystem")) throw new Error('FAIL: Loader not exposing TaskSystem');
  console.log('PASS: Loader refactored.');

  // 4. Relaxed mode updated
  const relaxed = fs.readFileSync('relaxed-mode/script.js', 'utf8');
  if (relaxed.includes('storageService.set(STORAGE_KEY')) throw new Error('FAIL: Relaxed mode still using direct storage');
  console.log('PASS: Relaxed mode refactored.');

  console.log('Verification: Task System consolidated and unified. GREEN.');
}

verify().catch(e => { console.error(e); process.exit(1); });

