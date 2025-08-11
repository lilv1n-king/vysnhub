-- Fügt stock_quantity Spalte zur products Tabelle hinzu
-- Für Lager-Anzeige mit Kategorien (0-50, 50+, 100+, 200+)

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;

-- Index für bessere Performance bei Stock-Abfragen
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON products(stock_quantity);

-- Beispiel-Daten für verschiedene Stock-Level
UPDATE products SET stock_quantity = 
  CASE 
    WHEN item_number_vysn LIKE '%V115201%' THEN 150  -- 50+ Kategorie
    WHEN item_number_vysn LIKE '%V115202%' THEN 250  -- 200+ Kategorie
    WHEN item_number_vysn LIKE '%V115203%' THEN 75   -- 50+ Kategorie
    WHEN item_number_vysn LIKE '%V115204%' THEN 25   -- 0-50 Kategorie
    WHEN item_number_vysn LIKE '%V115205%' THEN 0    -- Nicht verfügbar
    WHEN item_number_vysn LIKE '%V115206%' THEN 350  -- 200+ Kategorie
    ELSE FLOOR(RANDOM() * 300)  -- Zufällige Werte für andere Produkte
  END
WHERE stock_quantity = 0 OR stock_quantity IS NULL;

-- Kommentar für die Kategorien:
-- 0: Nicht verfügbar
-- 1-50: "Wenige verfügbar"
-- 51-100: "50+ verfügbar" 
-- 101-200: "100+ verfügbar"
-- 201+: "200+ verfügbar"
