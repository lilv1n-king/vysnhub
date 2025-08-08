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