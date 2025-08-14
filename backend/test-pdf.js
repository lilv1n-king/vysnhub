const puppeteer = require('puppeteer');

async function testPDF() {
  console.log('🧪 Testing PDF generation...');
  
  let browser = null;
  try {
    // Browser starten
    console.log('🚀 Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    console.log('✅ Browser launched successfully');

    const page = await browser.newPage();
    console.log('📄 Creating test page...');

    // Einfache HTML-Seite
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>PDF Test</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>🧪 PDF Test</h1>
          <p>Dies ist ein Test, ob PDF-Generierung funktioniert.</p>
          <p>Datum: ${new Date().toLocaleDateString('de-DE')}</p>
        </body>
      </html>
    `;

    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    console.log('📝 HTML content set');

    // PDF generieren
    console.log('🔄 Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    console.log('✅ PDF generated successfully!');
    console.log(`📏 PDF size: ${pdfBuffer.length} bytes`);
    
    // PDF speichern
    const fs = require('fs');
    const filename = `test-pdf-${Date.now()}.pdf`;
    fs.writeFileSync(filename, pdfBuffer);
    console.log(`💾 PDF saved as: ${filename}`);

    return true;

  } catch (error) {
    console.error('❌ PDF generation failed:', error.message);
    console.error('🔍 Error details:', error);
    return false;
  } finally {
    if (browser) {
      await browser.close();
      console.log('🚪 Browser closed');
    }
  }
}

// Test ausführen
testPDF().then(success => {
  if (success) {
    console.log('🎉 PDF test completed successfully!');
    process.exit(0);
  } else {
    console.log('💥 PDF test failed!');
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
