import * as nodemailer from 'nodemailer';
import { Project } from '../models/Project';
import { pdfService } from './pdfService';

// E-Mail-Übersetzungen
const emailTranslations = {
  de: {
    quoteSubject: 'Ihr Angebot für',
    hello: 'Hallo',
    quoteTitle: 'Angebot',
    thankYou: 'Vielen Dank für Ihr Interesse!',
    quoteAttached: 'Anbei finden Sie unser detailliertes Angebot für Ihr Projekt:',
    projectName: 'Projektname',
    totalAmount: 'Gesamtsumme',
    nextSteps: 'Nächste Schritte',
    questions: 'Bei Fragen können Sie mich gerne direkt kontaktieren.',
    bestRegards: 'Mit freundlichen Grüßen',
    location: 'Standort',
    listPrice: 'Listenpreis',
    customerDiscount: 'Kundendiscount',
    totalNet: 'Gesamtsumme (netto)',
    vatNotice: 'Alle Preise verstehen sich zzgl. der gesetzlichen Mehrwertsteuer',
    quoteDate: 'Angebotsdatum',
    product: 'Produkt',
    quantity: 'Menge',
    unitPriceNet: 'Einzelpreis (netto)',
    totalPriceNet: 'Gesamtpreis (netto)',
    questionsContact: 'Für Fragen oder Bestellungen antworten Sie einfach auf diese E-Mail!',
    quoteValidUntil: 'Angebot gültig 30 Tage ab Ausstellungsdatum',
    quoteNotice: 'Dies ist nur ein unverbindliches Angebot. Bei grenzüberschreitenden Geschäften (z.B. Schweiz) kann das Reverse-Charge-Verfahren angewendet werden - entsprechende steuerliche Bestimmungen kommen dann mit der Rechnung zur Anwendung.'
  },
  en: {
    quoteSubject: 'Your Quote for',
    hello: 'Hello',
    quoteTitle: 'Quote',
    thankYou: 'Thank you for your interest!',
    quoteAttached: 'Please find attached our detailed quote for your project:',
    projectName: 'Project Name',
    totalAmount: 'Total Amount',
    nextSteps: 'Next Steps',
    questions: 'If you have any questions, please feel free to contact me directly.',
    bestRegards: 'Best regards',
    location: 'Location',
    listPrice: 'List Price',
    customerDiscount: 'Customer Discount',
    totalNet: 'Total (net)',
    vatNotice: 'All prices are net prices plus VAT',
    quoteDate: 'Quote Date',
    product: 'Product',
    quantity: 'Quantity',
    unitPriceNet: 'Unit Price (net)',
    totalPriceNet: 'Total Price (net)',
    questionsContact: 'For questions or orders, simply reply to this email!',
    quoteValidUntil: 'Quote valid for 30 days from issue date',
    quoteNotice: 'This is a non-binding quote only. For cross-border transactions (e.g. Switzerland), reverse charge procedures may apply - corresponding tax regulations will then be applied with the invoice.'
  }
};

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  project: Project;
  products: Array<{
    itemNumber: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    productData?: any;
  }>;
  orderTotal: number;
  orderNotes?: string;
  orderNumber?: string;
  orderId?: string;
  language?: string;
  customerDiscount?: number;
  userProfile?: {
    standard_discount?: number;
  };
}

interface QuoteEmailData {
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customerPostalCode?: string;
  customerDiscount?: number;
  language?: string;
  message?: string;
  project: Project;
  products: Array<{
    itemNumber: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    productId?: number;
  }>;
  quoteTotal: number;
  senderName: string;
  senderEmail: string;
  senderCompany?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  private t(key: string, language: string = 'de'): string {
    return emailTranslations[language as keyof typeof emailTranslations]?.[key as keyof typeof emailTranslations.de] || 
           emailTranslations.de[key as keyof typeof emailTranslations.de] || 
           key;
  }
  private recipientEmail: string;

