const fs = require('fs');
const path = require('path');

async function testGreen() {
  console.log('Test GREEN: Ensure redundant files are archived.');
  const files = ['js/firebase-config.js', 'js/firebase-init.js', 'js/firebaseAuth.js'];
  for (const f of files) {
    if (fs.existsSync(f)) throw new Error('File still exists in js/: ' + f);
  }
  
  const archived = ['_archived/firebase-config.js.bak', '_archived/firebase-init.js.bak', '_archived/firebaseAuth.js.bak'];
  for (const f of archived) {
    if (!fs.existsSync(f)) throw new Error('Archive missing: ' + f);
  }
  console.log('Redundant files archived. GREEN.');
}

testGreen().catch(e => { console.error(e); process.exit(1); });
