-- Barcode Scans Tracking Table
-- Diese Tabelle speichert alle Barcode-Scans für Analytics

-- Alte Tabelle löschen falls vorhanden
DROP TABLE IF EXISTS barcode_scans CASCADE;

-- Views löschen falls vorhanden
DROP VIEW IF EXISTS daily_scan_stats CASCADE;
DROP VIEW IF EXISTS top_scanned_codes CASCADE;
DROP VIEW IF EXISTS user_scan_activity CASCADE;
DROP VIEW IF EXISTS session_scan_activity CASCADE;

CREATE TABLE barcode_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Scan-Details
    scanned_code VARCHAR(255) NOT NULL,
    scan_type VARCHAR(50) NOT NULL CHECK (scan_type IN ('barcode', 'qr_code', 'manual_input')),
    
    -- Produkt-Informationen (falls gefunden)
    product_id INTEGER,
    product_item_number VARCHAR(100),
    product_found BOOLEAN DEFAULT FALSE,
    
    -- Anonyme Session (keine Benutzer-Tracking)
    -- user_id und user_email entfernt für anonymes Tracking
    
    -- Kontext-Informationen
    scan_source VARCHAR(50) NOT NULL CHECK (scan_source IN ('native_app', 'web_app')),
    device_info JSONB, -- z.B. {"platform": "ios", "version": "1.0.0", "model": "iPhone 14"}
    
    -- Geo-Location (optional)
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_accuracy DECIMAL(10, 2),
    
    -- Session-Informationen
    session_id VARCHAR(255),
    
    -- Ergebnis-Informationen
    search_results_count INTEGER DEFAULT 0,
    action_taken VARCHAR(100), -- z.B. "product_viewed", "search_performed", "no_action"
    
    -- Timestamps
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices für bessere Performance
CREATE INDEX IF NOT EXISTS idx_barcode_scans_scanned_code ON barcode_scans(scanned_code);
CREATE INDEX IF NOT EXISTS idx_barcode_scans_scanned_at ON barcode_scans(scanned_at);
CREATE INDEX IF NOT EXISTS idx_barcode_scans_scan_source ON barcode_scans(scan_source);
CREATE INDEX IF NOT EXISTS idx_barcode_scans_product_found ON barcode_scans(product_found);
CREATE INDEX IF NOT EXISTS idx_barcode_scans_product_item_number ON barcode_scans(product_item_number);
CREATE INDEX IF NOT EXISTS idx_barcode_scans_session_id ON barcode_scans(session_id);

-- RLS (Row Level Security) deaktiviert für anonyme Scans
-- ALTER TABLE barcode_scans ENABLE ROW LEVEL SECURITY;

-- Keine RLS Policies - alle Scans sind anonym und öffentlich zugänglich

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_barcode_scans_updated_at 
    BEFORE UPDATE ON barcode_scans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views für Analytics

-- Tägliche Scan-Statistiken
CREATE OR REPLACE VIEW daily_scan_stats AS
SELECT 
    DATE(scanned_at) as scan_date,
    scan_source,
    scan_type,
    COUNT(*) as total_scans,
    COUNT(CASE WHEN product_found THEN 1 END) as successful_scans,
    COUNT(DISTINCT session_id) as unique_sessions
FROM barcode_scans 
GROUP BY DATE(scanned_at), scan_source, scan_type
ORDER BY scan_date DESC;

-- Meist gescannte Codes
CREATE OR REPLACE VIEW top_scanned_codes AS
SELECT 
    scanned_code,
    product_item_number,
    scan_type,
    COUNT(*) as scan_count,
    COUNT(DISTINCT session_id) as unique_sessions,
    MAX(scanned_at) as last_scanned,
    AVG(CASE WHEN product_found THEN 1.0 ELSE 0.0 END) as success_rate
FROM barcode_scans 
GROUP BY scanned_code, product_item_number, scan_type
HAVING COUNT(*) > 1
ORDER BY scan_count DESC;

-- Session-Scan-Aktivität (ersetzt user_scan_activity für anonymes Tracking)
CREATE OR REPLACE VIEW session_scan_activity AS
SELECT 
    session_id,
    COUNT(*) as total_scans,
    COUNT(CASE WHEN product_found THEN 1 END) as successful_scans,
    COUNT(DISTINCT scanned_code) as unique_codes_scanned,
    MIN(scanned_at) as first_scan,
    MAX(scanned_at) as last_scan,
    DATE_PART('day', MAX(scanned_at) - MIN(scanned_at)) as active_days
FROM barcode_scans 
WHERE session_id IS NOT NULL
GROUP BY session_id
ORDER BY total_scans DESC;

COMMENT ON TABLE barcode_scans IS 'Tabelle zum Tracking aller Barcode-Scans für Analytics und Benutzerverhalten-Analyse';
COMMENT ON COLUMN barcode_scans.scanned_code IS 'Der gescannte Barcode/QR-Code oder manuell eingegebene Text';
COMMENT ON COLUMN barcode_scans.scan_type IS 'Art des Scans: barcode, qr_code, oder manual_input';
COMMENT ON COLUMN barcode_scans.product_found IS 'Ob ein Produkt für den gescannten Code gefunden wurde';
COMMENT ON COLUMN barcode_scans.scan_source IS 'Von welcher App der Scan kam: native_app oder web_app';
COMMENT ON COLUMN barcode_scans.device_info IS 'JSON mit Geräte-Informationen für bessere Analytics';
COMMENT ON COLUMN barcode_scans.action_taken IS 'Welche Aktion der Benutzer nach dem Scan durchgeführt hat';