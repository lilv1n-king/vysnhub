-- Korrektes Schema basierend auf der Excel-Datei mit 67 Spalten
-- Ersetzt das generische Schema

-- Lösche alte Tabellen falls vorhanden
DROP TABLE IF EXISTS article_embeddings CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- Erstelle Produkttabelle mit korrekten Spalten aus Excel
CREATE TABLE IF NOT EXISTS products (
    -- Identifikation
    id SERIAL PRIMARY KEY,
    vysn_name TEXT,
    item_number_vysn TEXT UNIQUE, -- Als eindeutige Artikelnummer
    short_description TEXT,
    long_description TEXT,
    
    -- Physische Eigenschaften
    weight_kg NUMERIC(10,3),
    packaging_weight_kg NUMERIC(10,3),
    gross_weight_kg NUMERIC(10,3),
    
    -- Abmessungen
    installation_diameter NUMERIC(10,2),
    cable_length_mm NUMERIC(10,1),
    diameter_mm NUMERIC(10,1),
    length_mm NUMERIC(10,1),
    width_mm NUMERIC(10,1),
    height_mm NUMERIC(10,1),
    packaging_width_mm NUMERIC(10,1),
    packaging_length_mm NUMERIC(10,1),
    packaging_height_mm NUMERIC(10,1),
    
    -- Farbe und Design
    housing_color TEXT,
    material TEXT,
    
    -- Preis und Katalog
    gross_price NUMERIC(10,2),
    katalog_q4_24 BOOLEAN DEFAULT false,
    
    -- Kategorisierung
    category_1 TEXT,
    category_2 TEXT,
    group_name TEXT,
    
    -- Licht-spezifische Eigenschaften
    light_direction TEXT,
    lumen NUMERIC(10,1),
    driver_info TEXT,
    beam_angle NUMERIC(10,1),
    beam_angle_range TEXT,
    lightsource TEXT,
    luminosity_decrease TEXT,
    steering TEXT,
    led_chip_lifetime TEXT,
    
    -- Energieeffizienz
    energy_class TEXT,
    cct NUMERIC(10,0), -- Farbtemperatur
    cri NUMERIC(10,1), -- Farbwiedergabeindex
    wattage NUMERIC(10,1),
    led_type TEXT,
    sdcm TEXT,
    operating_mode TEXT,
    lumen_per_watt NUMERIC(10,1),
    cct_switch_value TEXT,
    power_switch_value TEXT,
    
    -- Sicherheit und Standards
    ingress_protection TEXT, -- IP-Schutzklasse
    protection_class TEXT,
    impact_resistance TEXT,
    ugr NUMERIC(10,1), -- Blendwert
    
    -- Installation
    installation TEXT,
    base_socket TEXT,
    number_of_sockets NUMERIC(10,0),
    socket_information_retrofit TEXT,
    replaceable_light_source BOOLEAN,
    coverable BOOLEAN,
    
    -- Zusätzliche Informationen
    manual_link TEXT,
    barcode_number TEXT,
    hs_code TEXT,
    packaging_units NUMERIC(10,0) DEFAULT 1,
    country_of_origin TEXT,
    eprel_link TEXT,
    eprel_picture_link TEXT,
    
    -- Produktbilder
    product_picture_1 TEXT,
    product_picture_2 TEXT,
    product_picture_3 TEXT,
    product_picture_4 TEXT,
    product_picture_5 TEXT,
    product_picture_6 TEXT,
    product_picture_7 TEXT,
    product_picture_8 TEXT,
    
    -- System-Felder
    availability BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Erstelle Chat-Sessions Tabelle (bleibt gleich)
CREATE TABLE IF NOT EXISTS chat_sessions (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Erstelle Chat-Messages Tabelle (bleibt gleich)
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

-- Produktsuche Indizes - spezifisch für Beleuchtungsprodukte
CREATE INDEX IF NOT EXISTS products_vysn_name_idx ON products USING gin(to_tsvector('german', vysn_name));
CREATE INDEX IF NOT EXISTS products_item_number_idx ON products (item_number_vysn);
CREATE INDEX IF NOT EXISTS products_short_description_idx ON products USING gin(to_tsvector('german', short_description));
CREATE INDEX IF NOT EXISTS products_long_description_idx ON products USING gin(to_tsvector('german', long_description));

-- Kategorien und Gruppierung
CREATE INDEX IF NOT EXISTS products_category_1_idx ON products (category_1);
CREATE INDEX IF NOT EXISTS products_category_2_idx ON products (category_2);
CREATE INDEX IF NOT EXISTS products_group_name_idx ON products (group_name);

-- Preis und Verfügbarkeit
CREATE INDEX IF NOT EXISTS products_gross_price_idx ON products (gross_price);
CREATE INDEX IF NOT EXISTS products_availability_idx ON products (availability);

-- Beleuchtung-spezifische Suchen
CREATE INDEX IF NOT EXISTS products_lumen_idx ON products (lumen);
CREATE INDEX IF NOT EXISTS products_wattage_idx ON products (wattage);
CREATE INDEX IF NOT EXISTS products_cct_idx ON products (cct);
CREATE INDEX IF NOT EXISTS products_cri_idx ON products (cri);
CREATE INDEX IF NOT EXISTS products_beam_angle_idx ON products (beam_angle);
CREATE INDEX IF NOT EXISTS products_energy_class_idx ON products (energy_class);
CREATE INDEX IF NOT EXISTS products_ingress_protection_idx ON products (ingress_protection);
CREATE INDEX IF NOT EXISTS products_housing_color_idx ON products (housing_color);

-- Chat-System Indizes (bleiben gleich)
CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx ON chat_messages (session_id);
CREATE INDEX IF NOT EXISTS chat_messages_timestamp_idx ON chat_messages (timestamp);
CREATE INDEX IF NOT EXISTS chat_messages_request_type_idx ON chat_messages (request_type);
CREATE INDEX IF NOT EXISTS chat_sessions_updated_at_idx ON chat_sessions (updated_at);

-- Funktion für custom SQL-Queries (angepasst für neue Spalten)
CREATE OR REPLACE FUNCTION execute_custom_query(query_text TEXT)
RETURNS TABLE(
    id INTEGER,
    vysn_name TEXT,
    item_number_vysn TEXT,
    short_description TEXT,
    long_description TEXT,
    weight_kg NUMERIC,
    packaging_weight_kg NUMERIC,
    gross_weight_kg NUMERIC,
    installation_diameter NUMERIC,
    cable_length_mm NUMERIC,
    diameter_mm NUMERIC,
    length_mm NUMERIC,
    width_mm NUMERIC,
    height_mm NUMERIC,
    packaging_width_mm NUMERIC,
    packaging_length_mm NUMERIC,
    packaging_height_mm NUMERIC,
    housing_color TEXT,
    material TEXT,
    gross_price NUMERIC,
    katalog_q4_24 BOOLEAN,
    category_1 TEXT,
    category_2 TEXT,
    group_name TEXT,
    light_direction TEXT,
    lumen NUMERIC,
    driver_info TEXT,
    beam_angle NUMERIC,
    beam_angle_range TEXT,
    lightsource TEXT,
    luminosity_decrease TEXT,
    steering TEXT,
    led_chip_lifetime TEXT,
    energy_class TEXT,
    cct NUMERIC,
    cri NUMERIC,
    wattage NUMERIC,
    led_type TEXT,
    sdcm TEXT,
    operating_mode TEXT,
    lumen_per_watt NUMERIC,
    cct_switch_value TEXT,
    power_switch_value TEXT,
    ingress_protection TEXT,
    protection_class TEXT,
    impact_resistance TEXT,
    ugr NUMERIC,
    installation TEXT,
    base_socket TEXT,
    number_of_sockets INTEGER,
    socket_information_retrofit TEXT,
    replaceable_light_source BOOLEAN,
    coverable BOOLEAN,
    manual_link TEXT,
    barcode_number TEXT,
    hs_code TEXT,
    packaging_units NUMERIC,
    country_of_origin TEXT,
    eprel_link TEXT,
    eprel_picture_link TEXT,
    product_picture_1 TEXT,
    product_picture_2 TEXT,
    product_picture_3 TEXT,
    product_picture_4 TEXT,
    product_picture_5 TEXT,
    product_picture_6 TEXT,
    product_picture_7 TEXT,
    product_picture_8 TEXT,
    availability BOOLEAN,
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

-- Kommentar zu den Spalten für besseres Verständnis
COMMENT ON TABLE products IS 'VYSN Beleuchtungsprodukte mit allen spezifischen Eigenschaften';
COMMENT ON COLUMN products.vysn_name IS 'Produktname bei VYSN';
COMMENT ON COLUMN products.item_number_vysn IS 'Eindeutige Artikelnummer bei VYSN';
COMMENT ON COLUMN products.cct IS 'Farbtemperatur in Kelvin';
COMMENT ON COLUMN products.cri IS 'Farbwiedergabeindex';
COMMENT ON COLUMN products.lumen IS 'Lichtstrom in Lumen';
COMMENT ON COLUMN products.wattage IS 'Leistungsaufnahme in Watt';
COMMENT ON COLUMN products.ingress_protection IS 'IP-Schutzklasse (z.B. IP65)';
COMMENT ON COLUMN products.ugr IS 'Unified Glare Rating - Blendwert'; 