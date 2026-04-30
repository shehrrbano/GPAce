const fs = require('fs');

async function verify() {
  console.log('Verifying Batch 2 Encapsulation...');
  
  // 1. Globals Registry exists
  if (!fs.existsSync('js/core/globals.js')) throw new Error('FAIL: globals.js missing');
  console.log('PASS: globals.js exists.');

  // 2. Facade exists
  if (!fs.existsSync('js/workspace/index.js')) throw new Error('FAIL: js/workspace/index.js missing');
  console.log('PASS: workspace facade exists.');

  // 3. Module uses registry
  const coreJs = fs.readFileSync('js/workspace-core.js', 'utf8');
  if (!coreJs.includes("import globals from './core/globals.js'")) throw new Error('FAIL: workspace-core missing globals import');
  if (!coreJs.includes("globals.register")) throw new Error('FAIL: workspace-core not using globals.register');
  console.log('PASS: modules using globals registry.');

  // 4. HTML updated
  const html = fs.readFileSync('workspace.html', 'utf8');
  if (!html.includes("import * as Workspace from './js/workspace/index.js'")) throw new Error('FAIL: workspace.html not using facade');
  console.log('PASS: workspace.html updated.');
}

verify().catch(e => { console.error(e); process.exit(1); });
