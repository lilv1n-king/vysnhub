// Test Quote PDF Generation
const { PDFService } = require('./dist/services/pdfService.js');

const pdfService = new PDFService();

// Test-Daten für Quote
const testQuoteData = {
  customerName: 'Max Mustermann',
  customerEmail: 'max@example.com',
  customerCompany: 'Test GmbH',
  customerPhone: '+49 123 456789',
  customerAddress: 'Musterstraße 1',
  customerCity: 'München',
  customerPostalCode: '80333',
  message: 'Test-Nachricht für das Angebot',
  project: {
    id: 'test-123',
    project_name: 'LED Beleuchtung Büro',
    location: 'München, Deutschland',
    description: 'Moderne LED-Beleuchtung für Büroräume',
    customer_discount: 10
  },
  products: [
    {
      productName: 'LED Spot 10W',
      quantity: 5,
      unitPrice: 25.00,
      totalPrice: 125.00,
      productData: {
        item_number_vysn: 'LED-001',
        short_description: 'Moderner LED Spot'
      }
    },
    {
      productName: 'LED Streifen 5m',
      quantity: 2,
      unitPrice: 45.00,
      totalPrice: 90.00,
      productData: {
        item_number_vysn: 'LED-002',
        short_description: 'Flexibler LED Streifen'
      }
    }
  ],
  quoteTotal: 215.00,
  senderName: 'VYSN Partner',
  senderEmail: 'partner@vysn.de',
  senderCompany: 'VYSN GmbH',
  customerDiscount: 10,
  language: 'de',
  taxRate: 19
};

async function testQuotePDF() {
  console.log('🧪 Testing Quote PDF generation...');
  
  try {
    console.log('🔄 Generating quote PDF...');
    const pdfBuffer = await pdfService.generateQuotePDF(testQuoteData);
    
    console.log('✅ Quote PDF generated successfully!');
    console.log(`📏 PDF size: ${pdfBuffer.length} bytes`);
    
    // PDF speichern
    const fs = require('fs');
    const filename = `test-quote-${Date.now()}.pdf`;
    fs.writeFileSync(filename, pdfBuffer);
    console.log(`💾 Quote PDF saved as: ${filename}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Quote PDF generation failed:', error.message);
    console.error('🔍 Error details:', error);
    return false;
  }
}

// Test ausführen
testQuotePDF().then(success => {
  if (success) {
    console.log('🎉 Quote PDF test completed successfully!');
    process.exit(0);
  } else {
    console.log('💥 Quote PDF test failed!');
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
