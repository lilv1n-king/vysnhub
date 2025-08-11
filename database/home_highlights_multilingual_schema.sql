-- =============================================
-- HOME HIGHLIGHTS MULTILINGUAL SCHEMA
-- =============================================
-- Erweiterte Tabelle für mehrsprachige Highlights mit flexibler Navigation

-- Bestehende Tabelle löschen falls vorhanden (für Neustart)
-- DROP TABLE IF EXISTS home_highlights CASCADE;

-- Neue multilingual Highlights Tabelle
CREATE TABLE IF NOT EXISTS home_highlights (
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
    action_type TEXT NOT NULL CHECK (action_type IN (
        'product',          -- Navigate to product detail
        'external_link',    -- Open external URL
        'internal_link',    -- Navigate to app screen
        'download',         -- Download file
        'none'              -- No action (display only)
    )),
    
    -- Action Parameters (JSON for flexibility)
    action_params JSONB DEFAULT '{}',
    -- Beispiele für action_params:
    -- product: {"product_id": 123} oder {"item_number": "V109001B2B"}
    -- external_link: {"url": "https://example.com"}
    -- internal_link: {"screen": "Products", "params": {"filter": "category1=LED"}}
    -- download: {"url": "https://example.com/file.pdf", "filename": "VYSN_Katalog_2025.pdf"}
    
    -- Legacy Product Reference (für Rückwärtskompatibilität)
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    
    -- Visibility and Ordering
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    
    -- System Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes für Performance
CREATE INDEX IF NOT EXISTS home_highlights_active_idx ON home_highlights (is_active);
CREATE INDEX IF NOT EXISTS home_highlights_sort_order_idx ON home_highlights (sort_order);
CREATE INDEX IF NOT EXISTS home_highlights_action_type_idx ON home_highlights (action_type);
CREATE INDEX IF NOT EXISTS home_highlights_product_id_idx ON home_highlights (product_id);

-- RLS Policy (jeder kann aktive Highlights lesen)
ALTER TABLE home_highlights ENABLE ROW LEVEL SECURITY;

-- Bestehende Policy löschen falls vorhanden
DROP POLICY IF EXISTS "Anyone can view active highlights" ON home_highlights;

CREATE POLICY "Anyone can view active highlights" ON home_highlights
    FOR SELECT 
    USING (is_active = true);

-- Update Trigger für updated_at
DROP TRIGGER IF EXISTS update_home_highlights_updated_at ON home_highlights;
CREATE TRIGGER update_home_highlights_updated_at 
    BEFORE UPDATE ON home_highlights 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Migration: Bestehende Daten löschen und neue einfügen
DELETE FROM home_highlights;

-- Beispiel-Highlights mit Mehrsprachigkeit und verschiedenen Action-Types
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

-- Kommentare
COMMENT ON TABLE home_highlights IS 'Multilingual highlights displayed on the home screen with flexible navigation';
COMMENT ON COLUMN home_highlights.action_type IS 'Type of action when highlight is tapped';
COMMENT ON COLUMN home_highlights.action_params IS 'JSON parameters for the action (flexible configuration)';

-- Hilfsfunktion um Highlight-Daten basierend auf Sprache zu laden
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
