const fs = require('fs');

async function testGreen() {
  console.log('Verifying Batch 7 Secret Hardening...');
  
  const firebaseConfig = fs.readFileSync('js/firebaseConfig.js', 'utf8');
  const geminiApi = fs.readFileSync('js/gemini-api.js', 'utf8');
  
  const rawFirebaseKey = 'AIzaSyCdxGGpfoWD_M_6BwWFqWZ-6MAOKTUjIrI';
  const rawGeminiKey = 'AIzaSyD_NmyxJDO--WtvXIU41sRJ7XqZWLNUFd0';
  
  if (firebaseConfig.includes(rawFirebaseKey)) {
    throw new Error('FAIL: Raw Firebase key still in source');
  }
  
  if (geminiApi.includes(rawGeminiKey)) {
    throw new Error('FAIL: Raw Gemini key still in source');
  }
  
  if (!firebaseConfig.includes('secretManager.getFirebaseKey()')) {
    throw new Error('FAIL: firebaseConfig not using SecretManager');
  }
  
  if (!geminiApi.includes('secretManager.getGeminiKey()')) {
    throw new Error('FAIL: gemini-api not using SecretManager');
  }

  console.log('Verification: Hardcoded secrets removed and redirected to SecretManager. GREEN.');
}

testGreen().catch(e => { console.error(e); process.exit(1); });
