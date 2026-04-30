const fs = require('fs');

async function verify() {
  console.log('Verifying Batch 13 UI Controller Consolidation...');
  
  // 1. TasksController has consolidated logic
  const controllerJs = fs.readFileSync('js/controllers/TasksController.js', 'utf8');
  if (!controllerJs.includes('initHustleHub')) throw new Error('FAIL: TasksController missing Hustle Hub logic');
  console.log('PASS: TasksController consolidated.');

  // 2. extracted.html updated
  const html = fs.readFileSync('extracted.html', 'utf8');
  if (html.includes('js/extracted-page-controller.js')) throw new Error('FAIL: extracted.html still uses legacy controller');
  if (!html.includes('js/controllers/TasksController.js')) throw new Error('FAIL: extracted.html not using unified controller');
  console.log('PASS: extracted.html updated.');

  // 3. Legacy file removed
  if (fs.existsSync('js/extracted-page-controller.js')) throw new Error('FAIL: extracted-page-controller.js still exists');
  console.log('PASS: Legacy controller removed.');

  console.log('Verification: UI Controllers consolidated. GREEN.');
}

verify().catch(e => { console.error(e); process.exit(1); });
