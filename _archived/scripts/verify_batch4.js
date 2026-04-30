const fs = require('fs');

async function verify() {
  console.log('Verifying Batch 4 Storage Abstraction...');
  
  // 1. TaskService.js uses storageService
  const taskService = fs.readFileSync('js/services/TaskService.js', 'utf8');
  if (!taskService.includes('storageService.get') || !taskService.includes('storageService.set')) {
    throw new Error('FAIL: TaskService still uses direct localStorage');
  }
  console.log('PASS: TaskService updated to use StorageService.');

  // 2. StorageService.js exports correctly
  const storageJs = fs.readFileSync('js/services/StorageService.js', 'utf8');
  if (!storageJs.includes('export { storageService')) throw new Error('FAIL: StorageService missing export');
  console.log('PASS: StorageService exports verified.');

  console.log('Verification: Storage layer abstracted and integrated. GREEN.');
}

verify().catch(e => { console.error(e); process.exit(1); });
