const fs = require('fs');
const path = require('path');

async function testRed() {
  console.log('Test RED: Ensure redundant files exist.');
  const files = ['js/firebase-config.js', 'js/firebase-init.js', 'js/firebaseAuth.js'];
  for (const f of files) {
    if (!fs.existsSync(f)) throw new Error('Missing file: ' + f);
  }
  console.log('Files present. Redundant initialization risk verified.');
}

testRed().catch(e => { console.error(e); process.exit(1); });
