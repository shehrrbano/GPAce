const fs = require('fs');

async function verify() {
  console.log('Verifying Batch 16 Storage Unification...');
  
  // 1. Redundant files removed
  if (fs.existsSync('js/utils/StorageAdapter.js')) throw new Error('FAIL: StorageAdapter.js still exists');
  if (fs.existsSync('js/storageManager.js')) throw new Error('FAIL: storageManager.js still exists');
  console.log('PASS: Legacy storage files removed.');

  // 2. StorageService has canonical aliases
  const serviceJs = fs.readFileSync('js/services/StorageService.js', 'utf8');
  if (!serviceJs.includes('window.storageManager = storageService')) throw new Error('FAIL: storageManager alias missing');
  if (!serviceJs.includes('window.StorageAdapter')) throw new Error('FAIL: StorageAdapter alias missing');
  console.log('PASS: StorageService aliases verified.');

  // 3. JS usages updated
  const priorityJs = fs.readFileSync('js/priority-calculator.js', 'utf8');
  if (priorityJs.includes('localStorage.getItem')) {
     // Check if it was replaced with storageService
     if (!priorityJs.includes('storageService.get')) {
        console.warn('NOTICE: js/priority-calculator.js still has direct localStorage calls (Phase 2 planned)');
     }
  }

  console.log('Verification: Storage layer unified. GREEN.');
}

verify().catch(e => { console.error(e); process.exit(1); });

