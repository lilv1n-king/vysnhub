import * as puppeteer from 'puppeteer';
import { Project } from '../models/Project';

interface QuoteProduct {
  itemNumber: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productData?: any;
}

interface QuotePDFData {
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customerPostalCode?: string;
  message?: string;
  project: Project;
  products: QuoteProduct[];
  quoteTotal: number;
  senderName: string;
  senderEmail: string;
  senderCompany?: string;
  customerDiscount?: number; // Endkunden-Discount in %
  language?: string; // Sprache: 'de' oder 'en'
  taxRate?: number; // Standard: 19%
}

// Übersetzungen für das PDF
const translations = {
  de: {
    quote: 'Angebot',
    customerInfo: 'Kundeninformationen',
    projectInfo: 'Projektinformationen', 
    projectName: 'Projektname',
    location: 'Standort',
    description: 'Beschreibung',
    quoteDate: 'Angebotsdatum',
    personalMessage: 'Persönliche Nachricht',
    offeredProducts: 'Angebotene Produkte',
    image: 'Bild',
    product: 'Produkt',
    quantity: 'Menge',
    unitPrice: 'Einzelpreis',
    totalPrice: 'Gesamtpreis',
    listPrice: 'Listenpreis',
    customerDiscount: 'Kundendiscount',
    netTotal: 'Gesamtsumme (netto)',
    contact: 'Kontakt für Rückfragen',
    companyName: '',
    companyTagline: '',
    vatNotice: 'Alle Preise verstehen sich zzgl. der gesetzlichen Mehrwertsteuer',
    termsNotice: 'Alle Preise sind Nettopreise zzgl. MwSt. | Angebot gültig 30 Tage ab Ausstellungsdatum | Irrtümer und Preisänderungen vorbehalten',
    shippingTitle: 'Versand & Lieferung',
    shippingText: 'Lieferzeiten und Versandkosten werden Ihnen nach Auftragsbestätigung mitgeteilt.<br>Bei Fragen zur Verfügbarkeit oder Lieferung kontaktieren Sie uns gerne.'
  },
  en: {
    quote: 'Quote',
    customerInfo: 'Customer Information',
    projectInfo: 'Project Information',
    projectName: 'Project Name',
    location: 'Location',
    description: 'Description', 
    quoteDate: 'Quote Date',
    personalMessage: 'Personal Message',
    offeredProducts: 'Offered Products',
    image: 'Image',
    product: 'Product',
    quantity: 'Quantity',
    unitPrice: 'Unit Price',
    totalPrice: 'Total Price',
    listPrice: 'List Price',
    customerDiscount: 'Customer Discount',
    netTotal: 'Total (net)',
    contact: 'Contact for inquiries',
    companyName: '',
    companyTagline: '',
    vatNotice: 'All prices are net prices plus VAT',
    termsNotice: 'All prices are net prices plus VAT | Quote valid for 30 days from issue date | Errors and price changes reserved',
    shippingTitle: 'Shipping & Delivery',
    shippingText: 'Delivery times and shipping costs will be communicated after order confirmation.<br>For questions about availability or delivery, please contact us.'
  }
};

export class PDFService {
  private static instance: PDFService;

