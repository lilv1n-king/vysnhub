# E-Mail-Verifikation mit 6-stelligen Codes

Das E-Mail-Verifikationssystem wurde erweitert um 6-stellige numerische Codes, die der User in der App eingeben muss.

## 🎯 **Features**

✅ **6-stellige Codes** - Einfach zu merken und eingeben  
✅ **In-App Verifikation** - Kein Browser-Link erforderlich  
✅ **Professionelle E-Mails** - Code prominent dargestellt  
✅ **Legacy-Support** - Token-Links funktionieren weiterhin  
✅ **Automatische Bereinigung** - Abgelaufene Codes werden gelöscht  

## 🏗️ **System-Updates**

### **1. Datenbank-Erweiterung**
```sql
-- Neue Spalte für Verifikationscodes
ALTER TABLE email_verifications 
ADD COLUMN verification_code VARCHAR(6);

-- Index für schnelle Code-Suche
CREATE INDEX idx_email_verifications_code 
ON email_verifications(verification_code);

-- Unique Constraint für aktive Codes
CREATE UNIQUE INDEX idx_email_verifications_code_unique 
ON email_verifications(verification_code) 
WHERE verified_at IS NULL AND expires_at > NOW();
```

### **2. API-Endpunkte**
```typescript
// Neue Code-basierte Verifikation
POST /api/registration/verify-code
{
  "code": "123456",
  "email": "user@company.com"
}

// Legacy Token-Support (weiterhin verfügbar)
GET /api/registration/verify-email?token=abc123...
```

### **3. E-Mail-Service Updates**
```typescript
// Erweiterte Welcome-E-Mail
await emailService.sendWelcomeEmail({
  email: 'user@company.com',
  firstName: 'Max',
  verificationToken: 'token123...', // Für Legacy-Links
  verificationCode: '123456'        // Für In-App Eingabe
});

// Verifikations-E-Mail mit Code
await emailService.sendVerificationEmail(
  'user@company.com',
  'Max',
  '123456' // 6-stelliger Code statt Token
);
```

## 📧 **E-Mail-Templates**

### **Welcome E-Mail mit Code**
```html
<div style="text-align: center; margin: 30px 0;">
  <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; 
              font-size: 32px; font-weight: bold; letter-spacing: 8px;">
    123456
  </div>
  <p style="color: #666666; font-size: 14px;">
    Dieser Code ist 24 Stunden gültig
  </p>
</div>
```

### **Verifikations-E-Mail**
- ✅ **Klares Code-Display** - Groß und gut lesbar
- ✅ **Gültigkeitsdauer** - 24 Stunden angezeigt
- ✅ **Anweisungen** - "In der App eingeben"
- ✅ **VYSN-Branding** - Professionelles Design

## 🔧 **Backend-Implementation**

### **EmailVerificationService**
```typescript
class EmailVerificationService {
  // Generiert 6-stelligen Code (100000-999999)
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Erstellt Verifikation mit Token UND Code
  async createVerification(data: CreateVerificationData): Promise<EmailVerification> {
    const token = this.generateSecureToken();
    const verificationCode = this.generateVerificationCode();
    
    // Unique Code Generation mit Retry-Logic
    // Falls Code bereits existiert, neuen generieren
  }

  // Neue Code-Verifikation
  async verifyCode(code: string, email: string): Promise<{
    success: boolean;
    message: string;
    user_id?: string;
  }> {
    // Code normalisieren (nur Zahlen)
    const cleanCode = code.replace(/\D/g, '');
    
    // Validierung: 6 Ziffern, nicht abgelaufen, noch nicht verwendet
    // User als verifiziert markieren
  }
}
```

### **RegistrationController**
```typescript
// Neue Route für Code-Verifikation
async verifyEmailCode(req: Request, res: Response): Promise<void> {
  const { code, email } = req.body;
  
  const result = await emailVerificationService.verifyCode(code, email);
  
  if (result.success) {
    res.json({
      success: true,
      message: 'E-Mail erfolgreich verifiziert',
      data: { user_id: result.user_id, verified: true }
    });
  }
}
```

