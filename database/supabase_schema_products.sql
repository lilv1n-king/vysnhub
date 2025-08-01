-- Neues Schema für Filterlogik-basierte Produktsuche
-- Ersetzt das embedding-basierte System

-- Lösche alte Tabellen falls vorhanden
DROP TABLE IF EXISTS article_embeddings CASCADE;

-- Erstelle Produkttabelle
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    brand TEXT,
    price NUMERIC(10,2),
    currency TEXT DEFAULT 'EUR',
    availability BOOLEAN DEFAULT true,
    attributes JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Erstelle Chat-Sessions Tabelle
CREATE TABLE IF NOT EXISTS chat_sessions (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Erstelle Chat-Messages Tabelle
CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    request_type TEXT CHECK (request_type IN ('produktempfehlung', 'produktfrage', 'produktvergleich', 'aehnliche_produktsuche')),
    sql_query TEXT,
    metadata JSONB DEFAULT '{}',
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- Erstelle Indizes für bessere Performance

-- Produktsuche Indizes
CREATE INDEX IF NOT EXISTS products_name_idx ON products USING gin(to_tsvector('german', name));
CREATE INDEX IF NOT EXISTS products_description_idx ON products USING gin(to_tsvector('german', description));
CREATE INDEX IF NOT EXISTS products_category_idx ON products (category);
CREATE INDEX IF NOT EXISTS products_brand_idx ON products (brand);
CREATE INDEX IF NOT EXISTS products_price_idx ON products (price);
CREATE INDEX IF NOT EXISTS products_availability_idx ON products (availability);
CREATE INDEX IF NOT EXISTS products_attributes_idx ON products USING gin(attributes);

-- Chat-System Indizes
CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx ON chat_messages (session_id);
CREATE INDEX IF NOT EXISTS chat_messages_timestamp_idx ON chat_messages (timestamp);
CREATE INDEX IF NOT EXISTS chat_messages_request_type_idx ON chat_messages (request_type);
CREATE INDEX IF NOT EXISTS chat_sessions_updated_at_idx ON chat_sessions (updated_at);

-- Funktion für custom SQL-Queries (wird vom ProductService verwendet)
CREATE OR REPLACE FUNCTION execute_custom_query(query_text TEXT)
RETURNS TABLE(
    id TEXT,
    name TEXT,
    description TEXT,
    category TEXT,
    brand TEXT,
    price NUMERIC,
    currency TEXT,
    availability BOOLEAN,
    attributes JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Sicherheitscheck: Nur SELECT-Queries erlauben
    IF NOT (query_text ILIKE 'SELECT%' AND query_text NOT ILIKE '%INSERT%' AND query_text NOT ILIKE '%UPDATE%' AND query_text NOT ILIKE '%DELETE%' AND query_text NOT ILIKE '%DROP%' AND query_text NOT ILIKE '%CREATE%' AND query_text NOT ILIKE '%ALTER%') THEN
        RAISE EXCEPTION 'Nur SELECT-Queries sind erlaubt';
    END IF;
    
    RETURN QUERY EXECUTE query_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger für automatische updated_at Aktualisierung
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Beispiel-Daten (können später entfernt werden)
INSERT INTO products (id, name, description, category, brand, price, currency, availability, attributes) VALUES
('1', 'Smartphone X1', 'Modernes Smartphone mit 128GB Speicher', 'Electronics', 'TechBrand', 599.99, 'EUR', true, '{"color": "black", "storage": "128GB", "screen_size": "6.1"}'),
('2', 'Laptop Pro 15', 'Leistungsstarker Laptop für Profis', 'Electronics', 'CompBrand', 1299.99, 'EUR', true, '{"ram": "16GB", "storage": "512GB SSD", "screen_size": "15.6"}'),
('3', 'Wireless Kopfhörer', 'Bluetooth Kopfhörer mit Noise Cancelling', 'Electronics', 'AudioBrand', 249.99, 'EUR', true, '{"battery_life": "30h", "wireless": true, "noise_cancelling": true}'),
('4', 'Gaming Stuhl', 'Ergonomischer Stuhl für Gamer', 'Furniture', 'ChairBrand', 199.99, 'EUR', true, '{"color": "black", "material": "leather", "adjustable": true}'),
('5', 'Coffee Machine Deluxe', 'Vollautomatische Kaffeemaschine', 'Kitchen', 'CoffeeBrand', 899.99, 'EUR', true, '{"type": "automatic", "cups_per_day": "100", "milk_frother": true}');

-- RLS (Row Level Security) Policies - optional für bessere Sicherheit
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Public products access" ON products FOR SELECT USING (true);
-- CREATE POLICY "Public chat access" ON chat_sessions FOR ALL USING (true);
-- CREATE POLICY "Public chat messages access" ON chat_messages FOR ALL USING (true); 