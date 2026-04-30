const fs = require('fs');

async function verify() {
  console.log('Verifying Batch 18 Speech Service Extraction...');
  
  // 1. Service files exist
  if (!fs.existsSync('js/services/SpeechRecognitionService.js')) throw new Error('FAIL: SpeechRecognitionService missing');
  if (!fs.existsSync('js/services/SpeechSynthesisService.js')) throw new Error('FAIL: SpeechSynthesisService missing');
  console.log('PASS: Service modules created.');

  // 2. Managers are facades
  const recognitionJs = fs.readFileSync('js/speech-recognition.js', 'utf8');
  if (recognitionJs.length > 5000) throw new Error('FAIL: speech-recognition.js still too large');
  if (!recognitionJs.includes('speechRecognitionService')) throw new Error('FAIL: manager not using service');

  const synthesisJs = fs.readFileSync('js/grind-speech-synthesis.js', 'utf8');
  if (synthesisJs.length > 5000) throw new Error('FAIL: grind-speech-synthesis.js still too large');
  
  // 3. Redundant file gone
  if (fs.existsSync('js/speech-synthesis.js')) throw new Error('FAIL: js/speech-synthesis.js still exists');
  console.log('PASS: Redundant manager file removed.');

  console.log('Verification: Speech logic decoupled. GREEN.');
}

verify().catch(e => { console.error(e); process.exit(1); });
