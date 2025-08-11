-- =============================================
-- UPDATE EXISTING HIGHLIGHTS TABLE
-- =============================================
-- Erweitert die bestehende home_highlights Tabelle um fehlende Spalten

-- Schritt 1: Fehlende Spalten hinzufügen
ALTER TABLE home_highlights 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Schritt 2: Alle bestehenden Highlights auf aktiv setzen
UPDATE home_highlights 
SET is_active = true 
WHERE is_active IS NULL;

-- Schritt 3: Actions für bestehende Highlights konfigurieren

-- KATALOG HIGHLIGHT - Link zur VYSN Website
UPDATE home_highlights 
SET 
    action_type = 'external_link',
    action_params = '{"url": "https://www.vysnlighting.com/de/pages/katalog"}'::jsonb
WHERE 
    id = 'e9816d3f-0f73-49e9-8175-e79b0389a7a7'
    OR (title_de ILIKE '%Katalog%' AND badge_type = 'new_release');

-- NYDLE PRODUKT HIGHLIGHT - Navigation zu Produkt
UPDATE home_highlights 
SET 
    action_type = 'product',
    action_params = '{"item_number": "V109001B2B"}'::jsonb
WHERE 
    id = '4066bc37-0b9d-447c-ae2a-52383d75bb17'
    OR (title_de ILIKE '%Nydle%' AND badge_type = 'new_product');

-- Schritt 4: Weitere realistische Highlights hinzufügen

-- SKY RAIL HIGHLIGHT
INSERT INTO home_highlights (
    id,
    title_de, title_en,
    description_de, description_en,
    badge_text_de, badge_text_en,
    badge_type,
    button_text_de, button_text_en,
    image_url,
    action_type, action_params,
    is_active, sort_order,
    created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'SKY Rail Schienensystem', 'SKY Rail Track System',
    'Endlose Flexibilität bietet endlose Möglichkeiten. Entdecken Sie unser neues SKY-Rail-Sortiment.',
    'Endless flexibility offers endless possibilities. Discover our new SKY-Rail range.',
    'Neu im Sortiment', 'New in Range', 
    'new_product',
    'Mehr erfahren', 'Learn More',
    'https://www.vysnlighting.com/cdn/shop/files/sky-rail-hero.jpg',
    'internal_link',
    '{"screen": "Products", "params": {"filter": {"groupName": "Schienensysteme"}}}'::jsonb,
    true, 3,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

-- KOLLEKTIONEN HIGHLIGHT
INSERT INTO home_highlights (
    id,
    title_de, title_en,
    description_de, description_en,
    badge_text_de, badge_text_en,
    badge_type,
    button_text_de, button_text_en,
    image_url,
    action_type, action_params,
    is_active, sort_order,
    created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'VYSN Kollektionen entdecken', 'Discover VYSN Collections',
    'Entdecken Sie eine große Produktvielfalt in unseren Premium-Kollektionen.',
    'Discover a wide range of products in our premium collections.',
    'Kollektion', 'Collection', 
    'featured',
    'Kollektionen ansehen', 'View Collections',
    'https://www.vysnlighting.com/cdn/shop/files/collections-overview.jpg',
    'external_link',
    '{"url": "https://www.vysnlighting.com/collections"}'::jsonb,
    true, 4,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

-- Schritt 5: Multilingual Function erstellen (falls nicht vorhanden)
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

-- Schritt 6: Indizes hinzufügen (falls nicht vorhanden)
CREATE INDEX IF NOT EXISTS home_highlights_active_idx ON home_highlights (is_active);
CREATE INDEX IF NOT EXISTS home_highlights_action_type_idx ON home_highlights (action_type);

-- Schritt 7: RLS Policy aktualisieren
DROP POLICY IF EXISTS "Anyone can view active highlights" ON home_highlights;
CREATE POLICY "Anyone can view active highlights" ON home_highlights
    FOR SELECT 
    USING (is_active = true);

-- Schritt 8: Validierung und Output

-- Zeige alle Highlights an
SELECT 
    id,
    title_de,
    title_en,
    badge_type,
    action_type,
    action_params,
    is_active,
    sort_order
FROM home_highlights 
ORDER BY sort_order;

-- Teste Function
SELECT 
    '=== DEUTSCH ===' as language,
    title,
    action_type,
    action_params
FROM get_home_highlights('de')
LIMIT 5;

SELECT 
    '=== ENGLISH ===' as language,
    title,
    action_type,
    action_params
FROM get_home_highlights('en')
LIMIT 5;

-- Zusammenfassung
SELECT 
    action_type,
    COUNT(*) as count,
    string_agg(title_de, ', ') as highlights_de
FROM home_highlights 
WHERE is_active = true
GROUP BY action_type
ORDER BY count DESC;

-- Erfolgs-Meldung
DO $$
DECLARE
    highlight_count INTEGER;
    action_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO highlight_count FROM home_highlights WHERE is_active = true;
    SELECT COUNT(*) INTO action_count FROM home_highlights WHERE is_active = true AND action_type != 'none';
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'EXISTING HIGHLIGHTS TABLE UPDATED!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Aktive Highlights: %', highlight_count;
    RAISE NOTICE 'Mit Actions: %', action_count;
    RAISE NOTICE 'KATALOG: https://www.vysnlighting.com/de/pages/katalog';
    RAISE NOTICE 'NYDLE PRODUKT: item_number V109001B2B';
    RAISE NOTICE 'SKY RAIL: internal navigation';
    RAISE NOTICE 'KOLLEKTIONEN: https://www.vysnlighting.com/collections';
    RAISE NOTICE '============================================';
END $$;
