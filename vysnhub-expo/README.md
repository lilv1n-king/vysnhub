# VYSN Hub - Mobile App (Expo)

Mobile Version der VYSN Hub Beleuchtungsprodukte-App mit Supabase-Integration.

## ✅ Neue Features

### 🛍️ Produktliste (Eine Spalte)
- **Weißer Hintergrund** für alle Produktkarten
- **Horizontales Layout**: Bild links, Produktinfo rechts 
- **Zentrierte Produktbilder** ohne grauen Hintergrund
- **Navigation zur Detailseite** durch Klick auf Produkt

### 📱 Produktdetailseite (wie Web-App)
- **Vollständige Produktinformationen** mit Preisen
- **Menge auswählen** mit +/- Buttons
- **Zum Projekt hinzufügen** Button
- **Nachbestellen** Button  
- **Manual herunterladen** (öffnet Browser)
- **Energielabel anzeigen** (öffnet Browser)
- **Technische Daten** vollständig angezeigt
- **Produktbeschreibung** und Abmessungen

### 🔗 Supabase-Integration
- **Echte Produktdaten** aus der Datenbank
- **Asynchrone Datenabfrage** mit Loading-States
- **Fehlerbehandlung** und Mock-Fallback
- **Performance-optimiert** mit Caching

## 🚀 Installation & Start

```bash
# Dependencies installieren
npm install

# App starten
npx expo start

# Dann wählen:
# w - für Web
# a - für Android 
# i - für iOS
```

## ⚙️ Konfiguration

Die Supabase-Credentials sind bereits in `app.json` konfiguriert:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "https://cajkiixyxznfuieeuqqh.supabase.co",
      "supabaseAnonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

## 📱 Navigation

- **Tab Navigation** für Hauptbereiche
- **Stack Navigation** für Produktdetails
- **Automatische Navigation** von Produktliste zu Details

## 🎨 Design

- **VYSN Corporate Design** beibehalten
- **Mobile-First** Optimierung
- **Weißer Hintergrund** für bessere Lesbarkeit
- **Touch-optimierte** Buttons und Controls

## 🛠️ Technische Details

- **React Native** mit Expo
- **TypeScript** für Type Safety
- **Supabase** für Backend/Datenbank
- **Lucide Icons** für UI
- **React Navigation** für Routing