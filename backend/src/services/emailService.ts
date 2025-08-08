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