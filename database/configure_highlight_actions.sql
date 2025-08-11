-- =============================================
-- CONFIGURE HIGHLIGHT ACTIONS
-- =============================================
-- Konfiguriert Actions für bestehende Highlights

-- Prüfen ob Tabelle das neue Schema hat
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'home_highlights' 
        AND column_name = 'action_type'
    ) THEN
        RAISE EXCEPTION 'Tabelle home_highlights hat noch nicht das neue Schema! Bitte zuerst replace_highlights_table.sql ausführen.';
    END IF;
END $$;

-- 1. KATALOG HIGHLIGHT - Link zur VYSN Website
UPDATE home_highlights 
SET 
    action_type = 'external_link',
    action_params = jsonb_build_object(
        'url', 'https://www.vysnlighting.com/de/pages/katalog'
    )
WHERE 
    (title_de ILIKE '%Katalog%' OR title_en ILIKE '%Catalog%')
    AND badge_type = 'new_release';

-- 2. PRODUKT HIGHLIGHT - Navigation zu spezifischem Produkt
-- Beispiel: Nydle T LED Produkt
UPDATE home_highlights 
SET 
    action_type = 'product',
    action_params = jsonb_build_object(
        'item_number', 'V109001B2B'
    ),
    product_id = (
        SELECT id FROM products 
        WHERE item_number_vysn = 'V109001B2B' 
        LIMIT 1
    )
WHERE 
    (title_de ILIKE '%Nydle%' OR title_en ILIKE '%Nydle%')
    AND badge_type = 'new_product';

-- 3. WEBSITE HIGHLIGHT - Hauptseite
UPDATE home_highlights 
SET 
    action_type = 'external_link',
    action_params = jsonb_build_object(
        'url', 'https://www.vysnlighting.com'
    )
WHERE 
    (title_de ILIKE '%Website%' OR title_en ILIKE '%Website%')
    AND action_type = 'external_link';

-- 4. PRODUKTKATEGORIE HIGHLIGHT - Interne Navigation zu Produkten
UPDATE home_highlights 
SET 
    action_type = 'internal_link',
    action_params = jsonb_build_object(
        'screen', 'Products',
        'params', jsonb_build_object(
            'filter', jsonb_build_object(
                'category1', 'LED'
            )
        )
    )
WHERE 
    (title_de ILIKE '%LED%Produkte%' OR title_en ILIKE '%LED%Products%')
    AND badge_type = 'featured';

-- NEUE HIGHLIGHTS HINZUFÜGEN falls nicht vorhanden

-- 5. SKY RAIL HIGHLIGHT (basierend auf Website)
INSERT INTO home_highlights (
    title_de, title_en,
    description_de, description_en,
    badge_text_de, badge_text_en,
    badge_type,
    button_text_de, button_text_en,
    image_url,
    action_type, action_params,
    sort_order
) VALUES (
    'SKY Rail Schienensystem', 'SKY Rail Track System',
    'Endlose Flexibilität bietet endlose Möglichkeiten. Entdecken Sie unser neues SKY-Rail-Sortiment.',
    'Endless flexibility offers endless possibilities. Discover our new SKY-Rail range.',
    'Neu im Sortiment', 'New in Range', 
    'new_product',
    'Mehr erfahren', 'Learn More',
    'https://www.vysnlighting.com/cdn/shop/files/sky-rail-hero.jpg',
    'internal_link',
    '{"screen": "Products", "params": {"filter": {"groupName": "Schienensysteme"}}}',
    5
) ON CONFLICT (id) DO NOTHING;

-- 6. KOLLEKTIONEN HIGHLIGHT
INSERT INTO home_highlights (
    title_de, title_en,
    description_de, description_en,
    badge_text_de, badge_text_en,
    badge_type,
    button_text_de, button_text_en,
    image_url,
    action_type, action_params,
    sort_order
) VALUES (
    'VYSN Kollektionen entdecken', 'Discover VYSN Collections',
    'Entdecken Sie eine große Produktvielfalt in unseren Premium-Kollektionen.',
    'Discover a wide range of products in our premium collections.',
    'Kollektion', 'Collection', 
    'featured',
    'Kollektionen ansehen', 'View Collections',
    'https://www.vysnlighting.com/cdn/shop/files/collections-overview.jpg',
    'external_link',
    '{"url": "https://www.vysnlighting.com/collections"}',
    6
) ON CONFLICT (id) DO NOTHING;

