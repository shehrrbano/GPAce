const fs = require('fs');

async function verify() {
  console.log('Verifying Batch 17 Calendar Component Refactor...');
  
  // 1. Files created
  if (!fs.existsSync('js/components/CalendarRenderer.js')) throw new Error('FAIL: CalendarRenderer.js missing');
  if (!fs.existsSync('js/controllers/CalendarEvents.js')) throw new Error('FAIL: CalendarEvents.js missing');
  console.log('PASS: Extracted components created.');

  // 2. Manager refactored
  const managerJs = fs.readFileSync('js/calendarManager.js', 'utf8');
  if (!managerJs.includes('import CalendarRenderer from ./components/CalendarRenderer.js')) {
      if (!managerJs.includes('import CalendarRenderer from')) throw new Error('FAIL: CalendarManager not using renderer');
  }
  if (!managerJs.includes('this.renderer = new CalendarRenderer(this)')) throw new Error('FAIL: CalendarManager not initializing renderer');
  console.log('PASS: CalendarManager refactored to use orchestrator pattern.');

  // 3. Logic extracted
  if (managerJs.includes('createTimeAxis() {')) throw new Error('FAIL: createTimeAxis still in CalendarManager');
  console.log('PASS: Rendering logic extracted from manager.');

  console.log('Verification: Calendar God Node split. GREEN.');
}

verify().catch(e => { console.error(e); process.exit(1); });
