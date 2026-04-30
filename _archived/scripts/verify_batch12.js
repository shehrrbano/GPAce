const fs = require('fs');

async function verify() {
  console.log('Verifying Batch 12 AI Researcher Decoupling...');
  
  // 1. Files created
  if (!fs.existsSync('js/services/GeminiService.js')) throw new Error('FAIL: GeminiService.js missing');
  if (!fs.existsSync('js/services/MathService.js')) throw new Error('FAIL: MathService.js missing');
  if (!fs.existsSync('js/controllers/ResearcherController.js')) throw new Error('FAIL: ResearcherController.js missing');
  console.log('PASS: Decoupled modules created.');

  // 2. ai-researcher.js slimmed down
  const aiJs = fs.readFileSync('js/ai-researcher.js', 'utf8');
  if (aiJs.length > 5000) throw new Error('FAIL: ai-researcher.js still too large');
  if (!aiJs.includes("import geminiService from './services/GeminiService.js'")) throw new Error('FAIL: ai-researcher.js not using GeminiService');
  console.log('PASS: ai-researcher.js refactored into facade.');

  // 3. Services index updated
  const servicesJs = fs.readFileSync('js/services/index.js', 'utf8');
  if (!servicesJs.includes('gemini: geminiService')) throw new Error('FAIL: services/index.js missing GeminiService');
  console.log('PASS: services/index.js updated.');

  console.log('Verification: AI Researcher decoupled. GREEN.');
}

verify().catch(e => { console.error(e); process.exit(1); });
