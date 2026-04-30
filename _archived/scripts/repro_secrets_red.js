const fs = require('fs');

async function testRed() {
  console.log('Test RED: Verify hardcoded API keys in source files.');
  
  const firebaseConfig = fs.readFileSync('js/firebaseConfig.js', 'utf8');
  const geminiApi = fs.readFileSync('js/gemini-api.js', 'utf8');
  
  const firebaseKey = firebaseConfig.match(/apiKey: "(.*?)"/);
  const geminiKey = geminiApi.match(/this\.apiKey = apiKey \|\| '(.*?)'/);
  
  if (firebaseKey && !firebaseKey[1].includes('process.env')) {
    console.log('Found hardcoded Firebase Key: ' + firebaseKey[1]);
  } else {
    throw new Error('FAIL: Firebase hardcoded key not found or already sanitized');
  }
  
  if (geminiKey) {
    console.log('Found hardcoded Gemini Fallback Key: ' + geminiKey[1]);
  } else {
    throw new Error('FAIL: Gemini hardcoded fallback key not found');
  }
  
  console.log('Hardcoded secrets verified. RED.');
}

testRed().catch(e => { console.error(e); process.exit(1); });