  public static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  private t(key: string, language: string = 'de'): string {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations.de] || 
           translations.de[key as keyof typeof translations.de] || 
           key;
  }

  /**
   * Generiert ein PDF für ein Angebot
   */
  async generateQuotePDF(quoteData: QuotePDFData): Promise<Buffer> {
    let browser: puppeteer.Browser | null = null;
    
    try {
      console.log('📄 Starting PDF generation for quote...');
      
      // Browser starten
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

      const page = await browser.newPage();

      // HTML-Inhalt generieren
      const htmlContent = this.generateQuotePDFHTML(quoteData);
      
      // HTML setzen
      await page.setContent(htmlContent, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // PDF generieren
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        displayHeaderFooter: false,
        preferCSSPageSize: false
      });

      console.log('✅ PDF generated successfully');
      return Buffer.from(pdfBuffer);

    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Generiert HTML-Inhalt für das PDF
   */
  private generateQuotePDFHTML(quoteData: QuotePDFData): string {
    const { 
      customerName, 
      customerEmail,
      customerCompany, 
      customerPhone,
      customerAddress,
      customerCity,
      customerPostalCode,
      message, 
      project, 
      products, 
      quoteTotal, 
      senderName, 
      senderEmail, 
      senderCompany,
      customerDiscount = 0,
      language = 'de',
      taxRate = 19 
    } = quoteData;

    // Preise sind bereits netto (ohne MwSt)
    const netTotal = quoteTotal;
    
    // Wenn ein Kundendiscount vorliegt, berechne den ursprünglichen Preis
    const originalTotal = customerDiscount > 0 ? netTotal / (1 - customerDiscount / 100) : netTotal;
    const discountAmount = originalTotal - netTotal;

    return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Angebot ${project.project_name}</title>
    <style>
        @page {
            size: A4;
            margin: 0;
        }
        
        /* Verbessertes Seitenumbruch-Management */
        .header {
            page-break-after: avoid;
        }
        
        .quote-title {
            page-break-after: avoid;
        }
        
        .customer-section {
            page-break-inside: avoid;
            page-break-after: avoid;
        }
        
        .project-section {
            page-break-inside: avoid;
            page-break-after: avoid;
        }
        
        .message-section {
            page-break-inside: avoid;
            page-break-after: avoid;
        }
        
        .products-section {
            page-break-inside: avoid;
        }
        
        .products-table {
            page-break-inside: avoid;
        }
        
        .totals-section {
            page-break-inside: avoid;
            page-break-before: avoid;
        }
        
        .footer {
            page-break-inside: avoid;
        }
        
        /* Kompakte Darstellung für wenige Produkte */
        @media print {
            .products-section {
                break-inside: avoid;
            }
            
            .totals-section {
                break-inside: avoid;
                break-before: avoid;
            }
            
            /* Vermeide Umbrüche zwischen zusammengehörigen Elementen */
            .customer-section + .project-section {
                break-before: avoid;
            }
            
            .project-section + .message-section {
                break-before: avoid;
            }
            
            .message-section + .products-section {
                break-before: avoid;
            }
            
            .products-section + .totals-section {
                break-before: avoid;
            }
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #2c2c2c;
            background: white;
            padding: 20mm 15mm;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 3px solid #000;
            page-break-after: avoid;
        }
        
        .company-info {
            flex: 1;
        }
        
        .company-logo {
            font-size: 28pt;
            font-weight: bold;
            color: #000;
            margin-bottom: 5px;
        }
        
        .company-logo img {
            max-height: 60px;
            max-width: 200px;
            object-fit: contain;
        }
        
        .company-tagline {
            font-size: 11pt;
            color: #666;
            font-style: italic;
        }
        
        .sender-info {
            text-align: right;
            font-size: 10pt;
            color: #666;
            max-width: 250px;
        }
        
        .quote-title {
            text-align: center;
            font-size: 24pt;
            font-weight: bold;
            color: #000;
            margin: 20px 0;
            text-transform: uppercase;
            letter-spacing: 2px;
            page-break-after: avoid;
        }
        
        .customer-section {
            margin-bottom: 20px;
            page-break-inside: avoid;
            page-break-after: avoid;
        }
        
        .customer-info {
            background: #f8f9fa;
            padding: 20px;
            border-left: 5px solid #000;
            margin-bottom: 20px;
        }
        
        .customer-name {
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .project-section {
            margin-bottom: 20px;
            page-break-inside: avoid;
            page-break-after: avoid;
        }
        
        .section-title {
            font-size: 14pt;
            font-weight: bold;
            color: #000;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid #eee;
        }
        
        .project-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 15px;
        }
        
        .info-row {
            display: flex;
            margin-bottom: 8px;
        }
        
        .info-label {
            font-weight: bold;
            width: 120px;
            color: #555;
        }
        
        .info-value {
            flex: 1;
        }
        
        .products-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            page-break-inside: avoid;
            font-size: 10pt;
        }
        
        .products-table th {
            background: #000;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 10pt;
        }
        
        .products-table td {
            padding: 12px 8px;
            border-bottom: 1px solid #eee;
            vertical-align: top;
        }
        
        .products-table tr:nth-child(even) {
            background: #f9f9f9;
        }
        
        .product-image {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 5px;
            border: 1px solid #ddd;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .product-name {
            font-weight: 600;
            margin-bottom: 3px;
        }
        
        .product-sku {
            font-size: 9pt;
            color: #666;
            font-family: 'Courier New', monospace;
        }
        
        .quantity {
            text-align: center;
            font-weight: bold;
        }
        
        .price {
            text-align: right;
            font-weight: 600;
        }
        
        .totals-section {
            margin-top: 30px;
            display: flex;
            justify-content: flex-end;
        }
        
        .totals-table {
            width: 350px;
            border-collapse: collapse;
            font-size: 12pt;
        }
        
        .totals-table td {
            padding: 8px 12px;
            border-bottom: 1px solid #ddd;
        }
        
        .totals-table .label {
            font-weight: bold;
            color: #555;
        }
        
        .totals-table .value {
            text-align: right;
            font-weight: 600;
        }
        
        .total-row {
            border-top: 2px solid #000;
            font-size: 14pt;
        }
        
        .total-row td {
            padding: 15px 12px;
            border: none;
            font-weight: bold;
        }
        
        .message-section {
            margin: 30px 0;
            padding: 20px;
            background: #f0f8ff;
            border-left: 5px solid #007acc;
            border-radius: 0 5px 5px 0;
        }
        
        .message-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #007acc;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            text-align: center;
            font-size: 10pt;
            color: #666;
        }
        
        .footer-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
        }
        
        .contact-info {
            text-align: left;
        }
        
        .legal-info {
            text-align: right;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .highlight {
            background: #fff9c4;
            padding: 2px 4px;
            border-radius: 2px;
        }
        
        .small-text {
            font-size: 9pt;
            color: #888;
        }
    </style>
</head>
<body>
    <!-- Briefkopf -->
    <div class="header">
        <div class="company-info">
            <div class="company-logo">${senderCompany || senderName}</div>
        </div>
        <div class="sender-info">
            <strong>${senderName}</strong><br>
            ${senderEmail}<br>
            <div class="small-text">
                ${this.t('quoteDate', language)}: ${new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'de-DE')}
            </div>
        </div>
    </div>

    <!-- Angebots-Titel (klein) -->
    <h2 style="margin: 20px 0 30px 0; font-size: 16pt; color: #333;">${this.t('quote', language)}</h2>

    <!-- Kundeninformationen -->
    <div class="customer-section">
        <h2 class="section-title">${this.t('customerInfo', language)}</h2>
        <div class="customer-info">
            <div class="customer-name">${customerName}</div>
            ${customerCompany ? `<div style="font-weight: 600; margin-bottom: 5px;">${customerCompany}</div>` : ''}
            ${customerAddress ? `<div>${customerAddress}</div>` : ''}
            ${customerPostalCode && customerCity ? `<div>${customerPostalCode} ${customerCity}</div>` : ''}
            <div style="margin-top: 8px;">
                <div>E-Mail: ${customerEmail}</div>
                ${customerPhone ? `<div>Tel: ${customerPhone}</div>` : ''}
            </div>
        </div>
    </div>

    <!-- Projektinformationen -->
    <div class="project-section">
        <h2 class="section-title">${this.t('projectInfo', language)}</h2>
        <div class="project-info">
            <div class="info-row">
                <span class="info-label">${this.t('projectName', language)}:</span>
                <span class="info-value"><strong>${project.project_name}</strong></span>
            </div>
            ${project.project_location ? `
            <div class="info-row">
                <span class="info-label">${this.t('location', language)}:</span>
                <span class="info-value">${project.project_location}</span>
            </div>
            ` : ''}
            ${project.project_description ? `
            <div class="info-row">
                <span class="info-label">${this.t('description', language)}:</span>
                <span class="info-value">${project.project_description}</span>
            </div>
            ` : ''}
            <div class="info-row">
                <span class="info-label">${this.t('quoteDate', language)}:</span>
                <span class="info-value">${new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'de-DE')}</span>
            </div>
        </div>
    </div>

    ${message ? `
    <!-- Persönliche Nachricht -->
    <div class="message-section">
        <div class="message-title">${this.t('personalMessage', language)}:</div>
        <div>${message.replace(/\n/g, '<br>')}</div>
    </div>
    ` : ''}

    <!-- Produkttabelle -->
    <div class="products-section">
        <h2 class="section-title">${this.t('offeredProducts', language)}</h2>
        <table class="products-table">
            <thead>
                <tr>
                    <th style="width: 70px;">${this.t('image', language)}</th>
                    <th style="width: 200px;">${this.t('product', language)}</th>
                    <th style="width: 80px; text-align: center;">${this.t('quantity', language)}</th>
                    <th style="width: 100px; text-align: right;">${this.t('unitPrice', language)}</th>
                    <th style="width: 100px; text-align: right;">${this.t('totalPrice', language)}</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(product => `
                <tr>
                    <td style="text-align: center;">
                        ${product.productData?.product_picture_1 ? 
                            `<img src="${product.productData.product_picture_1}" alt="${product.name}" class="product-image">` : 
                            '<div style="width: 50px; height: 50px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 3px;"></div>'
                        }
                    </td>
                    <td>
                        <div class="product-name">${product.name}</div>
                        <div class="product-sku">${product.itemNumber}</div>
                    </td>
                    <td class="quantity">${product.quantity}x</td>
                    <td class="price">${this.formatPrice(product.unitPrice)}</td>
                    <td class="price">${this.formatPrice(product.totalPrice)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <!-- Preissummen -->
    <div class="totals-section">
        <table class="totals-table">
            ${customerDiscount > 0 ? `
            <tr>
                <td class="label">${this.t('listPrice', language)}:</td>
                <td class="value">${this.formatPrice(originalTotal)}</td>
            </tr>
            <tr>
                <td class="label">${this.t('customerDiscount', language)} (${customerDiscount}%):</td>
                <td class="value" style="color: #d32f2f;">-${this.formatPrice(discountAmount)}</td>
            </tr>
            ` : ''}
            <tr class="total-row">
                <td class="label"><strong>${this.t('netTotal', language)}:</strong></td>
                <td class="value"><strong>${this.formatPrice(netTotal)}</strong></td>
            </tr>
        </table>
        <div class="tax-notice" style="margin-top: 10px; font-size: 10pt; color: #666; text-align: right;">
            <em>${this.t('vatNotice', language)}</em>
        </div>
    </div>

    <!-- Versand und Lieferung -->
    <div style="margin-top: 30px; padding: 15px; border: 1px solid #ddd; background: #f9f9f9;">
        <h3 style="margin: 0 0 10px 0; font-size: 12pt; color: #333;">${this.t('shippingTitle', language)}</h3>
        <p style="margin: 0; font-size: 10pt; color: #666; line-height: 1.4;">
            ${this.t('shippingText', language)}
        </p>
    </div>

    <!-- Footer -->
    <div class="footer">
        <div class="footer-info">
            <div class="contact-info">
                <strong>${this.t('contact', language)}:</strong><br>
                ${senderName}<br>
                ${senderEmail}
            </div>
            <div class="legal-info">
                <strong>${senderCompany || senderName}</strong><br>
                <span class="small-text">${senderEmail}</span>
            </div>
        </div>
        <div class="small-text">
            ${this.t('termsNotice', language)}
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Formatiert Preise im deutschen Format
   */
  private formatPrice(price: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  }
}

// Singleton Export
export const pdfService = PDFService.getInstance();