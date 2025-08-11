-- =============================================
-- COMPLETE HIGHLIGHTS TABLE REPLACEMENT
-- =============================================
-- Ersetzt die alte home_highlights Tabelle komplett durch die neue multilingual Version

-- Schritt 1: Backup der bestehenden Daten
DO $$
BEGIN
    -- Backup nur erstellen wenn Tabelle existiert
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'home_highlights') THEN
        DROP TABLE IF EXISTS home_highlights_old_backup;
        CREATE TABLE home_highlights_old_backup AS SELECT * FROM home_highlights;
        RAISE NOTICE 'Backup erstellt: home_highlights_old_backup';
    END IF;
END $$;

-- Schritt 2: Alte Tabelle und Dependencies löschen
DROP POLICY IF EXISTS "Anyone can view active highlights" ON home_highlights;
DROP TRIGGER IF EXISTS update_home_highlights_updated_at ON home_highlights;
DROP INDEX IF EXISTS home_highlights_active_idx;
DROP INDEX IF EXISTS home_highlights_sort_order_idx;
DROP INDEX IF EXISTS home_highlights_product_id_idx;
DROP INDEX IF EXISTS home_highlights_action_type_idx;
DROP FUNCTION IF EXISTS get_home_highlights(TEXT);
DROP TABLE IF EXISTS home_highlights CASCADE;

-- Schritt 3: Neue Tabelle erstellen
CREATE TABLE home_highlights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Multilingual Content (Deutsch)
    title_de TEXT NOT NULL,
    description_de TEXT,
    badge_text_de TEXT,
    button_text_de TEXT DEFAULT 'Details anzeigen',
    
    -- Multilingual Content (English)
    title_en TEXT NOT NULL,
    description_en TEXT,
    badge_text_en TEXT,
    button_text_en TEXT DEFAULT 'View Details',
    
    -- Badge Type
    badge_type TEXT CHECK (badge_type IN ('new_release', 'new_product', 'featured', 'catalog', 'event')),
    
    -- Visual Elements
    image_url TEXT,
    
    -- Navigation/Action Configuration
    action_type TEXT NOT NULL DEFAULT 'none' CHECK (action_type IN (
        'product',          -- Navigate to product detail
        'external_link',    -- Open external URL
        'internal_link',    -- Navigate to app screen
        'download',         -- Download file
        'none'              -- No action (display only)
    )),
    
    -- Action Parameters (JSON for flexibility)
    action_params JSONB DEFAULT '{}',
    
    -- Legacy Product Reference (für Rückwärtskompatibilität)
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    
    -- Visibility and Ordering
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    
    -- System Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schritt 4: Indizes erstellen
CREATE INDEX home_highlights_active_idx ON home_highlights (is_active);
CREATE INDEX home_highlights_sort_order_idx ON home_highlights (sort_order);
CREATE INDEX home_highlights_action_type_idx ON home_highlights (action_type);
CREATE INDEX home_highlights_product_id_idx ON home_highlights (product_id);

-- Schritt 5: RLS Policy
ALTER TABLE home_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active highlights" ON home_highlights
    FOR SELECT 
    USING (is_active = true);

-- Schritt 6: Update Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_home_highlights_updated_at 
    BEFORE UPDATE ON home_highlights 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Schritt 7: Multilingual Function
CREATE OR REPLACE FUNCTION get_home_highlights(lang TEXT DEFAULT 'de')
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    badge_text TEXT,
    badge_type TEXT,
    button_text TEXT,
    image_url TEXT,
    action_type TEXT,
    action_params JSONB,
    product_id INTEGER,
    sort_order INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        CASE 
            WHEN lang = 'en' THEN h.title_en 
            ELSE h.title_de 
        END as title,
        CASE 
            WHEN lang = 'en' THEN h.description_en 
            ELSE h.description_de 
        END as description,
        CASE 
            WHEN lang = 'en' THEN h.badge_text_en 
            ELSE h.badge_text_de 
        END as badge_text,
        h.badge_type,
        CASE 
            WHEN lang = 'en' THEN h.button_text_en 
            ELSE h.button_text_de 
        END as button_text,
        h.image_url,
        h.action_type,
        h.action_params,
        h.product_id,
        h.sort_order
    FROM home_highlights h
    WHERE h.is_active = true
    ORDER BY h.sort_order ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schritt 8: Beispiel-Highlights einfügen
INSERT INTO home_highlights (
    title_de, title_en,
    description_de, description_en,
    badge_text_de, badge_text_en,
    badge_type,
    button_text_de, button_text_en,
    image_url,
    action_type, action_params,
    sort_order
) VALUES

-- 1. Katalog Download
(
    'VYSN Katalog 2025', 'VYSN Catalog 2025',
    'Der neue VYSN Katalog 2025 ist da! Entdecken Sie innovative Beleuchtungslösungen für jeden Bereich.', 
    'The new VYSN Catalog 2025 is here! Discover innovative lighting solutions for every area.',
    'Neu erschienen', 'New Release',
    'new_release',
    'Jetzt herunterladen', 'Download Now',
    '/assets/VYSN_KAT.png',
    'download',
    '{"url": "https://example.com/VYSN_Katalog_2025.pdf", "filename": "VYSN_Katalog_2025.pdf"}',
    1
),

-- 2. Produkt Highlight
(
    'Nydle T - Touch Dimmbarer LED', 'Nydle T - Touch Dimmable LED',
    'Touch-Dimming, 5.4W, 2700K - Die neueste Innovation in der LED-Beleuchtung.',
    'Touch-dimming, 5.4W, 2700K - The latest innovation in LED lighting.',
    'Neu im Sortiment', 'New in Range',
    'new_product',
    'Details anzeigen', 'View Details',
    'https://vysninstructionmanuals.web.app/products/V109001B2B_1.jpg',
    'product',
    '{"item_number": "V109001B2B"}',
    2
),

