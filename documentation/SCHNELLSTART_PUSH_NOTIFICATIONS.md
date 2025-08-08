# 🚀 Push Notifications Schnellstart

## Was du jetzt sofort testen kannst

### 1. Lokale Test-Notifications (funktioniert sofort)

Füge diese Komponente zu einem deiner Screens hinzu:

```tsx
// In z.B. SettingsScreen.tsx
import PushNotificationTest from '../components/PushNotificationTest';

// In der render function:
<PushNotificationTest />
```

**Das funktioniert sofort ohne weitere Konfiguration!**

### 2. Backend starten und API testen

```bash
# Backend starten
cd /Users/levinnormann/Desktop/vysnhub/backend
npm run dev

# Test API (in neuem Terminal)
curl -X POST http://localhost:3001/api/push/stats
```

### 3. Schneller App-Test

```bash
# App starten
cd /Users/levinnormann/Desktop/vysnhub/nativeapp
npx expo start

# Auf deinem Handy:
# - Expo Go App installieren
# - QR Code scannen
# - Zu Settings gehen
# - "Lokaler Test" drücken
```

## ⚡ 5-Minuten Setup für echte Push Notifications

### Schritt 1: Expo Project ID
```bash
cd nativeapp
npx expo login
# Falls noch kein Projekt: npx expo init
```

Die Project ID findest du auf [expo.dev](https://expo.dev) in deinem Projekt.

### Schritt 2: app.json anpassen
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "deine-expo-project-id-hier"
      }
    }
  }
}
```

### Schritt 3: Auf echtem Gerät testen
- iPhone/Android anschließen
- `npx expo run:ios` oder `npx expo run:android`
- Push Token wird automatisch generiert

### Schritt 4: Backend URL anpassen
In `usePushNotifications.ts`:
```typescript
// Zeile 100 & 135 - ersetze mit deiner Backend URL
const response = await fetch('http://deine-backend-url/api/push/subscribe', {
```

## 🎯 Push Notification senden

### Via Backend API
```bash
# Test Notification senden
curl -X POST http://localhost:3001/api/push/test \
  -H "Content-Type: application/json" \
  -d '{"token": "DEIN_EXPO_PUSH_TOKEN"}'

# Welcome Notification
curl -X POST http://localhost:3001/api/push/send-template \
  -H "Content-Type: application/json" \
  -d '{
    "template": "welcome",
    "params": {"userName": "Max Mustermann"},
    "targetToken": "DEIN_EXPO_PUSH_TOKEN"
  }'
```

### Via Code (in deiner App)
```typescript
const templates = pushNotificationService.createNotificationTemplates();

// Neue Produkte
await pushNotificationService.sendBroadcast(
  templates.newProduct("LED Streifen Pro")
);

// Bestellung Update
await pushNotificationService.sendToToken(
  userToken,
  templates.orderUpdate("Versandt")
);
```

## 📱 Für Produktions-Apps

### iOS (Apple Developer Account nötig)
```bash
npm install -g @expo/eas-cli
eas build:configure
eas credentials:configure -p ios
```

### Android (Firebase nötig)
1. [Firebase Console](https://console.firebase.google.com/) besuchen
2. Projekt erstellen
3. Android App hinzufügen
4. `google-services.json` herunterladen
5. In `nativeapp/android/app/` platzieren

## 🔔 Praktische Anwendungen

### Marketing Campaigns
```typescript
// Alle iOS Benutzer
await pushNotificationService.sendToiOS({
  title: "🍎 Nur für iOS Benutzer!",
  body: "Exklusives Angebot nur heute!",
  data: { campaign: "ios-exclusive" }
});
```

### Bestellbestätigungen
```typescript
// Nach Bestellung
await pushNotificationService.sendToToken(userToken, {
  title: "📦 Bestellung bestätigt!",
  body: `Deine Bestellung #${orderId} wurde bestätigt.`,
  data: { orderId, screen: "orders" }
});
```

### Neue Produkte
```typescript
// Produktankündigung
await pushNotificationService.sendBroadcast({
  title: "💡 Neue LED Serie verfügbar!",
  body: "Entdecke unsere neuesten energiesparenden LEDs.",
  data: { screen: "products", category: "led" }
});
```

## 🚨 Wichtige Hinweise

⚠️ **Push Notifications funktionieren nur auf echten Geräten**
⚠️ **iOS braucht Apple Developer Account ($99/Jahr)**
⚠️ **Android braucht Firebase (kostenlos)**
⚠️ **Teste zuerst mit lokalen Notifications**

## 🎉 Ready to go!

Jetzt kannst du:
1. ✅ Lokale Test-Notifications senden
2. ✅ Push Tokens von deiner App bekommen  
3. ✅ Backend APIs verwenden
4. ✅ Templates für verschiedene Szenarien nutzen

**Next Steps**: iOS/Android Setup für Produktions-App!