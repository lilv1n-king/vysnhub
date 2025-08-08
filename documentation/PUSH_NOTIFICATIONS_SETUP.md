# 🔔 Push Notifications Setup für VYSN Hub

## Überblick

Deine VYSN Hub App verwendet **Expo Notifications** für Push Notifications sowohl für iOS als auch Android. Hier ist eine komplette Anleitung zur Einrichtung.

## 📱 Was ist bereits implementiert

✅ **Native App (React Native/Expo)**
- `usePushNotifications` Hook für Token-Registrierung
- Push Notification Handling und Listeners
- Test-Komponente für Push Notifications

✅ **Backend (Node.js)**
- Push Notification Service mit Expo Server SDK
- API Endpoints für Subscribe/Unsubscribe/Send
- Template System für verschiedene Notification-Typen

## 🚀 Setup-Schritte

### 1. Expo Project ID konfigurieren

In der `app.json` oder `expo.json` deiner Native App:

```json
{
  "expo": {
    "name": "VYSN Hub",
    "slug": "vysn-hub",
    "extra": {
      "eas": {
        "projectId": "your-expo-project-id"
      }
    }
  }
}
```

**Expo Project ID bekommen:**
```bash
cd /Users/levinnormann/Desktop/vysnhub/nativeapp
npx expo login
npx expo whoami  # Prüfe ob eingeloggt
expo init --template blank-typescript  # Falls nötig
```

### 2. iOS Setup (Apple Push Notification Service - APNs)

#### A. Apple Developer Account

1. **Apple Developer Account** erforderlich ($99/Jahr)
2. **App ID** in Apple Developer Console erstellen
3. **Push Notification Capability** aktivieren

#### B. Push Certificate erstellen

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Create iOS credentials
eas credentials:configure -p ios
```

#### C. iOS Konfiguration in app.json

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.vysn.hub",
      "buildNumber": "1.0.0"
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ]
  }
}
```

### 3. Android Setup (Firebase Cloud Messaging - FCM)

#### A. Firebase Project erstellen

1. Gehe zu [Firebase Console](https://console.firebase.google.com/)
2. **Neues Projekt erstellen** oder bestehendes verwenden
3. **Android App hinzufügen**
4. Package Name: `com.vysn.hub` (oder deine gewählte)

#### B. google-services.json herunterladen

```bash
# Platziere google-services.json in:
# /Users/levinnormann/Desktop/vysnhub/nativeapp/android/app/google-services.json
```

#### C. Android Konfiguration

In `app.json`:

```json
{
  "expo": {
    "android": {
      "package": "com.vysn.hub",
      "versionCode": 1,
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

### 4. Backend Konfiguration

In deiner `.env` Datei:

```env
# Optional: Expo Access Token für erweiterte Features
EXPO_ACCESS_TOKEN=your_expo_access_token

# Push Notification Settings
PUSH_NOTIFICATION_BATCH_SIZE=100
PUSH_NOTIFICATION_RATE_LIMIT=10
```

### 5. Testing

#### A. Lokale Tests (Simulator/Emulator)

```typescript
// In deiner App verwenden:
import { usePushNotifications } from '../lib/hooks/usePushNotifications';

function TestScreen() {
  const { sendLocalNotification, expoPushToken } = usePushNotifications();
  
  return (
    <View>
      <Button onPress={sendLocalNotification} title="Test Local" />
      <Text>Token: {expoPushToken}</Text>
    </View>
  );
}
```

#### B. Remote Tests (Echte Geräte)

```bash
# Backend Test API aufrufen
curl -X POST http://your-backend-url/api/push/test \
  -H "Content-Type: application/json" \
  -d '{"token": "ExponentPushToken[your-token-here]"}'
```

## 📧 API Endpoints

### Push Token registrieren
```bash
POST /api/push/subscribe
{
  "token": "ExponentPushToken[...]",
  "deviceType": "ios|android",
  "userId": "optional-user-id"
}
```

### Notification senden
```bash
POST /api/push/send
{
  "to": "ExponentPushToken[...]",
  "title": "Titel",
  "body": "Nachricht",
  "data": {"custom": "data"}
}
```

### Template Notification
```bash
POST /api/push/send-template
{
  "template": "welcome|newProduct|orderUpdate|promotion",
  "params": {"userName": "Max"},
  "target": "broadcast|ios|android"
}
```

### Broadcast an alle
```bash
POST /api/push/send
{
  "type": "broadcast",
  "title": "Alle Benutzer",
  "body": "Wichtige Ankündigung!"
}
```

## 🎯 Notification-Typen

Das System unterstützt verschiedene Templates:

- **welcome**: Begrüßung neuer Benutzer
- **newProduct**: Neue Produkte im Katalog
- **orderUpdate**: Bestellstatus-Updates
- **promotion**: Marketing/Angebote
- **reminder**: Erinnerungen
- **projectUpdate**: Projekt-Änderungen

## 🔧 Troubleshooting

### Häufige Probleme

1. **"Push notifications not working on iOS Simulator"**
   - ✅ Normale Verhalten - iOS Simulator unterstützt keine Push Notifications
   - 🔧 Lösung: Teste auf echtem iOS Gerät

2. **"Invalid Expo Push Token"**
   - 🔧 Prüfe Expo Project ID in app.json
   - 🔧 Stelle sicher, dass expo-notifications installiert ist

3. **"DeviceNotRegistered error"**
   - 🔧 App wurde deinstalliert oder Token ist abgelaufen
   - 🔧 Service entfernt Token automatisch

4. **Android: "No FCM token"**
   - 🔧 google-services.json korrekt platziert?
   - 🔧 Firebase-Projekt korrekt konfiguriert?

### Debug Commands

```bash
# Expo Push Token prüfen
npx expo push:android:test --token YOUR_TOKEN
npx expo push:ios:test --token YOUR_TOKEN

# Backend Logs
npm run dev  # In backend directory

# App Logs
npx expo start --clear  # In nativeapp directory
```

## 📊 Monitoring

### Push Statistics abrufen
```bash
GET /api/push/stats
# Response:
{
  "total": 150,
  "ios": 80,
  "android": 70,
  "tokensWithUserId": 120
}
```

### Receipt Checking

Das System prüft automatisch Delivery Receipts und entfernt ungültige Tokens.

## 🚀 Deployment

### Development
```bash
cd nativeapp
npx expo start
```

### Production Build
```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

## 🔒 Sicherheit

- ✅ Push Tokens werden sicher gespeichert
- ✅ API Endpoints sind authentifiziert (außer subscribe/unsubscribe)
- ✅ Rate Limiting implementiert
- ✅ Automatische Token-Bereinigung bei Fehlern

## 📞 Support

Bei Problemen mit Push Notifications:

1. Prüfe Console-Logs (App + Backend)
2. Validiere Expo Push Token Format
3. Teste zuerst lokale Notifications
4. Prüfe Firebase/APNs Konfiguration

**Wichtig**: Push Notifications funktionieren nur auf echten Geräten, nicht im Simulator/Emulator!