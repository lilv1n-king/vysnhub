-- =============================================
-- MIGRATION: HIGHLIGHTS TO MULTILINGUAL
-- =============================================
-- Migriert bestehende home_highlights zu mehrsprachigem Schema

-- Schritt 1: Backup der bestehenden Daten
CREATE TABLE IF NOT EXISTS home_highlights_backup AS 
SELECT * FROM home_highlights;

-- Schritt 2: Neue Spalten hinzufügen (wenn sie nicht existieren)
ALTER TABLE home_highlights 
ADD COLUMN IF NOT EXISTS title_de TEXT,
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS description_de TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS badge_text_de TEXT,
ADD COLUMN IF NOT EXISTS badge_text_en TEXT,
ADD COLUMN IF NOT EXISTS button_text_de TEXT DEFAULT 'Details anzeigen',
ADD COLUMN IF NOT EXISTS button_text_en TEXT DEFAULT 'View Details',
ADD COLUMN IF NOT EXISTS action_type TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS action_params JSONB DEFAULT '{}';

-- Schritt 3: Bestehende Daten in neue Struktur migrieren
-- Annahme: Bestehende Texte sind auf Deutsch
UPDATE home_highlights 
SET 
  title_de = title,
  title_en = title, -- Wird später übersetzt
  description_de = description,
  description_en = description, -- Wird später übersetzt
  badge_text_de = badge_text,
  badge_text_en = badge_text, -- Wird später übersetzt
  button_text_de = COALESCE(button_text, 'Details anzeigen'),
  button_text_en = COALESCE(button_text, 'View Details'),
  action_type = CASE 
    WHEN product_id IS NOT NULL THEN 'product'
    ELSE 'none'
  END,
  action_params = CASE 
    WHEN product_id IS NOT NULL THEN 
      jsonb_build_object('product_id', product_id)
    ELSE '{}'::jsonb
  END
WHERE title_de IS NULL OR title_en IS NULL;

-- Schritt 4: Constraints hinzufügen
ALTER TABLE home_highlights 
ALTER COLUMN title_de SET NOT NULL,
ALTER COLUMN title_en SET NOT NULL;

-- Schritt 5: Action Type Constraint hinzufügen
ALTER TABLE home_highlights 
ADD CONSTRAINT check_action_type 
CHECK (action_type IN ('product', 'external_link', 'internal_link', 'download', 'none'));

-- Schritt 6: Badge Type erweitern
ALTER TABLE home_highlights 
DROP CONSTRAINT IF EXISTS home_highlights_badge_type_check;

ALTER TABLE home_highlights 
ADD CONSTRAINT home_highlights_badge_type_check 
CHECK (badge_type IN ('new_release', 'new_product', 'featured', 'catalog', 'event'));

-- Schritt 7: Neue Indizes
CREATE INDEX IF NOT EXISTS home_highlights_action_type_idx ON home_highlights (action_type);

-- Schritt 8: Beispiel-Übersetzungen für bestehende Highlights
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

-- Schritt 9: RLS Policy aktualisieren (falls nötig)
DROP POLICY IF EXISTS "Anyone can view active highlights" ON home_highlights;
CREATE POLICY "Anyone can view active highlights" ON home_highlights
    FOR SELECT 
    USING (is_active = true);

-- Schritt 10: Funktionen für Mehrsprachigkeit erstellen (falls nicht vorhanden)
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

-- Schritt 11: Erfolgs-Meldung
DO $$
BEGIN
    RAISE NOTICE 'Migration zu mehrsprachigen Highlights erfolgreich abgeschlossen!';
    RAISE NOTICE 'Backup-Tabelle erstellt: home_highlights_backup';
    RAISE NOTICE 'Neue Spalten hinzugefügt: title_de/en, description_de/en, badge_text_de/en, button_text_de/en';
    RAISE NOTICE 'Action-System hinzugefügt: action_type, action_params';
    RAISE NOTICE 'Funktion erstellt: get_home_highlights(lang)';
END $$;
