# Admin Dashboard Setup Guide

Das Admin-Dashboard ist jetzt vollständig mit echter Supabase-Authentifikation implementiert.

## 🔧 Setup-Schritte

### 1. Datenbank Schema anwenden
```sql
-- In Supabase SQL Editor ausführen:
-- File: database/add_admin_fields.sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS standard_discount DECIMAL(5,2) DEFAULT 0.00;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'pending' 
CHECK (account_status IN ('pending', 'approved', 'rejected', 'suspended'));

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;
```

### 2. Admin-User erstellen
```sql
-- Erstelle einen Admin-User (ersetze 'IHRE_USER_ID' mit echter Supabase User ID)
UPDATE profiles SET is_admin = true WHERE id = 'IHRE_USER_ID';

-- Oder erstelle einen neuen Admin-User via Supabase Dashboard -> Authentication
-- Dann führe das Update mit der neuen User-ID aus
```

### 3. Environment Variables setzen
```bash
# In webapp/.env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# In backend/.env
SUPABASE_URL=ihre_supabase_url
SUPABASE_KEY=ihr_supabase_anon_key  
SUPABASE_SERVICE_ROLE=ihr_service_role_key
```

### 4. Backend starten
```bash
cd backend
npm install
npm run dev
```

### 5. Frontend starten
```bash
cd webapp
npm install
npm run dev
```

## 🔑 Login-Prozess

1. **Login-Seite aufrufen:** `http://localhost:3000/login`
2. **Passwort eingeben:** `levinistcool123`
3. **System authentifiziert über:** Backend → Supabase Auth
4. **Admin-Dashboard aufrufen:** `http://localhost:3000/admin`

## 📊 Features

### Dashboard (`/admin`)
- ✅ Benutzer-Statistiken
- ✅ Account-Status Übersicht
- ✅ Registration Codes Statistiken

### User Management (`/admin/users`)
- ✅ Alle Benutzer anzeigen
- ✅ Account-Status ändern (Pending/Approved/Rejected/Suspended)
- ✅ Standard-Rabatte verwalten
- ✅ Benutzer-Suche und Filterung
- ✅ Admin-Notizen

### Home Content Management (`/admin/home-content`)
- ✅ Multilingual Highlights bearbeiten (DE/EN)
- ✅ CRUD-Operationen (Create/Read/Update/Delete)
- ✅ Live-Vorschau der Änderungen
- ✅ Image-URLs konfigurieren
- ✅ Action-Types verwalten
- ✅ Highlights aktivieren/deaktivieren

## 🔐 Sicherheit

- **Echte Supabase Auth:** Keine hardcoded Tokens
- **JWT-basierte Authentifikation:** Via Backend AuthService
- **Admin-Role-Checking:** Database-basierte Berechtigungsprüfung
- **RLS Policies:** Row Level Security in Supabase
- **API-Validierung:** Vollständige Request-Validierung

## 🛠 API-Endpunkte

### Admin Management
- `GET /api/admin/dashboard/stats` - Dashboard-Statistiken
- `GET /api/admin/users` - Alle Benutzer  
- `PUT /api/admin/users/:id/status` - Account-Status ändern
- `PUT /api/admin/users/:id/discount` - Rabatt aktualisieren

### Home Content Management
- `GET /api/home-content/admin/highlights` - Alle Highlights
- `POST /api/home-content/admin/highlights` - Highlight erstellen
- `PUT /api/home-content/admin/highlights/:id` - Highlight bearbeiten
- `DELETE /api/home-content/admin/highlights/:id` - Highlight löschen
- `PUT /api/home-content/admin/highlights/:id/toggle` - Aktivierung umschalten

## 🚨 Fehlerbehebung

### "Authentication required"
- Überprüfen Sie, ob der Backend läuft (`http://localhost:3001`)
- Prüfen Sie die Environment Variables
- Kontrollieren Sie die Supabase-Konfiguration

### "Admin access required"
- Stellen Sie sicher, dass `is_admin = true` für Ihren User gesetzt ist
- Überprüfen Sie die User-ID in der Datenbank

### API-Fehler
- Backend-Logs prüfen: `cd backend && npm run dev`
- Network-Tab im Browser Developer Tools überprüfen
- Supabase Dashboard → Authentication → Users überprüfen

## 📝 Entwicklung

Das System ist vollständig funktionsfähig und verwendet:
- **Next.js 15** für Frontend
- **Express.js** für Backend API
- **Supabase** für Authentifikation & Datenbank
- **TypeScript** für Typsicherheit
- **Tailwind CSS** für Styling