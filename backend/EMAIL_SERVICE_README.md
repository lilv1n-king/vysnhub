# 📧 VYSN Hub Email Service

## Überblick

Der Email-Service ist DSGVO-konform implementiert und ermöglicht den automatischen Versand von Bestell-E-Mails basierend auf Projekten.

## Features

- ✅ **DSGVO-konform**: Deutsche Datenschutz-Standards
- ✅ **Rate Limiting**: 10 E-Mails pro Stunde pro User
- ✅ **HTML + Text**: Responsive E-Mail-Templates
- ✅ **Produktdaten**: Automatische Extraktion aus Projekten
- ✅ **Preisberechnung**: Berücksichtigt Kundenrabatte
- ✅ **Authentifizierung**: Nur für angemeldete User
- ✅ **Fehlerbehandlung**: Robuste Error-Handling
- ✅ **Test-Endpoint**: Für Development/Testing

## Konfiguration

### Environment Variables (.env)

```bash
# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com              # Für Produktion: deutscher Provider
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password

# Email Recipients
ORDER_RECIPIENT_EMAIL=levin.normann98@gmail.com
```

### Gmail Setup (für Testing)

1. **App-Passwort erstellen**:
   - Google Account → Sicherheit → 2-Faktor-Authentifizierung
   - App-Passwörter → "Mail" auswählen
   - Generiertes Passwort als `SMTP_PASSWORD` verwenden

2. **Alternative für Produktion**:
   - **mail.de** (DSGVO-konform, deutscher Provider)
   - **web.de** (GMX/United Internet)
   - **t-online.de** (Deutsche Telekom)

## API Endpoints

### 1. Bestell-E-Mail senden

```http
POST /api/email/order
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "abc-123",
  "customerInfo": {
    "name": "Max Mustermann",
    "email": "max@example.com",
    "company": "Mustermann GmbH"  // optional
  },
  "orderNotes": "Lieferung bis Ende des Monats"  // optional
}
```

**Response**:
```json
{
  "success": true,
  "message": "Order email sent successfully",
  "data": {
    "projectName": "LED Beleuchtung Büro",
    "productCount": 3,
    "orderTotal": 1250.50,
    "recipient": "levin.normann98@gmail.com"
  }
}
```

### 2. Test-E-Mail senden

```http
POST /api/email/test
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "data": {
    "recipient": "levin.normann98@gmail.com"
  }
}
```

## E-Mail Template

### Inhalt der Bestell-E-Mail

- **Header**: VYSN Hub Branding
- **Kundeninformationen**: Name, E-Mail, Unternehmen
- **Projektdetails**: Name, Status, Budget, Beschreibung
- **Produktliste**: Artikelnummer, Name, Menge, Preise
- **Gesamtsumme**: Mit Kundenrabatten berechnet
- **Zusätzliche Notizen**: Optional vom Kunden
- **Nächste Schritte**: Handlungsempfehlungen
- **Footer**: DSGVO-Hinweise, Timestamp

### DSGVO-Features

- **Privacy Headers**: Datenschutz-Informationen in E-Mail-Headern
- **Datenminimierung**: Nur notwendige Daten werden versendet
- **Zweckbindung**: Explizite Zweckangabe für Datenverarbeitung
- **Speicherfristen**: 30 Tage Aufbewahrung für E-Mail-Logs

## Sicherheit

### Rate Limiting
- **10 E-Mails pro Stunde** pro authentifiziertem User
- **IP-basiertes Fallback** für nicht-authentifizierte Requests
- **Logging** für verdächtige Aktivitäten

### Authentifizierung
- **JWT-Token** erforderlich für alle Email-Endpoints
- **User-Context** für Tracking und Limits

### Validierung
- **E-Mail-Format** Validierung
- **Projekt-Existenz** Prüfung
- **Produktdaten** Extraktion und Validation

## Monitoring & Logs

```bash
# Email-Service Logs
📧 Processing order email for project: abc-123
✅ Order email sent successfully for project: LED Beleuchtung Büro
⚠️ Product not found: INVALID_ITEM_123
❌ Failed to send order email: SMTP connection failed
🚨 Email rate limit reached for user: user-456
```

## Testing

### 1. Backend starten
```bash
cd backend
npm run dev
```

### 2. Test-E-Mail senden
```bash
curl -X POST http://localhost:3001/api/email/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. Bestell-E-Mail senden
```bash
curl -X POST http://localhost:3001/api/email/order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "your-project-id",
    "customerInfo": {
      "name": "Test Kunde",
      "email": "test@example.com"
    }
  }'
```

## Troubleshooting

### Häufige Probleme

1. **SMTP Connection Failed**
   - Prüfe SMTP-Credentials in .env
   - Teste App-Passwort bei Gmail
   - Prüfe Firewall/Netzwerk-Einstellungen

2. **Email not received**
   - Prüfe Spam-Ordner
   - Validiere Empfänger-E-Mail in .env
   - Checke Provider-Limits

3. **Rate Limit erreicht**
   - Warte 1 Stunde oder reduziere Anfragen
   - Prüfe User-Authentication

4. **Product not found**
   - Validiere Projekt-Notizen Format
   - Prüfe Produkt-Database

## Produktions-Setup

### 1. Deutschen Email-Provider verwenden
```bash
# Beispiel: mail.de
SMTP_HOST=smtp.mail.de
SMTP_PORT=587
SMTP_USER=your_account@mail.de
SMTP_PASSWORD=your_password
```

### 2. SSL/TLS Konfiguration
```bash
SMTP_SECURE=true  # für Port 465
SMTP_TLS_REJECT_UNAUTHORIZED=true
```

### 3. Monitoring einrichten
- **E-Mail-Delivery** Tracking
- **Rate-Limit** Monitoring  
- **Error-Rate** Alerts
- **DSGVO-Compliance** Auditing

## Rechtliche Hinweise

- **DSGVO Art. 6**: Rechtmäßige Verarbeitung
- **Einwilligung**: Kunden-E-Mail-Adresse ist Einwilligung
- **Zweckbindung**: Nur für Bestellabwicklung
- **Löschfristen**: 30 Tage automatische Löschung
- **Auskunftsrecht**: Logs auf Anfrage verfügbar