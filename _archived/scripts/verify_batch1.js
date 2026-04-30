const fs = require('fs');

async function verify() {
  console.log('Verifying Batch 1 Cleanup...');
  
  // 1. Redundant files are gone from js/
  const redundant = ['js/firebase-config.js', 'js/firebase-init.js', 'js/firebaseAuth.js'];
  redundant.forEach(f => {
    if (fs.existsSync(f)) throw new Error('FAIL: Redundant file still in js/: ' + f);
  });
  console.log('PASS: Redundant files archived.');

  // 2. Centralized auth exported
  const authJs = fs.readFileSync('js/auth.js', 'utf8');
  if (!authJs.includes('export const auth')) throw new Error('FAIL: auth.js does not export auth');
  console.log('PASS: auth.js exports auth.');

  // 3. Consumers use centralized auth
  const dataInit = fs.readFileSync('js/services/DataInitializationService.js', 'utf8');
  if (!dataInit.includes("import { auth as centralizedAuth } from '../auth.js'")) throw new Error('FAIL: DataInitializationService missing centralized auth import');
  
  const taskService = fs.readFileSync('js/services/TaskService.js', 'utf8');
  if (!taskService.includes("import { auth as centralizedAuth } from '../auth.js'")) throw new Error('FAIL: TaskService missing centralized auth import');

  const firestore = fs.readFileSync('js/firestore.js', 'utf8');
  if (!firestore.includes("import { auth as centralizedAuth } from './auth.js'")) throw new Error('FAIL: firestore.js missing centralized auth import');

  console.log('PASS: Consumers updated to use centralized auth module.');
}

verify().catch(e => { console.error(e); process.exit(1); });