-- 7. SPEZIFISCHES PRODUKT - Onis Kollektion
INSERT INTO home_highlights (
    title_de, title_en,
    description_de, description_en,
    badge_text_de, badge_text_en,
    badge_type,
    button_text_de, button_text_en,
    image_url,
    action_type, action_params,
    product_id,
    sort_order
) VALUES (
    'Onis Premium Downlight', 'Onis Premium Downlight',
    'Hochwertige LED-Downlights der Onis Serie für professionelle Beleuchtungslösungen.',
    'High-quality LED downlights from the Onis series for professional lighting solutions.',
    'Premium Serie', 'Premium Series', 
    'new_product',
    'Produkt ansehen', 'View Product',
    'https://vysninstructionmanuals.web.app/products/V115201_1.jpg',
    'product',
    '{"item_number": "V115201"}',
    (SELECT id FROM products WHERE item_number_vysn = 'V115201' LIMIT 1),
    7
) ON CONFLICT (id) DO NOTHING;

-- 8. DOWNLOAD HIGHLIGHT - Echter Katalog Link
INSERT INTO home_highlights (
    title_de, title_en,
    description_de, description_en,
    badge_text_de, badge_text_en,
    badge_type,
    button_text_de, button_text_en,
    image_url,
    action_type, action_params,
    sort_order
) VALUES (
    'VYSN Katalog 2025', 'VYSN Catalog 2025',
    'Laden Sie den kompletten VYSN Katalog 2025 mit allen Produkten und technischen Daten herunter.',
    'Download the complete VYSN Catalog 2025 with all products and technical specifications.',
    'Katalog Download', 'Catalog Download', 
    'catalog',
    'PDF herunterladen', 'Download PDF',
    '/assets/vysn-catalog-2025.jpg',
    'external_link',
    '{"url": "https://www.vysnlighting.com/pages/katalog"}',
    8
) ON CONFLICT (id) DO NOTHING;

-- BESTEHENDE HIGHLIGHTS AKTUALISIEREN

-- Alle Highlights ohne Actions bekommen 'none'
UPDATE home_highlights 
SET action_type = 'none'
WHERE action_type IS NULL OR action_type = '';

-- Alle Highlights ohne action_params bekommen leeres JSON
UPDATE home_highlights 
SET action_params = '{}'::jsonb
WHERE action_params IS NULL;

-- VALIDIERUNG UND OUTPUT

-- Zeige konfigurierte Actions an
SELECT 
    id,
    title_de,
    title_en,
    badge_type,
    action_type,
    action_params,
    product_id,
    is_active,
    sort_order
FROM home_highlights 
ORDER BY sort_order;

-- Teste multilingual function
SELECT 
    '=== DEUTSCH ===' as test_section,
    title,
    action_type,
    action_params
FROM get_home_highlights('de')
WHERE is_active = true
ORDER BY sort_order
LIMIT 5;

SELECT 
    '=== ENGLISH ===' as test_section,
    title,
    action_type,
    action_params
FROM get_home_highlights('en')
WHERE is_active = true
ORDER BY sort_order
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
    RAISE NOTICE 'HIGHLIGHT ACTIONS KONFIGURIERT!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Aktive Highlights: %', highlight_count;
    RAISE NOTICE 'Mit Actions: %', action_count;
    RAISE NOTICE 'Katalog Link: https://www.vysnlighting.com/de/pages/katalog';
    RAISE NOTICE 'Produkt Navigation: item_number basiert';
    RAISE NOTICE 'Interne Navigation: zu Products Screen';
    RAISE NOTICE 'Externe Links: zu VYSN Website';
    RAISE NOTICE '============================================';
END $$;
