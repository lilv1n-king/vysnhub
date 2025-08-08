# 🛒 Cart Display & Discount Fix

## 🚨 Probleme
1. **Artikel werden nicht richtig angezeigt** - Product-Daten fehlen/falsch gemappt
2. **Rabatt wird nicht angezeigt** - User Profile Discount nicht geladen

## ✅ Lösungen implementiert

### 1. **Cart Item Display Fix**

**Problem:** Backend returnt andere Property-Namen als Frontend erwartet
- Backend: `product.name` → Frontend: `product.vysnName`  
- Backend: `product.item_number` → Frontend: `product.itemNumberVysn`

**Fix in `CartContext.tsx`:**
```typescript
// Konvertiere Backend-Format zu Frontend-Format
const backendItems = cartResult.cart.items.map((item: any) => ({
  id: item.id,
  product: {
    id: item.product_id,
    vysnName: item.product?.name || item.product?.vysn_name || 'Unknown Product',
    itemNumberVysn: item.product?.item_number || item.product?.item_number_vysn || '',
    grossPrice: item.unit_price || item.product?.gross_price || 0,
    product_picture_1: item.product?.images?.[0] || item.product?.product_picture_1 || '',
    // ... alle VysnProduct Properties gemappt
  } as VysnProduct,
  quantity: item.quantity,
  addedAt: new Date(item.added_at),
  unitPrice: item.unit_price,
}));
```

### 2. **User Profile Discount Fix**

**Debug Logging hinzugefügt:**
- `AuthContext.tsx` - Profile Load Debugging
- `CheckoutScreen.tsx` - User Discount Debugging  
- `DiscountDebug.tsx` - Komponente für Live-Debugging

**Debug-Ausgaben:**
```
👤 Loading user profile...
👤 Profile response: { data: { discount_percentage: 30 } }
💰 CheckoutScreen Debug:
- Auth User: user@example.com
- User Profile: { discount_percentage: 30 }
- Calculated userDiscount: 30
```

### 3. **Cart Backend Sync Fix**

**Problem:** Foreign-Key-Fehler in `cartService.ts`

**Fix:** Separate Queries statt JOIN
```typescript
// Vorher: JOIN mit Foreign-Key
.select('*, cart_items(*, products(*))')

// Nachher: Separate Queries
const cart = await supabase.from('carts').select('*')
const items = await supabase.from('cart_items').select('*')
const products = await supabase.from('products').select('*')
```

## 🎯 Debug-Komponenten

### **DiscountDebug** - Zeigt Live-Status an:
- ✅ Auth initialized
- ✅ User logged in  
- ✅ Profile exists
- ✅ Discount %: 30
- ✅ Customer type: standard

### **Console Logging:**
```
🛒 Cart Item 0: {
  productId: 123,
  vysnName: "LED Strip Pro",
  itemNumber: "V115201N0B", 
  grossPrice: 49.99,
  quantity: 2,
  picture: "https://..."
}
```

## 🚀 Test-Schritte

1. **Cart Items Test:**
   - Produkt zum Cart hinzufügen
   - CheckoutScreen öffnen
   - Prüfen ob Produktname, Nummer, Preis angezeigt wird

2. **Discount Test:**
   - User mit discount_percentage > 0 einloggen
   - CheckoutScreen öffnen  
   - Prüfen ob "Rabatt (30%): -€15,00" angezeigt wird

3. **Backend Sync Test:**
   - Console auf Foreign-Key-Fehler prüfen
   - Cart sollte ohne Fehler laden

## 📁 Geänderte Dateien

- ✅ `nativeapp/lib/contexts/CartContext.tsx` - Backend-Frontend Mapping
- ✅ `nativeapp/lib/contexts/AuthContext.tsx` - Profile Loading Debug
- ✅ `nativeapp/src/screens/CheckoutScreen.tsx` - Cart Display Debug
- ✅ `nativeapp/src/components/DiscountDebug.tsx` - Debug Komponente
- ✅ `backend/src/services/cartService.ts` - Foreign-Key Fix

## ⚡ Nächste Schritte

1. App neu starten um neue Fixes zu testen
2. Debug-Komponente checken für Profile-Status
3. Cart Items auf korrekte Anzeige prüfen
4. Bei Debug-Success: Debug-Code entfernen
