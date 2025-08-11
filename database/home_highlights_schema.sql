-- =============================================
-- HOME HIGHLIGHTS SCHEMA
-- =============================================
-- Table for managing highlights on the home screen

CREATE TABLE IF NOT EXISTS home_highlights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Highlight Content
    title TEXT NOT NULL,
    description TEXT,
    badge_text TEXT,
    badge_type TEXT CHECK (badge_type IN ('new_release', 'new_product')),
    
    -- Visual Elements
    image_url TEXT,
    button_text TEXT DEFAULT 'Details anzeigen',
    
    -- Product Reference (optional)
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    
    -- Visibility and Ordering
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    
    -- System Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS home_highlights_active_idx ON home_highlights (is_active);
CREATE INDEX IF NOT EXISTS home_highlights_sort_order_idx ON home_highlights (sort_order);
CREATE INDEX IF NOT EXISTS home_highlights_product_id_idx ON home_highlights (product_id);

-- RLS Policy (everyone can read highlights)
ALTER TABLE home_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active highlights" ON home_highlights
    FOR SELECT 
    USING (is_active = true);

-- Update trigger for updated_at
CREATE TRIGGER update_home_highlights_updated_at 
    BEFORE UPDATE ON home_highlights 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample highlights (matching current HomeScreen content)
INSERT INTO home_highlights (title, description, badge_text, badge_type, image_url, button_text, sort_order) VALUES
('VYSN Katalog 2025', 'Der neue VYSN Katalog 2025 ist da! Entdecken Sie innovative Beleuchtungslösungen für jeden Bereich.', 'Neu erschienen', 'new_release', '/assets/VYSN_KAT.png', 'Jetzt herunterladen', 1),
('Nydle T - Touch Dimmable LED', 'Touch-dimming, 5.4W, 2700K - Die neueste Innovation in der LED-Beleuchtung.', 'Neu im Sortiment', 'new_product', 'https://vysninstructionmanuals.web.app/products/V109001B2B_1.jpg', 'Details anzeigen', 2)
ON CONFLICT DO NOTHING;

-- Comments
COMMENT ON TABLE home_highlights IS 'Highlights displayed on the home screen';