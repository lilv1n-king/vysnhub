// PDF Monitoring Script
const fs = require('fs');
const { spawn } = require('child_process');

console.log('🔍 PDF Generation Monitor gestartet...');
console.log('📧 Warte auf Quote-Email Requests...\n');

// Original console.log überschreiben um PDF-relevante Logs zu fangen
const originalLog = console.log;
const originalError = console.error;

console.log = function(...args) {
  const message = args.join(' ');
  
  // PDF-relevante Logs hervorheben
  if (message.includes('📄') || message.includes('PDF') || message.includes('Quote')) {
    originalLog('🔥', new Date().toLocaleTimeString(), '|', ...args);
  } else {
    originalLog(...args);
  }
};

console.error = function(...args) {
  const message = args.join(' ');
  
  // PDF-Fehler hervorheben
  if (message.includes('PDF') || message.includes('generation failed')) {
    originalError('❌', new Date().toLocaleTimeString(), '|', ...args);
  } else {
    originalError(...args);
  }
};

// Überwache Backend-Logs in Echtzeit
const logPatterns = [
  '📧 Sending quote email',
  '📄 Generating PDF attachment',
  '📄 Starting PDF generation for quote',
  '✅ PDF generated successfully',
  '⚠️ PDF generation failed',
  'Quote email',
  'POST /api/email/quote'
];

console.log('🎯 Überwache folgende Log-Patterns:');
logPatterns.forEach(pattern => console.log(`   - "${pattern}"`));
console.log('\n📡 Monitoring läuft... (Ctrl+C zum Beenden)\n');

// Fange Prozess-Beendigung ab
process.on('SIGINT', () => {
  console.log('\n👋 PDF Monitor beendet.');
  process.exit(0);
});

// Erstelle einfachen HTTP-Server um zu testen ob Backend läuft
const http = require('http');

function checkBackend() {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log('✅ Backend ist erreichbar auf Port 3001');
    }
  });

  req.on('error', (err) => {
    console.log('❌ Backend nicht erreichbar:', err.message);
  });

  req.end();
}

// Backend-Status alle 30 Sekunden prüfen
checkBackend();
setInterval(checkBackend, 30000);

// Dummy-Loop um Script am Leben zu halten
setInterval(() => {
  // Nichts tun, nur am Leben bleiben
}, 1000);
