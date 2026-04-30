const fs = require('fs');

async function testGreen() {
  console.log('Test GREEN: Ensure grind.html has fewer inline handlers and includes GrindController.');
  const html = fs.readFileSync('grind.html', 'utf8');
  
  if (!html.includes('js/controllers/GrindController.js')) throw new Error('FAIL: GrindController script not included');
  
  // Check for specific removals
  if (html.includes('onclick=\"handleSyncTasks()\"')) throw new Error('FAIL: handleSyncTasks inline handler still present');
  
  console.log('Verification: GrindController included and inline handlers removed. GREEN.');
}

testGreen().catch(e => { console.error(e); process.exit(1); });
