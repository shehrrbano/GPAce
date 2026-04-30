const fs = require('fs');

async function testRed() {
  console.log('Test RED: Ensure DOMPurify is not included in index.html or workspace.html.');
  const indexHtml = fs.readFileSync('index.html', 'utf8');
  const workspaceHtml = fs.readFileSync('workspace.html', 'utf8');
  
  if (indexHtml.includes('dompurify') || workspaceHtml.includes('dompurify')) {
    throw new Error('FAIL: DOMPurify already found! RED failed.');
  }
  console.log('DOMPurify missing. RED.');
}

testRed().catch(e => { console.error(e); process.exit(1); });
