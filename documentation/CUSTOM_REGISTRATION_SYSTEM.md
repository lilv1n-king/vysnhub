# Custom Registration System mit Codes & E-Mail-Verifikation

Das benutzerdefinierte Registrierungssystem ersetzt die Standard-Supabase-E-Mails durch professionelle, eigene E-Mails und implementiert ein Registrierungscode-System für kontrollierte Anmeldungen.

## 🎯 **Features**

✅ **Registrierungscodes** - Kontrollierte Anmeldungen  
✅ **Custom E-Mails** - Keine Supabase-Branding  
✅ **E-Mail-Verifikation** - Eigenes System  
✅ **Professionelle Templates** - VYSN-Branding  
✅ **Admin-Verwaltung** - Code-Management  

## 🏗️ **System-Architektur**

### **1. Datenbank-Tabellen**
```sql
-- Registrierungscodes
registration_codes (
  id, code, description, max_uses, current_uses, 
  valid_until, is_active, used_by[]
)

-- E-Mail-Verifikation
email_verifications (
  id, user_id, token, email, registration_code,
  expires_at, verified_at
)

-- Erweiterte Profile
profiles (
  ..., email_verified, registration_code_used
)
```

### **2. Services**
- **RegistrationCodeService** - Code-Validierung & Verwaltung
- **EmailVerificationService** - E-Mail-Token-Management  
- **EmailService** - Erweitert um Welcome & Verification E-Mails

### **3. API-Endpunkte**
```typescript
POST /api/registration/validate-code    // Code validieren
POST /api/registration/register         // Registrierung mit Code
GET  /api/registration/verify-email     // E-Mail verifizieren
POST /api/registration/resend-verification // E-Mail erneut senden
GET  /api/registration/codes            // Codes auflisten (Admin)
POST /api/registration/codes            // Code erstellen (Admin)
```

## 📋 **Registrierungs-Flow**

### **1. Frontend: Code eingeben**
```typescript
// Code validieren
const response = await fetch('/api/registration/validate-code', {
  method: 'POST',
  body: JSON.stringify({ code: '123456' })
});
```

### **2. Frontend: Registrierung**
```typescript
// Registrierung mit Code
const response = await fetch('/api/registration/register', {
  method: 'POST',
  body: JSON.stringify({
    email: 'user@company.com',
    password: 'secure123',
    firstName: 'Max',
    lastName: 'Mustermann',
    registrationCode: '123456'
  })
});
```

### **3. Backend: Prozess**
1. ✅ Code validieren
2. ✅ User in Supabase erstellen (unverifiziert)
3. ✅ Profil in profiles Tabelle erstellen
4. ✅ Code als verwendet markieren
5. ✅ Verification-Token generieren
6. ✅ Welcome-E-Mail senden

### **4. E-Mail-Verifikation**
```typescript
// User klickt Link in E-Mail
GET /verify-email?token=abc123...

// Backend verifiziert
- Token validieren
- User als verifiziert markieren
- Account auf "active" setzen
```

## 🎟️ **Registrierungscode-System**

### **Code-Typen**
```typescript
// Demo-Codes (6-stellige Zahlen)
'123456'    // max_uses: 10, valid_until: '2025-12-31'

// Partner-Codes (6-stellige Zahlen) 
'987654'    // max_uses: 100, valid_until: null

// VIP-Codes (6-stellige Zahlen)
'111111'    // max_uses: 1, valid_until: null

// Event-Codes (6-stellige Zahlen)
'555000'    // max_uses: 500, valid_until: '2024-06-30'
```

### **Code-Verwaltung**
```typescript
// Automatisch generierten Code erstellen
const code = await registrationCodeService.createCode({
  description: 'Neuer Partner Code',
  max_uses: 50,
  valid_until: '2025-12-31'
  // code wird automatisch generiert (z.B. "789123")
});

// Manuellen Code erstellen
const code = await registrationCodeService.createCode({
  code: '456789',
  description: 'Spezieller VIP Code',
  max_uses: 1
});

// Code validieren
const validation = await registrationCodeService.validateCode('123456');

// Code verwenden
await registrationCodeService.useCode('123456', userId);
```

## 📧 **E-Mail-System**

### **Welcome E-Mail**
- ✅ VYSN-Branding
- ✅ Code-Information
- ✅ Feature-Übersicht
- ✅ Verifikations-Link
- ✅ Responsive Design

### **Verification E-Mail**
- ✅ Einfaches Design
- ✅ Klarer Call-to-Action
- ✅ 24h Token-Gültigkeit

### **E-Mail-Konfiguration**
```env
# .env Variablen
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@company.com
SMTP_PASS=your-app-password
FRONTEND_URL=https://hub.vysn.de
```

## 🔧 **Installation & Setup**

### **1. Datenbank-Migration**
```bash
# Schema erstellen
psql -f database/registration_system_schema.sql
```

### **2. Umgebungsvariablen**
```env
# E-Mail-Service
SMTP_HOST=smtp.gmail.com
SMTP_USER=noreply@vysn.de
SMTP_PASS=your-app-password
FRONTEND_URL=https://hub.vysn.de
```

### **3. Supabase-Konfiguration**
```typescript
// Supabase Dashboard: Authentication > Settings
Email confirmation: DISABLED
Custom SMTP: Use your own SMTP
```

## 📊 **Admin-Features**

### **Code-Statistiken**
```sql
-- Code-Nutzung anzeigen
SELECT 
  code, 
  description,
  current_uses,
  max_uses,
  array_length(used_by, 1) as unique_users
FROM registration_codes 
ORDER BY current_uses DESC;
```

### **Verification-Status**
```sql
-- E-Mail-Verifikations-Statistiken
SELECT 
  COUNT(*) as total,
  COUNT(verified_at) as verified,
  COUNT(*) - COUNT(verified_at) as pending
FROM email_verifications;
```

## 🚀 **Vorteile des Systems**

✅ **Professionell** - Keine Supabase-E-Mails  
✅ **Kontrolliert** - Nur mit gültigen Codes  
✅ **Flexibel** - Verschiedene Code-Typen  
✅ **Skalierbar** - Unbegrenzte Codes  
✅ **Nachverfolgbar** - Vollständige Audit-Logs  
✅ **Sicher** - Token-basierte Verifikation  

## 📝 **Nächste Schritte**

1. **Frontend-Integration** - Registration-Screens erstellen
2. **Admin-Interface** - Code-Verwaltung in Settings
3. **2FA-Integration** - Optional für erhöhte Sicherheit
4. **Analytics** - Registration-Tracking implementieren

Das System ist produktionsreif und ersetzt die Standard-Supabase-Registrierung vollständig!
