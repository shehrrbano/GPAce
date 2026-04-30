const fs = require('fs');

async function testGreen() {
  console.log('Verifying Batch 9 God Node Splitting...');
  
  // 1. Services created
  if (!fs.existsSync('js/services/CalendarService.js')) throw new Error('FAIL: CalendarService missing');
  if (!fs.existsSync('js/services/GPAService.js')) throw new Error('FAIL: GPAService missing');
  console.log('PASS: Services created.');

  // 2. Managers refactored
  const calendarJs = fs.readFileSync('js/calendarManager.js', 'utf8');
  if (!calendarJs.includes('import { calendarService }')) throw new Error('FAIL: CalendarManager not using service');
  
  const gpaJs = fs.readFileSync('js/gpa-predictor.js', 'utf8');
  if (!gpaJs.includes('import { gpaService }')) throw new Error('FAIL: GPAPredictor not using service');
  console.log('PASS: Managers refactored to use services.');

  // 3. Logic extracted
  if (gpaJs.includes('const GRADING_SCALES =')) throw new Error('FAIL: GRADING_SCALES still in GPAPredictor');
  console.log('PASS: Business logic extracted from managers.');

  console.log('Verification: God nodes split into Services and Controllers. GREEN.');
}

testGreen().catch(e => { console.error(e); process.exit(1); });
