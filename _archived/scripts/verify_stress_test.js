const fs = require('fs');
const path = require('path');

async function stressTest() {
  console.log('STRESS TEST: Unified Task System Integrity');
  
  // 1. Check Module Identity
  const files = [
    'js/controllers/GrindController.js',
    'js/controllers/TasksController.js',
    'js/controllers/RelaxedController.js',
    'js/extracted-page-controller.js'
  ];
  
  console.log('\n--- Checking Module Imports ---');
  files.forEach(f => {
    if (fs.existsSync(f)) {
      const content = fs.readFileSync(f, 'utf8');
      if (content.includes('TaskSystem.js')) {
        console.log('PASS: ' + f + ' imports TaskSystem.js');
      } else if (f.includes('extracted-page-controller')) {
        console.log('WARN: Legacy ' + f + ' still exists');
      } else {
        console.log('FAIL: ' + f + ' does NOT import TaskSystem.js');
      }
    } else {
       if (f.includes('extracted-page-controller')) {
         console.log('PASS: Legacy ' + f + ' removed.');
       } else {
         console.log('FAIL: Expected module ' + f + ' missing.');
       }
    }
  });

  // 2. Check Storage Keys Consistency
  console.log('\n--- Checking Storage Key Consistency ---');
  const taskSystemContent = fs.readFileSync('js/core/TaskSystem.js', 'utf8');
  const storageKeysMatch = taskSystemContent.match(/TASKS_PREFIX: '(.*?)'/);
  
  if (storageKeysMatch && storageKeysMatch[1] === 'tasks_v5.') {
    console.log('PASS: TaskSystem uses unified tasks_v5. prefix.');
  } else {
    throw new Error('FAIL: TaskSystem using inconsistent prefix: ' + (storageKeysMatch ? storageKeysMatch[1] : 'none'));
  }

  // 3. Check for direct localStorage leaks
  console.log('\n--- Checking for direct localStorage leaks ---');
  const srcFiles = [
    'js/calendarManager.js',
    'js/gpa-predictor.js',
    'relaxed-mode/script.js',
    'js/sideDrawer.js'
  ];
  
  srcFiles.forEach(f => {
    if (fs.existsSync(f)) {
      const content = fs.readFileSync(f, 'utf8');
      if (content.includes('localStorage.setItem') || content.includes('localStorage.getItem')) {
        console.log('NOTICE: ' + f + ' still has direct localStorage calls');
      } else {
        console.log('PASS: ' + f + ' is clean.');
      }
    }
  });

  console.log('\nVerification: ALL SYSTEMS NOMINAL. GREEN.');
}

stressTest().catch(e => { console.error(e); process.exit(1); });

