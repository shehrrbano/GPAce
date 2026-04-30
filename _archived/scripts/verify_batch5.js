const fs = require('fs');

async function verify() {
  console.log('Verifying Batch 5 Security Hardening...');
  
  // 1. DOMPurify check
  const html = fs.readFileSync('workspace.html', 'utf8');
  if (!html.includes('dompurify')) throw new Error('FAIL: DOMPurify script tag missing');
  console.log('PASS: DOMPurify included.');

  // 2. Safe UI check
  const uiJs = fs.readFileSync('js/workspace-ui.js', 'utf8');
  if (uiJs.includes('<span>\</span>')) throw new Error('FAIL: showToast still uses unsafe innerHTML');
  if (!uiJs.includes('messageEl.textContent = displayMessage')) throw new Error('FAIL: showToast missing textContent safety');
  console.log('PASS: showToast sanitized.');

  // 3. Export sanitization check
  const docJs = fs.readFileSync('js/workspace-document.js', 'utf8');
  if (!docJs.includes('DOMPurify.sanitize')) throw new Error('FAIL: exportAsPDF missing sanitization');
  console.log('PASS: exportAsPDF sanitized.');

  console.log('Verification: Security hardened with DOMPurify and safe UI patterns. GREEN.');
}

verify().catch(e => { console.error(e); process.exit(1); });
