# 🛒 Persistenter Warenkorb für VYSN Hub

## ✅ Was implementiert wurde

### 1. **Datenbank-Schema** (`database/cart_schema.sql`)
- 📦 `carts` Tabelle - Warenkörbe pro Benutzer/Session
- 📝 `cart_items` Tabelle - Artikel in Warenkörben
- 🔄 Automatische Trigger für Totals und Timestamps  
- 🛡️ Row Level Security (RLS) für Datenschutz
- ⏰ Auto-Cleanup nach 30 Tagen

### 2. **Backend Service** (`backend/src/services/cartService.ts`)
- ➕ Produkte hinzufügen/entfernen/aktualisieren
- 🔄 Session-Cart zu User-Cart Migration beim Login
- 📊 Warenkorb-Statistiken für Analytics
- 🧹 Cleanup abgelaufener Warenkörbe

### 3. **API Endpoints** (`backend/src/routes/cart.ts`)
```
GET    /api/cart              # Warenkorb laden
POST   /api/cart/add          # Produkt hinzufügen  
PUT    /api/cart/update/:id   # Menge ändern
DELETE /api/cart/remove/:id   # Produkt entfernen
DELETE /api/cart/clear        # Warenkorb leeren
POST   /api/cart/migrate      # Session → User Migration
```

### 4. **App Integration** (`nativeapp/lib/contexts/CartContext.tsx`)
- 💾 **Lokale Persistierung** mit AsyncStorage
- 🌐 **Backend-Synchronisierung** für eingeloggte User
- 👤 **Session-Support** für Gäste  
- 🔄 **Automatische Migration** beim Login
- ⚡ **Optimistic Updates** für bessere UX

## 🚀 Funktionen

### ✨ **Für Benutzer:**
- Warenkorb bleibt erhalten zwischen App-Starts
- Synchronisierung zwischen Geräten (wenn eingeloggt)  
- Gast-Warenkörbe ohne Account möglich
- Nahtlose Migration vom Gast- zum User-Account

### 🔧 **Für Entwickler:**
- Automatische Backend-Synchronisierung
- Offline-Unterstützung mit lokaler Speicherung
- Saubere API mit TypeScript-Typen
- Umfassende Fehlerbehandlung

## 📋 Setup-Schritte

### 1. Datenbank-Schema anwenden
```sql
-- In Supabase oder PostgreSQL ausführen:
\i database/cart_schema.sql
```

### 2. Backend API URL konfigurieren
```typescript
// In nativeapp/lib/contexts/CartContext.tsx
const API_BASE_URL = 'http://your-actual-backend-url/api';
```

### 3. Backend testen
```bash
cd backend
npm run dev

# Test APIs:
curl -X GET http://localhost:3001/api/cart \
  -H "X-Session-ID: test123"

curl -X POST http://localhost:3001/api/cart/add \
  -H "Content-Type: application/json" \
  -H "X-Session-ID: test123" \
  -d '{"productId": 1, "quantity": 2, "unitPrice": 29.99}'
```

## 🎯 Verwendung in der App

### Warenkorb verwenden:
```typescript
import { useCart } from '../lib/contexts/CartContext';

function ProductScreen() {
  const { addToCart, items, loading, getTotalPrice } = useCart();
  
  const handleAddToCart = async () => {
    await addToCart(product, 1);
    // Automatisch lokal gespeichert + Backend-Sync
  };
  
  return (
    <View>
      {loading && <Text>Lädt...</Text>}
      <Text>Artikel im Warenkorb: {items.length}</Text>
      <Text>Gesamt: €{getTotalPrice().toFixed(2)}</Text>
      <Button onPress={handleAddToCart} title="In Warenkorb" />
    </View>
  );
}
```

## 🔄 Datenfluss

### **Ohne Login (Gast):**
1. Artikel werden lokal in AsyncStorage gespeichert
2. Session-ID wird für Backend-Requests verwendet
3. Warenkorb bleibt lokal persistent

### **Mit Login:**
1. Session-Cart wird automatisch zu User-Cart migriert
2. Lokale Änderungen werden sofort mit Backend synchronisiert  
3. Warenkorb ist auf allen Geräten verfügbar

### **Offline/Online:**
- **Offline**: Lokale Speicherung funktioniert weiterhin
- **Online**: Automatische Backend-Synchronisierung
- **Verbindung wieder da**: Sync beim nächsten Vorgang

## 📊 Warenkorb-Features

### **Automatisch:**
- ✅ Totals (Anzahl Items, Gesamtpreis) 
- ✅ Timestamps (erstellt, aktualisiert)
- ✅ Ablaufdatum (30 Tage Standard)
- ✅ Duplikat-Schutz (gleiche Produkte werden zusammengefasst)

### **Manual:**
- 🔄 Menge ändern
- ❌ Artikel entfernen  
- 🗑️ Warenkorb leeren
- 📱 Zwischen Geräten synchronisieren

## 🛡️ Sicherheit & Datenschutz

- **Row Level Security**: Benutzer sehen nur eigene Warenkörbe
- **Session-basiert**: Gäste ohne Account unterstützt
- **Auto-Cleanup**: Alte Warenkörbe werden automatisch gelöscht
- **Validierung**: Mengen und Preise werden validiert

## 📈 Analytics & Monitoring

```typescript
// Warenkorb-Statistiken abrufen
const stats = await cartService.getCartStats(userId);
// Ergebnis: {
//   totalCarts: 150,
//   activeCarts: 45, 
//   convertedCarts: 89,
//   averageCartValue: 127.50,
//   averageItemsPerCart: 3.2
// }
```

## 🚨 Troubleshooting

### **Warenkorb wird nicht gespeichert:**
- AsyncStorage Permissions prüfen
- Backend API URL korrekt?
- Network-Verbindung vorhanden?

### **Synchronisierung funktioniert nicht:**
- Benutzer eingeloggt? (`user` vorhanden?)
- Session Token gültig?
- Backend erreichbar?

### **Doppelte Artikel:**
- Datenbank Constraints prüfen
- `UNIQUE(cart_id, product_id)` vorhanden?

## 🎉 Nächste Schritte

1. **Backend API URL** in Config setzen
2. **Datenbank-Schema** anwenden
3. **App testen** mit echten Produkten
4. **Analytics** für Warenkorb-Verhalten implementieren
5. **Push Notifications** für verlassene Warenkörbe

**Ready to go!** 🚀 Dein Warenkorb ist jetzt vollständig persistent und synchronisiert zwischen allen Geräten!