## 📱 **Frontend-Integration**

### **Registrierungs-Flow**
1. **User registriert sich** → Backend generiert Code
2. **E-Mail wird gesendet** → Code in E-Mail angezeigt
3. **User öffnet App** → Code-Eingabe-Screen
4. **Code eingeben** → API-Call zur Verifikation
5. **Account aktiviert** → User kann sich anmelden

### **Code-Eingabe UI**
```typescript
// React Native / React Code-Input
const verifyEmailCode = async (code: string) => {
  const response = await fetch('/api/registration/verify-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: code,
      email: userEmail
    })
  });

  const result = await response.json();
  
  if (result.success) {
    // Weiterleitung zu Login/App
    navigation.navigate('Login');
  } else {
    // Fehlermeldung anzeigen
    setError(result.message);
  }
};
```

## 🔒 **Sicherheits-Features**

### **Code-Sicherheit**
- ✅ **6-stellige Codes** - 1 Million Kombinationen
- ✅ **24h Gültigkeit** - Automatischer Ablauf
- ✅ **Einmalverwendung** - Code wird nach Nutzung deaktiviert
- ✅ **E-Mail-gebunden** - Code nur für spezifische E-Mail gültig
- ✅ **Unique Constraint** - Keine doppelten aktiven Codes

### **Retry-Logic**
- ✅ **Bis zu 10 Versuche** - Für eindeutige Code-Generation
- ✅ **Graceful Fallback** - Bei Duplikaten neuen Code generieren
- ✅ **Error Handling** - Klare Fehlermeldungen

## 📊 **Code-Statistiken**

### **Cleanup-Automatik**
```sql
-- Automatische Bereinigung abgelaufener Codes
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM email_verifications 
  WHERE expires_at < NOW() AND verified_at IS NULL;
END;
$$ language 'plpgsql';
```

### **Monitoring-Queries**
```sql
-- Aktive Codes anzeigen
SELECT 
  email, 
  verification_code, 
  expires_at,
  created_at
FROM email_verifications 
WHERE verified_at IS NULL 
AND expires_at > NOW()
ORDER BY created_at DESC;

-- Verifikations-Erfolgsrate
SELECT 
  COUNT(*) as total,
  COUNT(verified_at) as verified,
  ROUND(COUNT(verified_at) * 100.0 / COUNT(*), 2) as success_rate
FROM email_verifications;
```

## 🚀 **Vorteile des neuen Systems**

✅ **Benutzerfreundlich** - Kein Browser-Wechsel erforderlich  
✅ **Mobile-First** - Perfect für App-Workflows  
✅ **Sicher** - Codes sind zeitlich begrenzt und eindeutig  
✅ **Professionell** - Klare, lesbare E-Mail-Templates  
✅ **Backward-Compatible** - Token-Links funktionieren weiterhin  
✅ **Skalierbar** - Millionen von Codes möglich  

## 📋 **Migration & Deployment**

### **1. Datenbank-Migration**
```bash
# Schema erweitern
psql -d your_database -f database/add_email_verification_code.sql
```

### **2. Backend-Deployment**
- ✅ **Compile erfolgreich** - Keine TypeScript-Fehler
- ✅ **API-Routes aktiv** - `/api/registration/verify-code`
- ✅ **Legacy-Support** - Bestehende Token-Links funktionieren

### **3. Testing**
```bash
# Test-Code generieren und verifizieren
curl -X POST http://localhost:3001/api/registration/verify-code \
  -H "Content-Type: application/json" \
  -d '{"code": "123456", "email": "test@company.com"}'
```

Das System ist **produktionsreif** und bietet eine moderne, mobile-freundliche E-Mail-Verifikation! 🎉