  constructor() {
    // Email configuration
    // Hier würde normalerweise ein deutscher Provider wie mail.de, web.de oder t-online verwendet
    // Für Tests verwenden wir Gmail, aber für Produktion sollte ein EU-Provider gewählt werden
    const emailConfig: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true für 465, false für andere Ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || '', // App-spezifisches Passwort für Gmail
      },
    };

    this.recipientEmail = process.env.ORDER_RECIPIENT_EMAIL || 'levin.normann98@gmail.com';

    this.transporter = nodemailer.createTransport(emailConfig);

    // Transporter-Verbindung testen
    this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connected successfully');
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
    }
  }

  /**
   * Sendet eine Bestell-E-Mail an das VYSN-Team
   */
  async sendOrderEmail(orderData: OrderEmailData): Promise<boolean> {
    try {
      console.log(`📧 Sending order email for project: ${orderData.project.project_name}`);

      const htmlContent = this.generateOrderEmailHTML(orderData);
      const textContent = this.generateOrderEmailText(orderData);

      const mailOptions = {
        from: {
          name: 'VYSN Hub',
          address: process.env.SMTP_USER || 'noreply@vysnhub.com'
        },
        to: this.recipientEmail,
        subject: `🛒 Neue Bestellung${orderData.orderNumber ? ` ${orderData.orderNumber}` : ''}: ${orderData.project.project_name} - ${orderData.customerName}`,
        text: textContent,
        html: htmlContent,
        replyTo: orderData.customerEmail,
        // Privacy headers
        headers: {
          'X-Privacy-Policy': 'Data used only for order processing',
          'X-Data-Retention': '30 days after order processing',
          'X-Data-Purpose': 'Order processing and customer support'
        }
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Order email sent successfully:', result.messageId);
      return true;

    } catch (error) {
      console.error('❌ Failed to send order email:', error);
      return false;
    }
  }

  /**
   * Sendet eine Bestätigungsmail an den Kunden
   */
  async sendOrderConfirmationEmail(orderData: OrderEmailData): Promise<boolean> {
    try {
      console.log(`📧 Sending order confirmation to customer: ${orderData.customerEmail}`);
      console.log(`🔍 Confirmation email data:`, {
        hasCustomerEmail: !!orderData.customerEmail,
        hasOrderNumber: !!orderData.orderNumber,
        hasProject: !!orderData.project,
        projectName: orderData.project?.project_name,
        language: orderData.language || 'de'
      });

      const htmlContent = this.generateOrderConfirmationHTML(orderData);
      const textContent = this.generateOrderConfirmationText(orderData);

      const mailOptions = {
        from: {
          name: 'VYSN Hub',
          address: process.env.SMTP_USER || 'noreply@vysnhub.com'
        },
        to: orderData.customerEmail,
        subject: `✅ ${this.tOrder('subject', orderData.language || 'de')} ${orderData.orderNumber ? orderData.orderNumber : ''} - ${orderData.project.project_name}`,
        text: textContent,
        html: htmlContent,
        // Privacy headers
        headers: {
          'X-Privacy-Policy': 'Data used only for order processing',
          'X-Data-Retention': '30 days after order processing',
          'X-Data-Purpose': 'Order confirmation and customer support'
        }
      };

      console.log(`📤 Sending confirmation email with subject: ${mailOptions.subject}`);
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Order confirmation email sent successfully:', result.messageId);
      console.log(`📬 Email sent to: ${orderData.customerEmail}`);
      return true;

    } catch (error) {
      console.error('❌ Failed to send order confirmation email:', error);
      console.error('🔍 Email error details:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Sendet ein Angebot per E-Mail an einen Kunden
   */
  async sendQuoteEmail(quoteData: QuoteEmailData): Promise<boolean> {
    let pdfBuffer: Buffer | null = null;
    
    try {
      console.log(`📧 Sending quote email to: ${quoteData.customerEmail}`);

      // PDF generieren
      console.log('📄 Generating PDF attachment...');
      console.log('🔍 PDF Data check:', {
        hasProject: !!quoteData.project,
        hasProducts: !!quoteData.products && quoteData.products.length > 0,
        productCount: quoteData.products?.length || 0,
        customerName: quoteData.customerName,
        senderName: quoteData.senderName
      });
      try {
        pdfBuffer = await pdfService.generateQuotePDF({
          customerName: quoteData.customerName,
          customerEmail: quoteData.customerEmail,
          customerCompany: quoteData.customerCompany,
          customerPhone: quoteData.customerPhone,
          customerAddress: quoteData.customerAddress,
          customerCity: quoteData.customerCity,
          customerPostalCode: quoteData.customerPostalCode,
          customerDiscount: quoteData.customerDiscount || 0,
          language: quoteData.language || 'de',
          message: quoteData.message,
          project: quoteData.project,
          products: quoteData.products,
          quoteTotal: quoteData.quoteTotal,
          senderName: quoteData.senderName,
          senderEmail: quoteData.senderEmail,
          senderCompany: quoteData.senderCompany,
          taxRate: 19
        });
        console.log('✅ PDF generated successfully, size:', pdfBuffer?.length || 0, 'bytes');
      } catch (pdfError) {
        console.error('⚠️ PDF generation failed, sending email without attachment:', pdfError);
        console.error('🔍 PDF Error stack:', pdfError instanceof Error ? pdfError.stack : String(pdfError));
        // Weiter ohne PDF - E-Mail soll trotzdem gesendet werden
      }

      const htmlContent = this.generateQuoteEmailHTML(quoteData);
      const textContent = this.generateQuoteEmailText(quoteData);

      const mailOptions: any = {
        from: {
          name: quoteData.senderName,
          address: process.env.SMTP_USER || 'mail@mupmails.de'
        },
        to: quoteData.customerEmail,
        subject: `💡 ${this.t('quoteSubject', quoteData.language)} ${quoteData.project.project_name}`,
        text: textContent,
        html: htmlContent,
        replyTo: {
          name: quoteData.senderName,
          address: quoteData.senderEmail
        },
        // Privacy headers
        headers: {
          'X-Privacy-Policy': 'Data used only for quote transmission',
          'X-Data-Retention': 'As per your request',
          'X-Data-Purpose': 'Quote transmission'
        }
      };

      // PDF als Anhang hinzufügen, wenn erfolgreich generiert
      if (pdfBuffer) {
        const filename = `Angebot_${quoteData.project.project_name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        mailOptions.attachments = [{
          filename: filename,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }];
        console.log('📎 PDF attachment added to email:', filename, 'Size:', pdfBuffer.length, 'bytes');
      } else {
        console.log('⚠️ No PDF buffer available - sending email without attachment');
      }

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Quote email sent successfully:', result.messageId);
      return true;

    } catch (error) {
      console.error('❌ Failed to send quote email:', error);
      return false;
    }
  }

  /**
   * Generiert HTML-Inhalt für das Angebot
   */
  private generateQuoteEmailHTML(quoteData: QuoteEmailData): string {
    const { customerName, customerCompany, message, project, products, quoteTotal, senderName, senderEmail, senderCompany, language = 'de', customerDiscount = 0 } = quoteData;
    
    // Preisberechnung (ohne MwSt, wie im PDF)
    const netTotal = quoteTotal;
    
    // Wenn ein Kundendiscount vorliegt, berechne den ursprünglichen Preis
    const originalTotal = customerDiscount > 0 ? netTotal / (1 - customerDiscount / 100) : netTotal;
    const discountAmount = originalTotal - netTotal;

    // Verbesserte Begrüßung
    const greeting = customerCompany && customerCompany.trim() !== '' 
      ? `${customerName}<br><strong>${customerCompany}</strong>`
      : `${this.t('hello', language)} ${customerName}`;

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${this.t('quoteTitle', language)} ${project.project_name}</title>
<style>
body{font-family:Arial,sans-serif;margin:0;padding:15px;background:#fff;color:#000}
.c{max-width:700px;margin:0 auto;background:#fff;border:2px solid #000;border-radius:10px;overflow:hidden}
.h{background:#000;color:#fff;padding:20px;text-align:center}
.h h1{margin:0;font-size:24px;font-weight:bold}
.content{padding:20px}
.greeting{font-size:16px;margin-bottom:15px;font-weight:bold}
.project{border:1px solid #000;border-radius:6px;padding:15px;margin-bottom:15px}
.pt{font-size:16px;font-weight:bold;margin-bottom:8px}
.table{width:100%;border-collapse:collapse;border:2px solid #000;border-radius:6px;overflow:hidden;margin:15px 0}
.table th,.table td{padding:10px;border:1px solid #000}
.table th{background:#000;color:#fff;font-weight:bold}
.qty{text-align:center}
.price{text-align:right;font-weight:bold}
.img{width:80px;height:80px;border:1px solid #ccc;border-radius:4px;object-fit:contain;margin-right:12px;display:block}
.pn{font-weight:bold;margin-bottom:2px}
.ps{font-size:11px;color:#666;font-family:monospace}
.pricing{border:2px solid #000;border-radius:6px;padding:15px;margin:15px 0}
.pricing-table{width:100%;border-collapse:collapse;margin:10px 0}
.pricing-table td{padding:8px 0;border-bottom:1px solid #ddd}
.pricing-table .label{font-weight:normal;text-align:left}
.pricing-table .value{font-weight:bold;text-align:right}
.pricing-table .total{font-size:20px;border-top:2px solid #000;padding-top:12px;margin-top:8px}
.msg{border:1px solid #000;border-radius:6px;padding:12px;margin:15px 0}
.info{text-align:center;margin:15px 0;padding:15px;background:#f5f5f5;border-radius:6px}
.f{border-top:2px solid #000;padding:15px;text-align:center;font-size:14px}
.pdf-note{background:#e8f4fd;border:1px solid #007acc;border-radius:6px;padding:12px;margin:15px 0;font-size:14px}
</style>
</head>
<body>
<div class="c">
<div class="h">
<div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 10px;">
<img src="https://vysn.de/wp-content/uploads/2023/11/logo-vysn.png" alt="VYSN Logo" style="height: 40px; width: auto;" />
<h1 style="margin: 0; font-size: 24px;">${this.t('quoteTitle', language)}</h1>
</div>
<div>${this.t('thankYou', language)}</div>
</div>
<div class="content">
<div class="greeting">${greeting}</div>
${message ? `<div class="msg">${message.replace(/\n/g, '<br>')}</div>` : ''}
<div class="project">
<div class="pt">${project.project_name}</div>
${project.project_location ? `<div><b>${this.t('location', language)}:</b> ${project.project_location}</div>` : ''}
<div><b>${this.t('quoteDate', language)}:</b> ${new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'de-DE')}</div>
</div>

<table class="table">
${customerDiscount > 0 ? `<tr><th>${this.t('product', language)}</th><th class="qty">${this.t('quantity', language)}</th><th class="price">${this.t('listPrice', language)}</th><th class="price">${this.t('unitPriceNet', language)}</th><th class="price">${this.t('totalPriceNet', language)}</th></tr>` : `<tr><th>${this.t('product', language)}</th><th class="qty">${this.t('quantity', language)}</th><th class="price">${this.t('unitPriceNet', language)}</th><th class="price">${this.t('totalPriceNet', language)}</th></tr>`}
${this.generateCompactProductRowsWithDiscount(products, customerDiscount || 0, language)}
</table>
<div class="pricing">
<table class="pricing-table">
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
<tr class="total">
<td class="label"><strong>${this.t('totalNet', language)}:</strong></td>
<td class="value"><strong>${this.formatPrice(netTotal)}</strong></td>
</tr>
</table>
<div style="margin-top: 10px; font-size: 12px; color: #666; text-align: right;">
<em>${this.t('vatNotice', language)}</em>
</div>
</div>
<div class="info">
<strong>${this.t('questionsContact', language)}</strong><br>
<small>${this.t('quoteValidUntil', language)}</small>
</div>
<div class="info" style="margin-top: 15px; font-size: 12px; background: #f8f9fa; border-left: 3px solid #ffc107;">
<em>${this.t('quoteNotice', language)}</em>
</div>
</div>
<div class="f">
<div><b>${senderName}</b></div>
${senderCompany ? `<div>${senderCompany}</div>` : ''}
<div>${senderEmail}</div>
<div style="font-size:11px;margin-top:10px">VYSN Hub</div>
</div>
</div>
</body>
</html>`;
  }

  /**
   * Generiert Text-Inhalt für das Angebot (Fallback)
   */
  private generateQuoteEmailText(quoteData: QuoteEmailData): string {
    const { customerName, customerCompany, message, project, products, quoteTotal, senderName, senderEmail, language = 'de', customerDiscount = 0 } = quoteData;
    
    // Preisberechnung (ohne MwSt, wie im PDF)
    const netTotal = quoteTotal;
    
    // Wenn ein Kundendiscount vorliegt, berechne den ursprünglichen Preis
    const originalTotal = customerDiscount > 0 ? netTotal / (1 - customerDiscount / 100) : netTotal;
    const discountAmount = originalTotal - netTotal;

    // Verbesserte Begrüßung
    const greeting = customerCompany && customerCompany.trim() !== '' 
      ? `${customerName}\n${customerCompany}`
      : `Hallo ${customerName}`;

    return `
💡 IHR ANGEBOT
${'='.repeat(50)}

${greeting}

${message ? `NACHRICHT:
${message}

` : ''}📋 PROJEKTINFORMATIONEN:
Projektname: ${project.project_name}
${project.project_description ? `Beschreibung: ${project.project_description}` : ''}
${project.project_location ? `Standort: ${project.project_location}` : ''}
Angebotsdatum: ${new Date().toLocaleDateString('de-DE')}

📄 VOLLSTÄNDIGES ANGEBOT IM PDF-ANHANG
Ein detailliertes PDF-Angebot mit allen Produktbildern und Spezifikationen 
ist als Anhang beigefügt.

📦 ANGEBOTENE PRODUKTE:
${'-'.repeat(60)}
${products.map(product => {
  return `${product.itemNumber} | ${product.name}
  Menge: ${product.quantity}x | Einzelpreis (netto): ${this.formatPrice(product.unitPrice)} | Total (netto): ${this.formatPrice(product.totalPrice)}`;
}).join('\n\n')}

${'-'.repeat(60)}
PREISAUFSTELLUNG:
${customerDiscount > 0 ? `Listenpreis:          ${this.formatPrice(originalTotal)}
Kundendiscount (${customerDiscount}%): -${this.formatPrice(discountAmount)}
${'-'.repeat(30)}` : ''}
GESAMTSUMME (netto):  ${this.formatPrice(netTotal)}

Alle Preise verstehen sich zzgl. der gesetzlichen Mehrwertsteuer

📧 KONTAKT:
${senderName}
${senderEmail}

${this.t('questionsContact', language)}
${this.t('quoteValidUntil', language)}

${this.t('quoteNotice', language)}

${'-'.repeat(50)}
www.vysn.de
VYSN Hub - Professionelle Beleuchtungslösungen
    `;
  }

  /**
   * Generiert HTML-Inhalt für die Bestell-E-Mail
   */
  private generateOrderEmailHTML(orderData: OrderEmailData): string {
    const { customerName, customerEmail, customerCompany, project, products, orderTotal, orderNotes } = orderData;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Neue Bestellung - ${project.project_name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #000; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #000; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
        .info-grid { display: grid; grid-template-columns: 200px 1fr; gap: 10px; margin-bottom: 20px; }
        .info-label { font-weight: bold; color: #666; }
        .product-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .product-table th, .product-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .product-table th { background-color: #f8f9fa; font-weight: bold; }
        .product-table .quantity { text-align: center; }
        .product-table .price { text-align: right; }
        .total-row { background-color: #f8f9fa; font-weight: bold; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .highlight { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛒 Neue Bestellung eingegangen</h1>
            <p>VYSN Hub - Beleuchtungslösungen</p>
        </div>
        
        <div class="content">
            ${orderData.orderNumber ? `
            <!-- Bestellinformationen -->
            <div class="section">
                <h2>📋 Bestellinformationen</h2>
                <div class="info-grid">
                    <span class="info-label">Bestellnummer:</span>
                    <span><strong>${orderData.orderNumber}</strong></span>
                    ${orderData.orderId ? `
                    <span class="info-label">Bestell-ID:</span>
                    <span><code>${orderData.orderId}</code></span>
                    ` : ''}
                    <span class="info-label">Bestelldatum:</span>
                    <span>${new Date().toLocaleString('de-DE')}</span>
                    <span class="info-label">Status:</span>
                    <span>📋 Pending</span>
                </div>
            </div>
            ` : ''}

            <!-- Kundeninformationen -->
            <div class="section">
                <h2>👤 Kundeninformationen</h2>
                <div class="info-grid">
                    <span class="info-label">Name:</span>
                    <span>${customerName}</span>
                    <span class="info-label">E-Mail:</span>
                    <span><a href="mailto:${customerEmail}">${customerEmail}</a></span>
                    ${customerCompany ? `
                    <span class="info-label">Unternehmen:</span>
                    <span>${customerCompany}</span>
                    ` : ''}
                </div>
            </div>

            <!-- Projektinformationen -->
            <div class="section">
                <h2>📋 Projektinformationen</h2>
                <div class="info-grid">
                    <span class="info-label">Projektname:</span>
                    <span><strong>${project.project_name}</strong></span>
                    <span class="info-label">Status:</span>
                    <span>${this.getStatusLabel(project.status)}</span>
                    ${project.project_location ? `
                    <span class="info-label">Standort:</span>
                    <span>${project.project_location}</span>
                    ` : ''}
                    ${project.estimated_budget ? `
                    <span class="info-label">Budget:</span>
                    <span>${this.formatPrice(project.estimated_budget)}</span>
                    ` : ''}
                    ${project.project_description ? `
                    <span class="info-label">Beschreibung:</span>
                    <span>${project.project_description}</span>
                    ` : ''}
                </div>
            </div>

            <!-- Bestellte Produkte -->
            <div class="section">
                <h2>📦 Bestellte Produkte</h2>
                <table class="product-table">
                    <thead>
                        <tr>
                            <th>Artikelnummer</th>
                            <th>Produktname</th>
                            <th class="quantity">Menge</th>
                            <th class="price">Einzelpreis</th>
                            <th class="price">Gesamtpreis</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(product => `
                        <tr>
                            <td><code>${product.itemNumber}</code></td>
                            <td>${product.name}</td>
                            <td class="quantity">${product.quantity}x</td>
                            <td class="price">${this.formatPrice(product.unitPrice)}</td>
                            <td class="price"><strong>${this.formatPrice(product.totalPrice)}</strong></td>
                        </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="4"><strong>Gesamtsumme:</strong></td>
                            <td class="price"><strong>${this.formatPrice(orderTotal)}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            ${orderNotes ? `
            <!-- Zusätzliche Notizen -->
            <div class="section">
                <h2>📝 Zusätzliche Notizen</h2>
                <div class="highlight">
                    ${orderNotes.replace(/\n/g, '<br>')}
                </div>
            </div>
            ` : ''}

            <!-- Nächste Schritte -->
            <div class="section">
                <h2>⏭️ Nächste Schritte</h2>
                <ul>
                    <li>Verfügbarkeit der Produkte prüfen</li>
                    <li>Angebot/Rechnung erstellen</li>
                    <li>Kunde kontaktieren: <a href="mailto:${customerEmail}">${customerEmail}</a></li>
                    <li>Liefertermin koordinieren</li>
                </ul>
            </div>
        </div>

        <div class="footer">
            <p>📅 Bestellung eingegangen am: ${new Date().toLocaleString('de-DE')}</p>
            <p>Diese E-Mail wurde automatisch versendet | Daten werden nur zur Bestellabwicklung verwendet</p>
            <p>VYSN Hub - Professionelle Beleuchtungslösungen</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Generiert Text-Inhalt für die Bestell-E-Mail (Fallback)
   */
  private generateOrderEmailText(orderData: OrderEmailData): string {
    const { customerName, customerEmail, customerCompany, project, products, orderTotal, orderNotes } = orderData;

    return `
🛒 NEUE BESTELLUNG - VYSN HUB
${'='.repeat(50)}

${orderData.orderNumber ? `📋 BESTELLINFORMATIONEN:
Bestellnummer: ${orderData.orderNumber}
${orderData.orderId ? `Bestell-ID: ${orderData.orderId}` : ''}
Bestelldatum: ${new Date().toLocaleString('de-DE')}
Status: Pending

` : ''}👤 KUNDENINFORMATIONEN:
Name: ${customerName}
E-Mail: ${customerEmail}
${customerCompany ? `Unternehmen: ${customerCompany}` : ''}

📋 PROJEKTINFORMATIONEN:
Projektname: ${project.project_name}
Status: ${this.getStatusLabel(project.status)}
${project.project_location ? `Standort: ${project.project_location}` : ''}
${project.estimated_budget ? `Budget: ${this.formatPrice(project.estimated_budget)}` : ''}
${project.project_description ? `Beschreibung: ${project.project_description}` : ''}

📦 BESTELLTE PRODUKTE:
${'-'.repeat(50)}
${products.map(product => 
  `${product.itemNumber} | ${product.name}
  Menge: ${product.quantity}x | Einzelpreis: ${this.formatPrice(product.unitPrice)} | Total: ${this.formatPrice(product.totalPrice)}`
).join('\n\n')}

${'-'.repeat(50)}
GESAMTSUMME: ${this.formatPrice(orderTotal)}

${orderNotes ? `
📝 ZUSÄTZLICHE NOTIZEN:
${orderNotes}
` : ''}

⏭️ NÄCHSTE SCHRITTE:
- Verfügbarkeit der Produkte prüfen
- Angebot/Rechnung erstellen  
- Kunde kontaktieren: ${customerEmail}
- Liefertermin koordinieren

📅 Bestellung eingegangen am: ${new Date().toLocaleString('de-DE')}
Daten nur zur Bestellabwicklung

VYSN Hub - Professionelle Beleuchtungslösungen
    `;
  }

  private getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'planning': '📋 Planung',
      'active': '🔄 Aktiv',
      'completed': '✅ Abgeschlossen',
      'on_hold': '⏸️ Pausiert',
      'cancelled': '❌ Abgebrochen'
    };
    return statusLabels[status] || status;
  }

  private orderConfirmationTranslations = {
    de: {
      subject: 'Bestellbestätigung',
      orderSuccessful: 'Bestellung erfolgreich!',
      thankYou: 'Vielen Dank, {{customerName}}! Ihre Bestellung wurde erfolgreich abgesendet.',
      orderInfo: 'Bestellinformationen',
      orderNumber: 'Bestellnummer',
      orderNumberTbd: 'Wird zugeteilt',
      orderId: 'Bestell-ID',
      orderDate: 'Bestelldatum',
      status: 'Status',
      statusProcessing: 'In Bearbeitung',
      project: 'Projekt',
      customer: 'Kunde',
      orderedProducts: 'Bestellte Produkte',
      article: 'Artikel',
      quantity: 'Menge',
      unitPrice: 'Einzelpreis',
      total: 'Gesamt',
      totalAmount: 'Gesamtsumme',
      priceNote: 'Alle Preise sind Nettopreise zzgl. MwSt.',
      nextSteps: 'Wie geht es weiter?',
      processing: 'Ihre Bestellung wird von unserem Team bearbeitet',
      detailedInvoice: 'Sie erhalten eine detaillierte Rechnung per E-Mail',
      questions: 'Bei Fragen können Sie uns direkt antworten',
      deliveryTime: 'Lieferzeiten werden Ihnen mit der Rechnung mitgeteilt',
      questionsReply: 'Bei Fragen antworten Sie einfach auf diese E-Mail.',
      thankYouTrust: 'Vielen Dank für Ihr Vertrauen!',
      companyName: 'VYSN Hub',
      companyTagline: 'Professionelle Beleuchtungslösungen',
      autoGenerated: 'Diese E-Mail wurde automatisch generiert.',
      dataUsage: 'Daten werden nur zur Bestellabwicklung verwendet und nach 30 Tagen gelöscht.',
      gdprCompliant: 'Daten nur zur Bestellabwicklung',
      hello: 'Hallo {{customerName}},',
      discountReceived: 'Sie haben {{discount}}% Rabatt erhalten!'
    },
    en: {
      subject: 'Order Confirmation',
      orderSuccessful: 'Order successful!',
      thankYou: 'Thank you, {{customerName}}! Your order has been successfully submitted.',
      orderInfo: 'Order Information',
      orderNumber: 'Order Number',
      orderNumberTbd: 'To be assigned',
      orderId: 'Order ID',
      orderDate: 'Order Date',
      status: 'Status',
      statusProcessing: 'Processing',
      project: 'Project',
      customer: 'Customer',
      orderedProducts: 'Ordered Products',
      article: 'Article',
      quantity: 'Quantity',
      unitPrice: 'Unit Price',
      total: 'Total',
      totalAmount: 'Total Amount',
      priceNote: 'All prices are net prices plus VAT.',
      nextSteps: 'What happens next?',
      processing: 'Your order will be processed by our team',
      detailedInvoice: 'You will receive a detailed invoice via email',
      questions: 'For questions you can reply directly',
      deliveryTime: 'Delivery times will be communicated with the invoice',
      questionsReply: 'For questions simply reply to this email.',
      thankYouTrust: 'Thank you for your trust!',
      companyName: 'VYSN Hub',
      companyTagline: 'Professional Lighting Solutions',
      autoGenerated: 'This email was automatically generated.',
      dataUsage: 'Data is only used for order processing and deleted after 30 days.',
      gdprCompliant: 'Data only for order processing',
      hello: 'Hello {{customerName}},',
      discountReceived: 'You received {{discount}}% discount!'
    }
  };

  private tOrder(key: string, language: string = 'de', replacements: { [key: string]: string } = {}): string {
    const translations = this.orderConfirmationTranslations[language as keyof typeof this.orderConfirmationTranslations] 
      || this.orderConfirmationTranslations.de;
    
    let text = translations[key as keyof typeof translations] || key;
    
    // Ersetzungen durchführen
    Object.keys(replacements).forEach(placeholder => {
      text = text.replace(new RegExp(`{{${placeholder}}}`, 'g'), replacements[placeholder]);
    });
    
    return text;
  }

  /**
   * Generiert HTML-Inhalt für Bestätigungsmail an Kunden (neuer Stil wie Quote-Mail)
   */
  private generateOrderConfirmationHTML(orderData: OrderEmailData): string {
    const { customerName, project, products, orderTotal, orderNumber, language = 'de', customerDiscount = 0, userProfile } = orderData;
    
    console.log(`🔍 Order confirmation data:`, {
      customerName,
      orderTotal,
      customerDiscount,
      userProfile,
      standard_discount: userProfile?.standard_discount,
      productsCount: products.length,
      firstProduct: products[0] ? {
        name: products[0].name,
        unitPrice: products[0].unitPrice,
        totalPrice: products[0].totalPrice,
        hasProductData: !!products[0].productData
      } : null
    });
    
    // Don't show generic project names like "Warenkorb-Bestellung"
    const showProject = project.project_name && !project.project_name.startsWith('Warenkorb-Bestellung');
    
    // Detect discount from multiple sources
    let detectedDiscount = customerDiscount;
    
    // Try to get discount from user profile if not provided
    if (detectedDiscount === 0 && userProfile?.standard_discount) {
      detectedDiscount = userProfile.standard_discount;
      console.log(`✅ Using standard_discount from user profile: ${detectedDiscount}%`);
    } else if (detectedDiscount > 0) {
      console.log(`✅ Using provided customer discount: ${detectedDiscount}%`);
    }
    
    if (detectedDiscount === 0 && products.length > 0) {
      // Try to detect discount from product data - check all products
      let totalListPrice = 0;
      let totalActualPrice = 0;
      let hasListPrices = false;
      
      products.forEach(product => {
        console.log(`🔍 Product: ${product.name}, unitPrice: ${product.unitPrice}, totalPrice: ${product.totalPrice}, productData:`, product.productData);
        
        // Check multiple possible sources for list price
        let listPrice = null;
        if (product.productData) {
          listPrice = product.productData.listPrice || 
                     product.productData.originalPrice || 
                     product.productData.list_price ||
                     product.productData.basePrice;
        }
        
        if (listPrice && listPrice > product.unitPrice) {
          totalListPrice += listPrice * product.quantity;
          totalActualPrice += product.unitPrice * product.quantity;
          hasListPrices = true;
          console.log(`📊 Product ${product.name}: List ${listPrice} → Actual ${product.unitPrice} (${Math.round((1 - product.unitPrice/listPrice) * 100)}% off)`);
        }
      });
      
      if (hasListPrices && totalListPrice > totalActualPrice) {
        detectedDiscount = Math.round((1 - (totalActualPrice / totalListPrice)) * 100);
        console.log(`🎯 Detected discount: ${detectedDiscount}% (List: ${totalListPrice}, Actual: ${totalActualPrice})`);
      } else {
        console.log(`❌ No discount detected - hasListPrices: ${hasListPrices}, totalListPrice: ${totalListPrice}, totalActualPrice: ${totalActualPrice}`);
      }
    }
    
    console.log(`📧 Order confirmation - Customer discount: ${customerDiscount}%, User profile discount: ${userProfile?.standard_discount || 'none'}, Final detected discount: ${detectedDiscount}%`);
    
    // Verbesserte Begrüßung
    const greeting = customerName && customerName.trim() !== '' 
      ? `${this.t('hello', language)} ${customerName}`
      : `${this.t('hello', language)}`;

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${this.tOrder('subject', language)} ${orderNumber || ''}</title>
<style>
body{font-family:Arial,sans-serif;margin:0;padding:15px;background:#fff;color:#000}
.c{max-width:700px;margin:0 auto;background:#fff;border:2px solid #000;border-radius:10px;overflow:hidden}
.h{background:#000;color:#fff;padding:20px;text-align:center}
.h h1{margin:0;font-size:24px;font-weight:bold}
.content{padding:20px}
.greeting{font-size:16px;margin-bottom:15px;font-weight:bold}
.confirmation{border:2px solid #22c55e;border-radius:6px;padding:15px;margin-bottom:15px;background:#f0f9ff;text-align:center}
.confirmation h2{color:#22c55e;margin:0 0 10px 0;font-size:20px}
.order-info{border:1px solid #000;border-radius:6px;padding:15px;margin-bottom:15px}
.pt{font-size:16px;font-weight:bold;margin-bottom:8px}
.table{width:100%;border-collapse:collapse;border:2px solid #000;border-radius:6px;overflow:hidden;margin:15px 0}
.table th,.table td{padding:10px;border:1px solid #000}
.table th{background:#000;color:#fff;font-weight:bold}
.qty{text-align:center}
.price{text-align:right;font-weight:bold}
.img{width:80px;height:80px;border:1px solid #ccc;border-radius:4px;object-fit:contain;margin-right:12px;display:block}
.pn{font-weight:bold;margin-bottom:2px}
.ps{font-size:11px;color:#666;font-family:monospace}
.pricing{border:2px solid #000;border-radius:6px;padding:15px;margin:15px 0}
.pricing-table{width:100%;border-collapse:collapse;margin:10px 0}
.pricing-table td{padding:8px 0;border-bottom:1px solid #ddd}
.pricing-table .label{font-weight:normal;text-align:left}
.pricing-table .value{font-weight:bold;text-align:right}
.pricing-table .total{font-size:20px;border-top:2px solid #000;padding-top:12px;margin-top:8px}
.msg{border:1px solid #000;border-radius:6px;padding:12px;margin:15px 0}
.info{text-align:center;margin:15px 0;padding:15px;background:#f5f5f5;border-radius:6px}
.f{border-top:2px solid #000;padding:15px;text-align:center;font-size:14px}
.pdf-note{background:#e8f4fd;border:1px solid #007acc;border-radius:6px;padding:12px;margin:15px 0;font-size:14px}
    </style>
</head>
<body>
<div class="c">
<div class="h">
<div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 10px;">
<img src="https://vysn.de/wp-content/uploads/2023/11/logo-vysn.png" alt="VYSN Logo" style="height: 40px; width: auto;" />
<h1 style="margin: 0; font-size: 24px;">✅ ${this.tOrder('subject', language)}</h1>
</div>
<div>${this.tOrder('thankYou', language, { customerName })}</div>
</div>
<div class="content">
<div class="greeting">${greeting}</div>

<div class="confirmation">
<h2>${this.tOrder('orderSuccessful', language)}</h2>
<p>${this.tOrder('thankYou', language, { customerName })}</p>
</div>

<div class="order-info">
<div class="pt">${this.tOrder('orderInfo', language)}</div>
<div><b>${this.tOrder('orderNumber', language)}:</b> ${orderNumber || this.tOrder('orderNumberTbd', language)}</div>
<div><b>${this.tOrder('orderDate', language)}:</b> ${new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'de-DE')}</div>
<div><b>${this.tOrder('status', language)}:</b> ${this.tOrder('statusProcessing', language)}</div>
${showProject ? `<div><b>${this.tOrder('project', language)}:</b> ${project.project_name}</div>` : ''}
</div>

        <table class="table">
            ${detectedDiscount > 0 ? `<tr><th>${this.t('product', language)}</th><th class="qty">${this.t('quantity', language)}</th><th class="price">${this.t('listPrice', language)}</th><th class="price">${this.t('unitPriceNet', language)}</th><th class="price">${this.t('totalPriceNet', language)}</th></tr>` : `<tr><th>${this.t('product', language)}</th><th class="qty">${this.t('quantity', language)}</th><th class="price">${this.t('unitPriceNet', language)}</th><th class="price">${this.t('totalPriceNet', language)}</th></tr>`}
            ${this.generateOrderConfirmationProductRowsWithDiscount(products, detectedDiscount, language)}
        </table>

        <div class="pricing">
            <table class="pricing-table">
                ${detectedDiscount > 0 ? `
                <tr>
                    <td class="label">${this.t('listPrice', language)}:</td>
                    <td class="value">${this.formatPrice(orderTotal / (1 - detectedDiscount / 100))}</td>
                </tr>
                <tr>
                    <td class="label">${this.t('customerDiscount', language)} (${detectedDiscount}%):</td>
                    <td class="value" style="color: #d32f2f;">-${this.formatPrice((orderTotal / (1 - detectedDiscount / 100)) - orderTotal)}</td>
                </tr>
                ` : ''}
                <tr class="total">
                    <td class="label"><strong>${this.tOrder('totalAmount', language)}:</strong></td>
                    <td class="value"><strong>${this.formatPrice(orderTotal)}</strong></td>
                </tr>
            </table>
            <div style="margin-top: 10px; font-size: 12px; color: #666; text-align: right;">
                <em>${this.tOrder('priceNote', language)}</em>
            </div>
        </div>

        <div class="info">
            <h4>⏭️ ${this.tOrder('nextSteps', language)}</h4>
            <ul style="text-align: left; margin: 10px 0; padding-left: 20px;">
                <li>${this.tOrder('processing', language)}</li>
                <li>${this.tOrder('detailedInvoice', language)}</li>
                <li>${this.tOrder('questions', language)}</li>
                <li>${this.tOrder('deliveryTime', language)}</li>
            </ul>
        </div>

</div>
<div class="f">
    <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 15px;">
        <img src="https://vysn.de/wp-content/uploads/2023/11/logo-vysn.png" alt="VYSN Logo" style="height: 30px; width: auto;" />
        <div><b>${this.tOrder('companyName', language)}</b></div>
    </div>
    <div>${this.tOrder('companyTagline', language)}</div>
    <div>${this.tOrder('questionsReply', language)}</div>
    <div style="font-size:11px;margin-top:10px">${this.tOrder('autoGenerated', language)}</div>
</div>
</div>
</body>
</html>
    `;
  }

  /**
   * Generiert Text-Inhalt für Bestätigungsmail an Kunden
   */
  private generateOrderConfirmationText(orderData: OrderEmailData): string {
    const { customerName, project, products, orderTotal, orderNumber, language = 'de', customerDiscount = 0, userProfile } = orderData;
    
    // Don't show generic project names like "Warenkorb-Bestellung"
    const showProject = project.project_name && !project.project_name.startsWith('Warenkorb-Bestellung');
    
    // Detect discount from multiple sources (same logic as HTML version)
    let detectedDiscount = customerDiscount;
    if (detectedDiscount === 0 && userProfile?.standard_discount) {
      detectedDiscount = userProfile.standard_discount;
    }

    return `
✅ ${this.tOrder('subject', language).toUpperCase()} - ${this.tOrder('companyName', language).toUpperCase()}
${'='.repeat(50)}

${this.tOrder('hello', language, { customerName })}

${this.tOrder('thankYou', language, { customerName })}

📋 ${this.tOrder('orderInfo', language).toUpperCase()}:
${this.tOrder('orderNumber', language)}: ${orderNumber || this.tOrder('orderNumberTbd', language)}
${this.tOrder('orderDate', language)}: ${new Date().toLocaleString(language === 'en' ? 'en-US' : 'de-DE')}
${this.tOrder('status', language)}: ${this.tOrder('statusProcessing', language)}
${showProject ? `${this.tOrder('project', language)}: ${project.project_name}` : ''}

📦 ${this.tOrder('orderedProducts', language).toUpperCase()}:
${'-'.repeat(50)}
${products.map(product => 
  `${product.itemNumber} | ${product.name}
  ${this.tOrder('quantity', language)}: ${product.quantity}x | ${this.tOrder('unitPrice', language)}: ${this.formatPrice(product.unitPrice)} | ${this.tOrder('total', language)}: ${this.formatPrice(product.totalPrice)}`
).join('\n\n')}

${'-'.repeat(50)}
${this.tOrder('totalAmount', language).toUpperCase()}: ${this.formatPrice(orderTotal)}
(${this.tOrder('priceNote', language)})

⏭️ ${this.tOrder('nextSteps', language).toUpperCase()}
- ${this.tOrder('processing', language)}
- ${this.tOrder('detailedInvoice', language)}
- ${this.tOrder('questions', language)}
- ${this.tOrder('deliveryTime', language)}

📧 ${this.tOrder('questionsReply', language)}

${this.tOrder('thankYouTrust', language)}

${this.tOrder('companyName', language)} - ${this.tOrder('companyTagline', language)}

${'='.repeat(50)}
${this.tOrder('gdprCompliant', language)}
${this.tOrder('dataUsage', language)}
    `;
  }

  /**
   * Generiert Produkt-Zeilen für Bestellbestätigung mit Bildern
   */
  private generateOrderConfirmationProductRows(products: any[], language: string = 'de'): string {
    return products.map(product => {
      let imageUrl = '';
      if (product.productData && product.productData.product_picture_1) {
        imageUrl = product.productData.product_picture_1;
      }
      
      return `<tr>
<td style="padding:15px;">
  <div style="display:flex;align-items:center;">
    ${imageUrl ? `<img src="${imageUrl}" alt="${product.name}" class="img" style="flex-shrink:0;" />` : ''}
    <div>
      <div class="pn">${product.name}</div>
      <div class="ps">${product.itemNumber}</div>
    </div>
  </div>
</td>
<td class="qty">${product.quantity}x</td>
<td class="price">${this.formatPrice(product.unitPrice)}</td>
<td class="price">${this.formatPrice(product.totalPrice)}</td>
</tr>`;
    }).join('');
  }

  /**
   * Generiert Produkt-Zeilen für Bestellbestätigung mit Bildern und Rabatt-Unterstützung
   */
  private generateOrderConfirmationProductRowsWithDiscount(products: any[], customerDiscount: number, language: string = 'de'): string {
    return products.map(product => {
      let imageUrl = '';
      if (product.productData && product.productData.product_picture_1) {
        imageUrl = product.productData.product_picture_1;
      }
      
      // If there's a customer discount, calculate original prices
      let listUnitPrice = product.unitPrice;
      let listTotalPrice = product.totalPrice;
      
      if (customerDiscount > 0) {
        // Check multiple possible sources for list price
        let originalPrice = null;
        if (product.productData) {
          originalPrice = product.productData.listPrice || 
                         product.productData.originalPrice || 
                         product.productData.list_price ||
                         product.productData.basePrice;
        }
        
        if (originalPrice) {
          listUnitPrice = originalPrice;
          listTotalPrice = originalPrice * product.quantity;
          console.log(`🏷️ Using original price from productData: ${originalPrice} for ${product.name}`);
        } else {
          // Fallback: Current prices are already discounted, so calculate original prices
          listUnitPrice = product.unitPrice / (1 - customerDiscount / 100);
          listTotalPrice = product.totalPrice / (1 - customerDiscount / 100);
          console.log(`🧮 Calculated original price: ${listUnitPrice} (from discounted ${product.unitPrice} with ${customerDiscount}% off)`);
        }
        console.log(`💰 Product: ${product.name} - List: ${listUnitPrice}, Discounted: ${product.unitPrice}, Discount: ${customerDiscount}%`);
      }
      
      if (customerDiscount > 0) {
        return `<tr>
<td style="padding:15px;">
  <div style="display:flex;align-items:center;">
    ${imageUrl ? `<img src="${imageUrl}" alt="${product.name}" class="img" style="flex-shrink:0;" />` : ''}
    <div>
      <div class="pn">${product.name}</div>
      <div class="ps">${product.itemNumber}</div>
    </div>
  </div>
</td>
<td class="qty">${product.quantity}x</td>
<td class="price" style="text-decoration: line-through; color: #999;">${this.formatPrice(listUnitPrice)}</td>
<td class="price">${this.formatPrice(product.unitPrice)}</td>
<td class="price">${this.formatPrice(product.totalPrice)}</td>
</tr>`;
      } else {
        return `<tr>
<td style="padding:15px;">
  <div style="display:flex;align-items:center;">
    ${imageUrl ? `<img src="${imageUrl}" alt="${product.name}" class="img" style="flex-shrink:0;" />` : ''}
    <div>
      <div class="pn">${product.name}</div>
      <div class="ps">${product.itemNumber}</div>
    </div>
  </div>
</td>
<td class="qty">${product.quantity}x</td>
<td class="price">${this.formatPrice(product.unitPrice)}</td>
<td class="price">${this.formatPrice(product.totalPrice)}</td>
</tr>`;
      }
    }).join('');
  }

  private formatPrice(price: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  private generateCompactProductRows(products: any[]): string {
    return products.map(product => {
      let imageUrl = '';
      if (product.productData && product.productData.product_picture_1) {
        imageUrl = product.productData.product_picture_1;
      }
      
      return `<tr>
<td style="padding:15px;">
  <div style="display:flex;align-items:center;">
    ${imageUrl ? `<img src="${imageUrl}" alt="${product.name}" class="img" style="flex-shrink:0;" />` : ''}
    <div>
      <div class="pn">${product.name}</div>
      <div class="ps">${product.itemNumber}</div>
    </div>
  </div>
</td>
<td class="qty">${product.quantity}x</td>
<td class="price">${this.formatPrice(product.unitPrice)}</td>
<td class="price">${this.formatPrice(product.totalPrice)}</td>
</tr>`;
    }).join('');
  }

  private generateCompactProductRowsWithTax(products: any[], taxRate: number): string {
    return products.map(product => {
      let imageUrl = '';
      if (product.productData && product.productData.product_picture_1) {
        imageUrl = product.productData.product_picture_1;
      }
      
      // Netto-Preise berechnen
      const netUnitPrice = product.unitPrice / (1 + taxRate / 100);
      const netTotalPrice = product.totalPrice / (1 + taxRate / 100);
      
      return `<tr>
<td style="padding:15px;">
  <div style="display:flex;align-items:center;">
    ${imageUrl ? `<img src="${imageUrl}" alt="${product.name}" class="img" style="flex-shrink:0;" />` : ''}
    <div>
      <div class="pn">${product.name}</div>
      <div class="ps">${product.itemNumber}</div>
    </div>
  </div>
</td>
<td class="qty">${product.quantity}x</td>
<td class="price">${this.formatPrice(netUnitPrice)}</td>
<td class="price">${this.formatPrice(netTotalPrice)}</td>
</tr>`;
    }).join('');
  }

  private generateCompactProductRowsWithDiscount(products: any[], customerDiscount: number, language: string = 'de'): string {
    return products.map(product => {
      let imageUrl = '';
      if (product.productData && product.productData.product_picture_1) {
        imageUrl = product.productData.product_picture_1;
      }
      
      // If there's a customer discount, calculate original prices
      let listUnitPrice = product.unitPrice;
      let listTotalPrice = product.totalPrice;
      
      if (customerDiscount > 0) {
        // Current prices are already discounted, so calculate original prices
        listUnitPrice = product.unitPrice / (1 - customerDiscount / 100);
        listTotalPrice = product.totalPrice / (1 - customerDiscount / 100);
      }
      
      if (customerDiscount > 0) {
        return `<tr>
<td style="padding:15px;">
  <div style="display:flex;align-items:center;">
    ${imageUrl ? `<img src="${imageUrl}" alt="${product.name}" class="img" style="flex-shrink:0;" />` : ''}
    <div>
      <div class="pn">${product.name}</div>
      <div class="ps">${product.itemNumber}</div>
    </div>
  </div>
</td>
<td class="qty">${product.quantity}x</td>
<td class="price" style="text-decoration: line-through; color: #999;">${this.formatPrice(listUnitPrice)}</td>
<td class="price">${this.formatPrice(product.unitPrice)}</td>
<td class="price">${this.formatPrice(product.totalPrice)}</td>
</tr>`;
      } else {
        return `<tr>
<td style="padding:15px;">
  <div style="display:flex;align-items:center;">
    ${imageUrl ? `<img src="${imageUrl}" alt="${product.name}" class="img" style="flex-shrink:0;" />` : ''}
    <div>
      <div class="pn">${product.name}</div>
      <div class="ps">${product.itemNumber}</div>
    </div>
  </div>
</td>
<td class="qty">${product.quantity}x</td>
<td class="price">${this.formatPrice(product.unitPrice)}</td>
<td class="price">${this.formatPrice(product.totalPrice)}</td>
</tr>`;
      }
    }).join('');
  }

  private generateProductRows(products: any[]): string {
    return products.map(product => {
      // Check if product has image data (from ProductService)
      let imageUrl = '';
      
      // Try to get image from productData if available
      if (product.productData && product.productData.product_picture_1) {
        imageUrl = product.productData.product_picture_1;
      }
      
      return `
      <tr class="product-row">
          <td>
              ${imageUrl ? `
              <img src="${imageUrl}" alt="${product.name}" class="product-img" />
              ` : ''}
              <div style="${imageUrl ? 'margin-left: 60px;' : ''}">
                  <div class="product-name">${product.name}</div>
                  <div class="product-sku">${product.itemNumber}</div>
              </div>
          </td>
          <td class="quantity">${product.quantity}x</td>
          <td class="price">${this.formatPrice(product.unitPrice)}</td>
          <td class="price">${this.formatPrice(product.totalPrice)}</td>
      </tr>
      `;
    }).join('');
  }

  /**
   * Sendet eine Willkommens-E-Mail mit E-Mail-Verifikation
   */
  async sendWelcomeEmail(data: {
    email: string;
    firstName: string;
    lastName?: string;
    verificationToken: string;
    verificationCode: string;
    registrationCode?: string;
  }): Promise<boolean> {
    try {
      console.log(`📧 Sending welcome email to: ${data.email} with verification code: ${data.verificationCode}`);

      const mailOptions = {
        from: {
          name: 'VYSN Hub',
          address: process.env.SMTP_USER || 'noreply@vysnhub.com'
        },
        to: data.email,
        subject: 'Willkommen bei VYSN Hub - E-Mail bestätigen',
        html: this.getWelcomeEmailTemplate(data),
        text: this.getWelcomeEmailTextTemplate(data)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent successfully to: ${data.email}`);
      
      return true;
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      return false;
    }
  }

  /**
   * Sendet eine E-Mail-Verifikation (Resend)
   */
  async sendVerificationEmail(email: string, firstName: string, verificationCode: string): Promise<boolean> {
    try {
      console.log(`📧 Sending verification email to: ${email} with code: ${verificationCode}`);

      const mailOptions = {
        from: {
          name: 'VYSN Hub',
          address: process.env.SMTP_USER || 'noreply@vysnhub.com'
        },
        to: email,
        subject: 'VYSN Hub - E-Mail-Adresse bestätigen',
        html: this.getVerificationEmailTemplate(firstName, verificationCode),
        text: `
Hallo ${firstName},

Ihr Verifikationscode lautet:

${verificationCode}

Geben Sie diesen Code in der App ein, um Ihre E-Mail-Adresse zu bestätigen.
Der Code ist 24 Stunden gültig.

VYSN GmbH
www.vysn.de
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Verification email sent successfully to: ${email}`);
      
      return true;
    } catch (error) {
      console.error('❌ Error sending verification email:', error);
      return false;
    }
  }

  /**
   * Willkommens-E-Mail HTML Template
   */
  private getWelcomeEmailTemplate(data: {
    email: string;
    firstName: string;
    lastName?: string;
    verificationCode: string;
    registrationCode?: string;
  }): string {
    return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Willkommen bei VYSN Hub</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #000000; color: #ffffff; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 40px 30px; }
        .cta-button { 
            display: inline-block; 
            background-color: #000000; 
            color: #ffffff; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            font-weight: bold; 
            margin: 20px 0; 
        }
        .features { background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { background-color: #f5f5f5; padding: 20px; text-align: center; color: #666666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>VYSN Hub</h1>
        </div>
        
        <div class="content">
            <h2>Willkommen bei VYSN Hub, ${data.firstName}!</h2>
            
            <p>Vielen Dank für Ihre Registrierung bei VYSN Hub - Ihrer professionellen Plattform für Beleuchtungslösungen.</p>
            
            ${data.registrationCode ? `
            <div style="background-color: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Ihr Registrierungscode:</strong> ${data.registrationCode}</p>
                <p>Sie wurden erfolgreich mit diesem Code registriert.</p>
            </div>
            ` : ''}
            
            <p>Um Ihr Konto zu aktivieren, geben Sie bitte den folgenden Verifikationscode in der App ein:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #000000;">
                    ${data.verificationCode}
                </div>
                <p style="margin-top: 15px; color: #666666; font-size: 14px;">
                    Dieser Code ist 24 Stunden gültig
                </p>
            </div>
            
            <div class="features">
                <h3>Ihre Vorteile mit VYSN Hub:</h3>
                <ul>
                    <li>🏢 Direkter Zugang zum kompletten VYSN Produktkatalog</li>
                    <li>📋 Persönliche Projektplanung und -verwaltung</li>
                    <li>🤖 KI-basierte Produktberatung und Lichtplanung</li>
                    <li>📧 Direkte Bestellabwicklung per E-Mail</li>
                    <li>📱 Barcode-Scanner für schnelle Produktsuche</li>
                </ul>
            </div>
            
            <p>Bei Fragen: support@vysn.de</p>
        </div>
        
        <div class="footer">
            <p><strong>VYSN GmbH</strong><br>
            <a href="https://vysn.de">www.vysn.de</a></p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Willkommens-E-Mail Text Template
   */
  private getWelcomeEmailTextTemplate(data: {
    firstName: string;
    verificationCode: string;
    registrationCode?: string;
  }): string {
    return `
Willkommen bei VYSN Hub, ${data.firstName}!

Vielen Dank für Ihre Registrierung bei VYSN Hub.

${data.registrationCode ? `Ihr Registrierungscode: ${data.registrationCode}` : ''}

Um Ihr Konto zu aktivieren, geben Sie bitte den folgenden Verifikationscode in der App ein:

${data.verificationCode}

Dieser Code ist 24 Stunden gültig.

Ihre Vorteile:
- Direkter Zugang zum VYSN Produktkatalog
- Persönliche Projektplanung
- KI-basierte Produktberatung
- Direkte Bestellabwicklung per E-Mail

Bei Fragen: support@vysn.de

VYSN GmbH
www.vysn.de
    `;
  }

  /**
   * Verifikations-E-Mail Template
   */
  private getVerificationEmailTemplate(firstName: string, verificationCode: string): string {
    return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>E-Mail bestätigen</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #000000; color: #ffffff; padding: 30px 20px; text-align: center; }
        .content { padding: 40px 30px; text-align: center; }
        .code-box {
            background-color: #f0f0f0; 
            padding: 20px; 
            border-radius: 8px; 
            font-size: 32px; 
            font-weight: bold; 
            letter-spacing: 8px; 
            color: #000000;
            margin: 20px 0;
        }
        .footer { background-color: #f5f5f5; padding: 20px; text-align: center; color: #666666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>VYSN Hub</h1>
        </div>
        
        <div class="content">
            <h2>E-Mail-Adresse bestätigen</h2>
            <p>Hallo ${firstName},</p>
            <p>Ihr Verifikationscode lautet:</p>
            
            <div class="code-box">
                ${verificationCode}
            </div>
            
            <p style="color: #666666; font-size: 14px;">
                Geben Sie diesen Code in der App ein.<br>
                Der Code ist 24 Stunden gültig.
            </p>
        </div>
        
        <div class="footer">
            <p><strong>VYSN GmbH</strong><br><a href="https://vysn.de">www.vysn.de</a></p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Test-Funktion für Email-Versand
   */
  async sendTestEmail(): Promise<boolean> {
    try {
      const testMailOptions = {
        from: {
          name: 'VYSN Hub',
          address: process.env.SMTP_USER || 'noreply@vysnhub.com'
        },
        to: this.recipientEmail,
        subject: '✅ VYSN Hub Email Service Test',
        text: 'Email service is working correctly!',
        html: `
          <h1>✅ Email Service Test</h1>
          <p>VYSN Hub Email Service ist erfolgreich konfiguriert!</p>
          <p>📅 Gesendet am: ${new Date().toLocaleString('de-DE')}</p>
        `
      };

      const result = await this.transporter.sendMail(testMailOptions);
      console.log('✅ Test email sent successfully:', result.messageId);
      return true;

    } catch (error) {
      console.error('❌ Failed to send test email:', error);
      return false;
    }
  }
}

// Singleton instance
export const emailService = new EmailService();