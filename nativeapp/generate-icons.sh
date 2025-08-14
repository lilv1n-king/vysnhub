#!/bin/bash

# Script zum Generieren aller App-Icons aus dem Haupt-Logo
# Basiert auf assets/applogo.png

SOURCE_ICON="assets/applogo.png"
IOS_ICON_DIR="ios/VYSNHub/Images.xcassets/AppIcon.appiconset"

echo "🚀 Generiere App-Icons aus $SOURCE_ICON..."

# Prüfe ob Source-Icon existiert
if [ ! -f "$SOURCE_ICON" ]; then
    echo "❌ Source-Icon $SOURCE_ICON nicht gefunden!"
    exit 1
fi

# iOS Icons generieren
echo "📱 Generiere iOS Icons..."

# iPhone Icons
magick "$SOURCE_ICON" -resize 20x20 "$IOS_ICON_DIR/icon-20x20.png"
magick "$SOURCE_ICON" -resize 40x40 "$IOS_ICON_DIR/icon-20x20@2x.png"
magick "$SOURCE_ICON" -resize 60x60 "$IOS_ICON_DIR/icon-20x20@3x.png"

magick "$SOURCE_ICON" -resize 29x29 "$IOS_ICON_DIR/icon-29x29.png"
magick "$SOURCE_ICON" -resize 58x58 "$IOS_ICON_DIR/icon-29x29@2x.png"
magick "$SOURCE_ICON" -resize 87x87 "$IOS_ICON_DIR/icon-29x29@3x.png"

magick "$SOURCE_ICON" -resize 40x40 "$IOS_ICON_DIR/icon-40x40.png"
magick "$SOURCE_ICON" -resize 80x80 "$IOS_ICON_DIR/icon-40x40@2x.png"
magick "$SOURCE_ICON" -resize 120x120 "$IOS_ICON_DIR/icon-40x40@3x.png"

magick "$SOURCE_ICON" -resize 120x120 "$IOS_ICON_DIR/icon-60x60@2x.png"
magick "$SOURCE_ICON" -resize 180x180 "$IOS_ICON_DIR/icon-60x60@3x.png"

# iPad Icons
magick "$SOURCE_ICON" -resize 76x76 "$IOS_ICON_DIR/icon-76x76.png"
magick "$SOURCE_ICON" -resize 152x152 "$IOS_ICON_DIR/icon-76x76@2x.png"
magick "$SOURCE_ICON" -resize 167x167 "$IOS_ICON_DIR/icon-83.5x83.5@2x.png"

# App Store Icon
magick "$SOURCE_ICON" -resize 1024x1024 "$IOS_ICON_DIR/icon-1024x1024.png"

echo "✅ iOS Icons generiert!"

# Android Icons generieren
echo "🤖 Generiere Android Icons..."

ANDROID_RES_DIR="android/app/src/main/res"

# Android App Icon Größen
magick "$SOURCE_ICON" -resize 48x48 "$ANDROID_RES_DIR/mipmap-mdpi/ic_launcher.png" 2>/dev/null || echo "📁 mdpi Ordner erstellt"
magick "$SOURCE_ICON" -resize 72x72 "$ANDROID_RES_DIR/mipmap-hdpi/ic_launcher.png" 2>/dev/null || echo "📁 hdpi Ordner erstellt"
magick "$SOURCE_ICON" -resize 96x96 "$ANDROID_RES_DIR/mipmap-xhdpi/ic_launcher.png" 2>/dev/null || echo "📁 xhdpi Ordner erstellt"
magick "$SOURCE_ICON" -resize 144x144 "$ANDROID_RES_DIR/mipmap-xxhdpi/ic_launcher.png" 2>/dev/null || echo "📁 xxhdpi Ordner erstellt"
magick "$SOURCE_ICON" -resize 192x192 "$ANDROID_RES_DIR/mipmap-xxxhdpi/ic_launcher.png" 2>/dev/null || echo "📁 xxxhdpi Ordner erstellt"

echo "✅ Android Icons generiert!"

# Expo Web Favicon
echo "🌐 Generiere Web Favicon..."
magick "$SOURCE_ICON" -resize 32x32 "assets/favicon.png"

echo "🎉 Alle Icons erfolgreich generiert!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. eas build --platform ios --profile production"
echo "2. eas build --platform android --profile production"
echo ""
echo "💡 Tipp: Prüfe die generierten Icons im iOS Xcode Projekt."
