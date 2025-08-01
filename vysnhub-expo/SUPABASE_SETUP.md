# 🚀 VYSN Hub Supabase Setup

## Testnutzer ist bereits konfiguriert:
- **Email**: `levin.normann98@gmail.com`
- **Password**: `test6969€€`

## ⚡ Schnell-Setup für Supabase

### 1. Supabase Projekt erstellen
1. Gehe zu [supabase.com](https://supabase.com)
2. Erstelle neues Projekt
3. Notiere dir **URL** und **Anon Key**

### 2. Database Schema ausführen
1. Öffne **SQL Editor** in Supabase Dashboard
2. Kopiere Inhalt von `supabase_auth_schema_fixed.sql`
3. Führe Schema aus

### 3. Credentials in App eintragen
Bearbeite `vysnhub-expo/lib/utils/supabase.ts`:

```typescript
// Ersetze diese Zeilen:
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';

// Mit deinen echten Credentials:
const SUPABASE_URL = 'https://DEIN-PROJECT-REF.supabase.co';
const SUPABASE_ANON_KEY = 'DEIN-ANON-KEY';
```

### 4. Testnutzer in Supabase erstellen
1. Gehe zu **Authentication** > **Users** in Supabase
2. Klicke **"Add user"**
3. Email: `levin.normann98@gmail.com`
4. Password: `test6969€€`
5. **Auto Confirm User**: ✅ Aktivieren

### 5. App testen
1. Starte App: `npm start`
2. Login Screen sollte erscheinen
3. Credentials sind bereits ausgefüllt
4. Klicke **"Sign In"**

## 🎯 Was dann funktioniert:

### ✅ Authentication
- Login/Logout
- Registrierung neuer User
- Passwort Reset

### ✅ Multi-Tenant Features
- User Profiles mit Rabatt-System
- Settings Screen mit editierbaren Feldern
- Sichere Datenaufteilung per User

### ⏳ Bereit für Implementierung
- User-spezifische Projekte
- Event-Registrierung
- Bestellsystem

## 🔧 Troubleshooting

### App crashed beim Start?
- Prüfe ob Supabase URL/Key korrekt sind
- Prüfe ob Database Schema ausgeführt wurde

### Login funktioniert nicht?
- Prüfe ob Testnutzer in Supabase existiert
- Prüfe Console für Fehlermeldungen

### Mock-Modus aktivieren
Falls Supabase nicht verfügbar, läuft die App im Mock-Modus mit Dummy-Daten.

## 🚨 Wichtig
- **JWT Secret** wird automatisch von Supabase verwaltet
- **Row Level Security** ist aktiviert für Multi-Tenant Isolation
- **Auto-Kundennummern** werden generiert (CUST000001, etc.)