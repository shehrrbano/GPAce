const fs = require('fs');

async function testGreen() {
  console.log('Verifying Batch 8 Module Transition...');
  
  // 1. tasks.html cleaned
  const tasksHtml = fs.readFileSync('tasks.html', 'utf8');
  if (tasksHtml.includes('<script type=\"module\">')) {
     // Check if it's the one we kept or if it's the old ones
     if (tasksHtml.includes('firebaseConfig')) throw new Error('FAIL: tasks.html still has inline firebase logic');
  }
  console.log('PASS: tasks.html cleaned.');

  // 2. index.html cleaned
  const indexHtml = fs.readFileSync('index.html', 'utf8');
  if (indexHtml.includes('<script>')) throw new Error('FAIL: index.html still has inline scripts');
  console.log('PASS: index.html cleaned.');

  // 3. services/index.js is pure ESM
  const servicesJs = fs.readFileSync('js/services/index.js', 'utf8');
  if (servicesJs.includes('window.StorageService')) throw new Error('FAIL: services/index.js still uses window');
  console.log('PASS: services/index.js is pure ESM.');

  console.log('Verification: Module transition complete. GREEN.');
}

testGreen().catch(e => { console.error(e); process.exit(1); });
