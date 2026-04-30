const fs = require('fs');

async function testRed() {
  console.log('Test RED: Ensure grind.html contains inline event handlers.');
  const html = fs.readFileSync('grind.html', 'utf8');
  const inlineHandlers = [/onclick=/, /onchange=/, /onsubmit=/];
  let found = false;
  inlineHandlers.forEach(regex => {
    if (regex.test(html)) {
      console.log('Found inline handler matching: ' + regex);
      found = true;
    }
  });
  if (!found) throw new Error('No inline handlers found in grind.html - test RED failed');
  console.log('Inline handlers verified. RED.');
}

testRed().catch(e => { console.error(e); process.exit(1); });
