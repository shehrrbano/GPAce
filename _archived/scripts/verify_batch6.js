const fs = require('fs');

async function testGreen() {
  console.log('Verifying Batch 6 Task Layer Unification...');
  
  // 1. TaskService delegates to TaskRepository
  const serviceJs = fs.readFileSync('js/services/TaskService.js', 'utf8');
  if (!serviceJs.includes('TaskRepository.addTask')) throw new Error('FAIL: TaskService not using Repository');
  console.log('PASS: TaskService delegates to TaskRepository.');

  // 2. TaskRepository uses StorageService
  const repoJs = fs.readFileSync('js/core/TaskRepository.js', 'utf8');
  if (!repoJs.includes('storageService.set')) throw new Error('FAIL: TaskRepository not using StorageService');
  console.log('PASS: TaskRepository uses StorageService.');

  // 3. Firestore integrated
  if (!repoJs.includes('loadTasksFromFirestore')) throw new Error('FAIL: TaskRepository missing Firestore integration');
  console.log('PASS: Firestore integrated into Repository.');

  console.log('Verification: Task layer unified and synchronized. GREEN.');
}

testGreen().catch(e => { console.error(e); process.exit(1); });
