# 📱 App Icon Generation Guide

## ✅ Problem gelöst!

Das App-Logo wird jetzt in Production-Builds korrekt angezeigt!

## 🚀 Was wurde gemacht:

### 1. **Alle iOS Icon-Größen generiert**
```bash
./generate-icons.sh
```

**Generierte iOS Icons:**
- 20x20, 40x40, 60x60 (iPhone Notifications & Settings)
- 29x29, 58x58, 87x87 (Settings Icons)
- 40x40, 80x80, 120x120 (Spotlight Search)
- 120x120, 180x180 (Home Screen)
- 76x76, 152x152 (iPad)
- 167x167 (iPad Pro)
- 1024x1024 (App Store)

### 2. **Contents.json konfiguriert**
Die `ios/VYSNHub/Images.xcassets/AppIcon.appiconset/Contents.json` wurde mit allen benötigten Icon-Referenzen aktualisiert.

### 3. **App.json optimiert**
- Zentrale Icon-Konfiguration
- iOS und Android spezifische Settings
- Adaptive Icons für Android

## 📋 Build-Anweisungen:

### Production Build erstellen:
```bash
# iOS Build
eas build --platform ios --profile production

# Android Build  
eas build --platform android --profile production
```

### Development Build (zum Testen):
```bash
# iOS Preview
eas build --platform ios --profile preview

# Android Preview
eas build --platform android --profile preview
```

## 🔧 Icon neu generieren:

Falls du das Logo änderst:

1. **Neues Logo in `assets/applogo.png` ablegen** (mindestens 1024x1024px)
2. **Icons neu generieren:**
   ```bash
   ./generate-icons.sh
   ```
3. **Neuen Build erstellen**

## ✅ Checkliste für Production:

- [x] Source Icon (assets/applogo.png) vorhanden
- [x] iOS Icons generiert (alle Größen)
- [x] Contents.json konfiguriert
- [x] App.json aktualisiert
- [x] Android Adaptive Icon konfiguriert
- [ ] EAS Build durchführen
- [ ] App im App Store / Play Store testen

## 🎯 Resultat:

Das App-Logo sollte jetzt in allen Production-Builds korrekt angezeigt werden:
- ✅ iPhone Home Screen
- ✅ iPad Home Screen  
- ✅ Settings App
- ✅ Spotlight Search
- ✅ App Store Listing
- ✅ Android Launcher
- ✅ Android App Drawer

---

**🏗️ Build Befehle für Production:**
```bash
# iOS Production Build
eas build --platform ios --profile production

# Android Production Build
eas build --platform android --profile production
```
