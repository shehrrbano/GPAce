const fs = require('fs');

async function verify() {
  console.log('Verifying Batch 14 Relaxed Mode Refactor...');
  
  // 1. RelaxedController exists
  if (!fs.existsSync('js/controllers/RelaxedController.js')) throw new Error('FAIL: RelaxedController.js missing');
  console.log('PASS: RelaxedController.js created.');

  // 2. script.js is facade
  const scriptJs = fs.readFileSync('relaxed-mode/script.js', 'utf8');
  if (scriptJs.includes('const PROJECT_ID =')) throw new Error('FAIL: script.js still contains business logic constants');
  if (!scriptJs.includes("import relaxedController from '../js/controllers/RelaxedController.js'")) throw new Error('FAIL: script.js not using controller');
  console.log('PASS: script.js refactored into facade.');

  console.log('Verification: Relaxed Mode consolidated. GREEN.');
}

verify().catch(e => { console.error(e); process.exit(1); });
