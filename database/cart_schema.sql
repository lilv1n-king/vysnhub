-- Warenkorb-Tabellen für VYSN Hub
-- Erstellt persistente Warenkörbe pro Benutzer

-- Cart (Warenkorb) Haupttabelle
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT, -- Für Gäste ohne Account
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'), -- Warenkorb läuft nach 30 Tagen ab
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'abandoned', 'converted', 'expired')),
    total_items INTEGER DEFAULT 0,
    total_price DECIMAL(10,2) DEFAULT 0.00,
    currency TEXT DEFAULT 'EUR'
);

-- Cart Items (Warenkorb-Artikel)
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE NOT NULL,
    product_id INTEGER NOT NULL, -- Referenz auf products Tabelle
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Verhindert doppelte Produkte im gleichen Warenkorb
    UNIQUE(cart_id, product_id)
);

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_session_id ON carts(session_id);
CREATE INDEX IF NOT EXISTS idx_carts_status ON carts(status);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- Partielle UNIQUE Indizes für nur einen aktiven Warenkorb pro User/Session
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_user_cart 
    ON carts(user_id) 
    WHERE status = 'active' AND user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_session_cart 
    ON carts(session_id) 
    WHERE status = 'active' AND session_id IS NOT NULL;

-- Trigger für updated_at Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Trigger für automatische Warenkorb-Totals
CREATE OR REPLACE FUNCTION update_cart_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Update cart totals when items change
    UPDATE carts 
    SET 
        total_items = (
            SELECT COALESCE(SUM(quantity), 0) 
            FROM cart_items 
            WHERE cart_id = COALESCE(NEW.cart_id, OLD.cart_id)
        ),
        total_price = (
            SELECT COALESCE(SUM(total_price), 0.00) 
            FROM cart_items 
            WHERE cart_id = COALESCE(NEW.cart_id, OLD.cart_id)
        ),
        updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = COALESCE(NEW.cart_id, OLD.cart_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cart_totals_on_items_change 
    AFTER INSERT OR UPDATE OR DELETE ON cart_items
    FOR EACH ROW EXECUTE PROCEDURE update_cart_totals();

-- Funktion zum Bereinigen abgelaufener Warenkörbe
CREATE OR REPLACE FUNCTION cleanup_expired_carts()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Lösche abgelaufene Warenkörbe
    DELETE FROM carts 
    WHERE expires_at < NOW() 
    AND status IN ('active', 'abandoned');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Row Level Security (RLS) Policies
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Benutzer können nur ihre eigenen Warenkörbe sehen/bearbeiten
CREATE POLICY "Users can view own carts" ON carts
    FOR SELECT USING (
        auth.uid() = user_id OR 
        (auth.uid() IS NULL AND session_id IS NOT NULL)
    );

CREATE POLICY "Users can insert own carts" ON carts
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        (auth.uid() IS NULL AND session_id IS NOT NULL)
    );

CREATE POLICY "Users can update own carts" ON carts
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        (auth.uid() IS NULL AND session_id IS NOT NULL)
    );

CREATE POLICY "Users can delete own carts" ON carts
    FOR DELETE USING (
        auth.uid() = user_id OR 
        (auth.uid() IS NULL AND session_id IS NOT NULL)
    );

-- Cart Items Policies
CREATE POLICY "Users can view own cart items" ON cart_items
    FOR SELECT USING (
        cart_id IN (
            SELECT id FROM carts 
            WHERE auth.uid() = user_id OR 
            (auth.uid() IS NULL AND session_id IS NOT NULL)
        )
    );

CREATE POLICY "Users can insert own cart items" ON cart_items
    FOR INSERT WITH CHECK (
        cart_id IN (
            SELECT id FROM carts 
            WHERE auth.uid() = user_id OR 
            (auth.uid() IS NULL AND session_id IS NOT NULL)
        )
    );

CREATE POLICY "Users can update own cart items" ON cart_items
    FOR UPDATE USING (
        cart_id IN (
            SELECT id FROM carts 
            WHERE auth.uid() = user_id OR 
            (auth.uid() IS NULL AND session_id IS NOT NULL)
        )
    );

CREATE POLICY "Users can delete own cart items" ON cart_items
    FOR DELETE USING (
        cart_id IN (
            SELECT id FROM carts 
            WHERE auth.uid() = user_id OR 
            (auth.uid() IS NULL AND session_id IS NOT NULL)
        )
    );

-- Beispiel-Daten für Testing (optional)
-- INSERT INTO carts (user_id, status) VALUES 
-- ('00000000-0000-0000-0000-000000000000', 'active');

-- Kommentare
COMMENT ON TABLE carts IS 'Warenkörbe der Benutzer - persistent über Sessions hinweg';
COMMENT ON TABLE cart_items IS 'Artikel in Warenkörben mit Mengen und Preisen';
COMMENT ON COLUMN carts.session_id IS 'Session ID für Gast-Warenkörbe ohne Account';
COMMENT ON COLUMN carts.expires_at IS 'Warenkorb läuft automatisch ab - Standard 30 Tage';
COMMENT ON COLUMN cart_items.total_price IS 'Automatisch berechnet: quantity * unit_price';