-- 3. Externe Website
(
    'VYSN Website besuchen', 'Visit VYSN Website',
    'Entdecken Sie unser komplettes Sortiment online.',
    'Discover our complete range online.',
    'Website', 'Website',
    'featured',
    'Website öffnen', 'Open Website',
    '/assets/vysn_logo.png',
    'external_link',
    '{"url": "https://vysn.de"}',
    3
),

-- 4. Interne Navigation zu Produkten mit Filter
(
    'LED Produkte entdecken', 'Discover LED Products',
    'Durchstöbern Sie unsere LED-Produktkategorie.',
    'Browse our LED product category.',
    'Kategorie', 'Category',
    'featured',
    'Produkte anzeigen', 'View Products',
    '/assets/led_category.jpg',
    'internal_link',
    '{"screen": "Products", "params": {"filter": {"category1": "LED"}}}',
    4
);

-- Schritt 9: Migration der alten Daten (falls Backup vorhanden)
DO $$
DECLARE
    old_record RECORD;
BEGIN
    -- Prüfen ob Backup-Tabelle existiert und Daten hat
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'home_highlights_old_backup') THEN
        
        -- Lösche Beispiel-Daten zuerst
        DELETE FROM home_highlights;
        
        -- Migriere alte Daten
        FOR old_record IN SELECT * FROM home_highlights_old_backup LOOP
            INSERT INTO home_highlights (
                id,
                title_de, title_en,
                description_de, description_en,
                badge_text_de, badge_text_en,
                badge_type,
                button_text_de, button_text_en,
                image_url,
                action_type, action_params,
                product_id,
                is_active, sort_order,
                created_at, updated_at
            ) VALUES (
                old_record.id,
                old_record.title, old_record.title, -- Annahme: alte Daten waren deutsch
                old_record.description, old_record.description,
                old_record.badge_text, old_record.badge_text,
                old_record.badge_type,
                COALESCE(old_record.button_text, 'Details anzeigen'), 'View Details',
                old_record.image_url,
                CASE WHEN old_record.product_id IS NOT NULL THEN 'product' ELSE 'none' END,
                CASE WHEN old_record.product_id IS NOT NULL THEN 
                    jsonb_build_object('product_id', old_record.product_id)
                ELSE '{}'::jsonb END,
                old_record.product_id,
                old_record.is_active, old_record.sort_order,
                old_record.created_at, old_record.updated_at
            );
        END LOOP;
        
        RAISE NOTICE 'Alte Daten erfolgreich migriert von home_highlights_old_backup';
        
        -- Englische Übersetzungen hinzufügen
        UPDATE home_highlights 
        SET 
            title_en = CASE 
                WHEN title_de = 'VYSN Katalog 2025' THEN 'VYSN Catalog 2025'
                WHEN title_de LIKE '%Katalog%' THEN REPLACE(title_de, 'Katalog', 'Catalog')
                WHEN title_de LIKE '%Neu%' THEN REPLACE(title_de, 'Neu', 'New')
                ELSE title_de
            END,
            description_en = CASE 
                WHEN description_de LIKE '%Der neue VYSN Katalog%' THEN 
                    REPLACE(REPLACE(description_de, 'Der neue VYSN Katalog', 'The new VYSN Catalog'), 
                            'Entdecken Sie innovative Beleuchtungslösungen', 'Discover innovative lighting solutions')
                WHEN description_de LIKE '%Touch-Dimming%' THEN 
                    REPLACE(REPLACE(description_de, 'Die neueste Innovation', 'The latest innovation'),
                            'LED-Beleuchtung', 'LED lighting')
                ELSE description_de
            END,
            badge_text_en = CASE 
                WHEN badge_text_de = 'Neu erschienen' THEN 'New Release'
                WHEN badge_text_de = 'Neu im Sortiment' THEN 'New in Range'
                WHEN badge_text_de = 'Kategorie' THEN 'Category'
                WHEN badge_text_de = 'Website' THEN 'Website'
                ELSE badge_text_de
            END,
            button_text_en = CASE 
                WHEN button_text_de = 'Jetzt herunterladen' THEN 'Download Now'
                WHEN button_text_de = 'Details anzeigen' THEN 'View Details'
                WHEN button_text_de = 'Website öffnen' THEN 'Open Website'
                WHEN button_text_de = 'Produkte anzeigen' THEN 'View Products'
                ELSE 'View Details'
            END
        WHERE title_en = title_de OR description_en = description_de;
        
    ELSE
        RAISE NOTICE 'Keine alten Daten gefunden - Beispiel-Highlights bleiben aktiv';
    END IF;
END $$;

-- Schritt 10: Cleanup - Backup-Tabelle löschen
DROP TABLE IF EXISTS home_highlights_old_backup;

-- Schritt 11: Abschlussmeldung
DO $$
DECLARE
    highlight_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO highlight_count FROM home_highlights WHERE is_active = true;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'HIGHLIGHTS TABLE REPLACEMENT COMPLETED!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Neue Tabelle erstellt: home_highlights';
    RAISE NOTICE 'Aktive Highlights: %', highlight_count;
    RAISE NOTICE 'Multilingual support: DE/EN';
    RAISE NOTICE 'Action types: product, external_link, internal_link, download, none';
    RAISE NOTICE 'Function available: get_home_highlights(lang)';
    RAISE NOTICE 'Alte Tabelle wurde komplett ersetzt';
    RAISE NOTICE '============================================';
END $$;
