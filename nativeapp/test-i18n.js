// Simple test to verify i18n configuration
const i18n = require('./lib/i18n/i18n.ts');

console.log('Testing i18n configuration...');
console.log('Current language:', i18n.default.language);
console.log('Available languages:', i18n.default.languages);

// Test translation
const testKey = 'home.title';
console.log(`Translation for '${testKey}':`, i18n.default.t(testKey));

console.log('i18n test completed successfully!');