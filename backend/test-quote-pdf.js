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
  project: {
    id: 'test-123',
    project_name: 'Martijn',
    project_location: 'München, Deutschland',
    project_description: 'Moderne LED-Beleuchtung für Büroräume'
  },
  products: [
    {
      itemNumber: 'V107051T1B',
      name: 'Bounto P3, amber',
      quantity: 1,
      unitPrice: 381.81,
      totalPrice: 381.81,
      productData: {
        item_number_vysn: 'V107051T1B',
        short_description: 'Bounto P3, amber',
        product_picture_1: 'https://vysn.de/wp-content/uploads/2023/11/V107051T1B_1.jpg'
      }
    },
    {
      itemNumber: 'PRO-0410-B', 
      name: '3 Phase track, 1 meter',
      quantity: 2,
      unitPrice: 35.51,
      totalPrice: 71.02,
      productData: {
        item_number_vysn: 'PRO-0410-B',
        short_description: '3 Phase track, 1 meter',
        product_picture_1: 'https://vysn.de/wp-content/uploads/2023/11/PRO-0410-B_1.jpg'
      }
    },
    {
      itemNumber: 'V107002T1B',
      name: 'Bounto P2',
      quantity: 1,
      unitPrice: 310.61,
      totalPrice: 310.61,
      productData: {
        item_number_vysn: 'V107002T1B',
        short_description: 'Bounto P2',
        product_picture_1: 'https://vysn.de/wp-content/uploads/2023/11/V107002T1B_1.jpg'
      }
    }
  ],
  quoteTotal: 763.44,
  senderName: 'Levin Normann',
  senderEmail: 'levin.normann98@gmail.com',
  senderCompany: 'CaNa Factory UG',
  customerDiscount: 11,
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
