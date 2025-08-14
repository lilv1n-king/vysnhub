# 🔑 Admin User Setup - Anleitung

Das neue echte Authentifizierungssystem ist jetzt implementiert! Du musst einen Admin-User in Supabase erstellen.

## ✅ Was wurde bereits gemacht:

1. **Login-Seite aktualisiert** - Verwendet jetzt echte Supabase-Authentifizierung
2. **Frontend-Auth** - Speichert echte Supabase Access Tokens
3. **Icon-Problem behoben** - Fehlende manifest Icons erstellt

## 🔧 Admin-User Setup (Erforderlich):

### Option 1: Über Supabase Dashboard (Einfach)

1. Gehe zu deinem Supabase-Dashboard: https://supabase.com/dashboard
2. Wähle dein VYSN-Projekt aus
3. Gehe zu **Authentication** → **Users**
4. Klicke **Add user**
5. Erstelle einen User mit:
   - **Email**: `admin@vysn.com` (oder deine gewünschte Admin-Email)
   - **Password**: `levinistcool123` (oder ein sicheres Passwort)
   - **Email Confirm**: ✅ (sofort bestätigen)

### Option 2: Via SQL (Für bestehende User)

```sql
-- In Supabase SQL Editor ausführen:

-- Finde deine User-ID (ersetze mit deiner Email)
SELECT id, email FROM auth.users WHERE email = 'deine@email.com';

-- Setze is_admin = true für diesen User
UPDATE profiles 
SET is_admin = true 
WHERE id = 'USER_ID_HIER_EINFÜGEN';
```

## 🚀 Testverfahren:

1. **Backend starten**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend starten**:
   ```bash
   cd webapp
   npm run dev
   ```

3. **Login testen**:
   - Gehe zu: `http://localhost:3000/login`
   - Verwende die erstellten Admin-Credentials
   - Bei erfolgreichem Login wirst du zu `/admin` weitergeleitet

## 🔍 Troubleshooting:

### Error: "Supabase environment variables not found"
```bash
# Erstelle .env.local in webapp/
NEXT_PUBLIC_SUPABASE_URL=deine_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein_supabase_anon_key
```

### Error: "Admin-Berechtigung erforderlich"
- Prüfe, ob `is_admin = true` in der profiles-Tabelle gesetzt ist
- Führe das SQL-Update aus (siehe Option 2)

### 401 Unauthorized beim API-Aufruf
- Das sollte jetzt behoben sein, da echte Supabase-Tokens verwendet werden
- Prüfe, ob der Access Token in localStorage gespeichert wird

## 📋 Environment Setup:

### webapp/.env.local (falls nicht vorhanden):
```env
NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein_anon_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### backend/.env (prüfen):
```env
SUPABASE_URL=https://dein-projekt.supabase.co
SUPABASE_KEY=dein_anon_key
SUPABASE_SERVICE_ROLE=dein_service_role_key
```

## ✨ Nach dem Setup:

- ✅ Login mit echten Credentials funktioniert
- ✅ Admin-Dashboard zeigt echte Daten
- ✅ Backend-API-Aufrufe funktionieren (keine 401 Fehler mehr)
- ✅ Manifest-Icon-Fehler behoben

**Bitte führe das Admin-User-Setup aus und teste dann das Login!**
