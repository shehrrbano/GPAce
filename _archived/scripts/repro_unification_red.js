const fs = require('fs');

async function testRed() {
  console.log('Test RED: Verify TaskRepository and StorageService desync.');
  
  const repoContent = fs.readFileSync('js/core/TaskRepository.js', 'utf8');
  const storageContent = fs.readFileSync('js/services/StorageService.js', 'utf8');
  
  const repoPrefixMatch = repoContent.match(/TASKS_PREFIX: '(.*?)'/);
  const storagePrefixMatch = storageContent.match(/const STORAGE_PREFIX = '(.*?)'/);
  
  if (!repoPrefixMatch || !storagePrefixMatch) {
    throw new Error('Could not find prefixes in source files');
  }
  
  const repoPrefix = repoPrefixMatch[1];
  const storagePrefix = storagePrefixMatch[1];
  
  console.log('TaskRepository Prefix: ' + repoPrefix);
  console.log('StorageService Prefix: ' + storagePrefix);
  
  if (repoPrefix === storagePrefix) {
    throw new Error('FAIL: Prefixes match! desync not proven.');
  }
  
  console.log('Prefix mismatch verified. Data isolation exists. RED.');
}

testRed().catch(e => { console.error(e); process.exit(1); });
