# 🛠️ Cart Foreign-Key-Problem Fix

## 🚨 Problem
```
Error fetching cart: {
  code: 'PGRST200',
  details: "Searched for a foreign key relationship between 'cart_items' and 'products' using the hint 'cart_items_product_id_fkey' in the schema 'public', but no matches were found.",
  message: "Could not find a relationship between 'cart_items' and 'products' in the schema cache"
}
```

## ✅ Lösung

### 1. **Datenbank-Fix ausführen**
Führe diese SQL-Anweisungen in der Supabase-Datenbank aus:

```sql
-- Fix für Cart Foreign Key Problem
-- Fügt die fehlende Foreign Key Constraint zwischen cart_items und products hinzu

-- Prüfe ob die products Tabelle existiert
DO $$
BEGIN
    -- Wenn products Tabelle existiert, füge Foreign Key hinzu
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        -- Prüfe ob Foreign Key bereits existiert
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'cart_items' 
            AND kcu.column_name = 'product_id'
            AND tc.constraint_type = 'FOREIGN KEY'
        ) THEN
            -- Füge Foreign Key Constraint hinzu
            ALTER TABLE cart_items 
            ADD CONSTRAINT cart_items_product_id_fkey 
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
            
            RAISE NOTICE 'Foreign key constraint cart_items_product_id_fkey added successfully';
        ELSE
            RAISE NOTICE 'Foreign key constraint already exists';
        END IF;
    ELSE
        RAISE NOTICE 'Products table does not exist - cannot add foreign key';
    END IF;
END $$;

-- Erstelle Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id_fk ON cart_items(product_id);

-- Kommentar hinzufügen
COMMENT ON CONSTRAINT cart_items_product_id_fkey ON cart_items IS 'Foreign key to products table';
```

### 2. **Backend-Service angepasst**
Der CartService wurde angepasst um separate Queries zu verwenden statt problematischer Joins:

- ✅ **getCartWithItems()** - Separate Queries für Cart, Items und Products
- ✅ **migrateSessionCartToUser()** - Kein Join mehr auf cart_items mit products

### 3. **Auth-Token-Refresh verbessert**
- ✅ **ApiService** mit Callback für AuthContext-Synchronisation
- ✅ **AuthContext** registriert Callback für seamless Token-Updates

## 🎯 Nach dem Fix

Der Cart sollte funktionieren ohne Foreign-Key-Fehler:
```
✅ Cart lädt erfolgreich
✅ Products werden korrekt angezeigt
✅ Auth-Token wird automatisch refresht
✅ Keine lästigen 401-Fehler mehr
```

## 📁 Dateien geändert

1. **Database:**
   - `database/fix_cart_foreign_key.sql` - SQL-Fix für Foreign Key
   - `database/cart_schema.sql` - Original Schema

2. **Backend:**
   - `backend/src/services/cartService.ts` - Separate Queries statt Joins

3. **Frontend:**
   - `nativeapp/lib/services/apiService.ts` - Token-Refresh-Callback
   - `nativeapp/lib/contexts/AuthContext.tsx` - Callback-Registration

## 🚀 Status
- ✅ **Backend-Code angepasst**
- ⏳ **SQL-Script bereit zur Ausführung**
- ✅ **Auth-Token-Refresh verbessert**

**Next:** SQL-Script in Supabase ausführen und testen!