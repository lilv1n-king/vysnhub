import * as nodemailer from 'nodemailer';
import { Project } from '../models/Project';

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
  }>;
  orderTotal: number;
  orderNotes?: string;
  orderNumber?: string;
  orderId?: string;
}

interface QuoteEmailData {
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
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
  private recipientEmail: string;

  constructor() {
    // DSGVO-konforme Email-Konfiguration
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
        // DSGVO-konforme Header
        headers: {
          'X-Privacy-Policy': 'DSGVO-konform - Daten werden nur zur Bestellabwicklung verwendet',
          'X-Data-Retention': '30 Tage nach Bestellabwicklung',
          'X-Data-Purpose': 'Bestellabwicklung und Kundensupport'
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
   * Sendet ein Angebot per E-Mail an einen Kunden
   */
  async sendQuoteEmail(quoteData: QuoteEmailData): Promise<boolean> {
    try {
      console.log(`📧 Sending quote email to: ${quoteData.customerEmail}`);

      const htmlContent = this.generateQuoteEmailHTML(quoteData);
      const textContent = this.generateQuoteEmailText(quoteData);

      const mailOptions = {
        from: {
          name: `${quoteData.senderName} (via VYSN Hub)`,
          address: process.env.SMTP_USER || 'mail@mupmails.de'
        },
        to: quoteData.customerEmail,
        subject: `💡 Ihr Angebot für ${quoteData.project.project_name}`,
        text: textContent,
        html: htmlContent,
        replyTo: {
          name: quoteData.senderName,
          address: quoteData.senderEmail
        },
        // DSGVO-konforme Header
        headers: {
          'X-Privacy-Policy': 'DSGVO-konform - Daten werden nur zur Angebotsübermittlung verwendet',
          'X-Data-Retention': 'Nach Ihrer Anfrage',
          'X-Data-Purpose': 'Angebotsübermittlung'
        }
      };

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
    const { customerName, customerCompany, message, project, products, quoteTotal, senderName, senderEmail, senderCompany } = quoteData;

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Angebot ${project.project_name}</title>
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
.total{border:2px solid #000;border-radius:6px;padding:15px;text-align:center;margin:15px 0}
.ta{font-size:24px;font-weight:bold}
.msg{border:1px solid #000;border-radius:6px;padding:12px;margin:15px 0}
.info{text-align:center;margin:15px 0;padding:15px;background:#f5f5f5;border-radius:6px}
.f{border-top:2px solid #000;padding:15px;text-align:center;font-size:14px}
</style>
</head>
<body>
<div class="c">
<div class="h">
<h1>Ihr Angebot</h1>
<div>Professionelle Beleuchtungslösungen</div>
</div>
<div class="content">
<div class="greeting">${customerCompany ? `${customerName}<br>${customerCompany}` : `Hallo ${customerName}`}</div>
${message ? `<div class="msg">${message.replace(/\n/g, '<br>')}</div>` : ''}
<div class="project">
<div class="pt">${project.project_name}</div>
${project.project_location ? `<div><b>Standort:</b> ${project.project_location}</div>` : ''}
<div><b>Datum:</b> ${new Date().toLocaleDateString('de-DE')}</div>
</div>
<table class="table">
<tr><th>Produkt</th><th class="qty">Menge</th><th class="price">Einzelpreis</th><th class="price">Gesamtpreis</th></tr>
${this.generateCompactProductRows(products)}
</table>
<div class="total">
<div><b>GESAMTPREIS</b></div>
<div class="ta">${this.formatPrice(quoteTotal)}</div>
<div style="font-size:11px">Alle Preise zzgl. MwSt.</div>
</div>
<div class="info">
<b>Für Fragen antworten Sie einfach auf diese E-Mail</b>
</div>
</div>
<div class="f">
<div><b>${senderName}</b></div>
${senderCompany ? `<div>${senderCompany}</div>` : ''}
<div>${senderEmail}</div>
<div style="font-size:11px;margin-top:10px">DSGVO-konform | VYSN Hub</div>
</div>
</div>
</body>
</html>`;
  }

  /**
   * Generiert Text-Inhalt für das Angebot (Fallback)
   */
  private generateQuoteEmailText(quoteData: QuoteEmailData): string {
    const { customerName, customerCompany, message, project, products, quoteTotal, senderName, senderEmail } = quoteData;

    return `
💡 IHR ANGEBOT - VYSN HUB
${'='.repeat(50)}

${customerCompany ? `${customerName}\n${customerCompany}` : `Hallo ${customerName}`}

${message ? `NACHRICHT:
${message}

` : ''}📋 PROJEKTINFORMATIONEN:
Projektname: ${project.project_name}
${project.project_description ? `Beschreibung: ${project.project_description}` : ''}
${project.project_location ? `Standort: ${project.project_location}` : ''}
Angebotsdatum: ${new Date().toLocaleDateString('de-DE')}

📦 ANGEBOTENE PRODUKTE:
${'-'.repeat(60)}
${products.map(product => 
  `${product.itemNumber} | ${product.name}
  Menge: ${product.quantity}x | Einzelpreis: ${this.formatPrice(product.unitPrice)} | Total: ${this.formatPrice(product.totalPrice)}`
).join('\n\n')}

${'-'.repeat(60)}
GESAMTPREIS: ${this.formatPrice(quoteTotal)}
(Alle Preise zzgl. MwSt.)

📧 KONTAKT:
${senderName}
${senderEmail}

Für Fragen oder Bestellungen antworten Sie einfach auf diese E-Mail.

${'-'.repeat(50)}
🔒 DSGVO-konform | www.vysn.de
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
            <p>🔒 Diese E-Mail wurde DSGVO-konform versendet | Daten werden nur zur Bestellabwicklung verwendet</p>
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
🔒 DSGVO-konform | Daten nur zur Bestellabwicklung

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