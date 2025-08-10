-- Vereinfachte Consent-Felder zur profiles Tabelle hinzufügen
-- Nur 2 Kategorien: Analytics und Marketing

-- Vereinfachte Consent-Felder hinzufügen
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS analytics_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE;

-- Die überflüssigen granularen Felder entfernen (falls sie existieren)
ALTER TABLE profiles DROP COLUMN IF EXISTS chat_analysis_consent;
ALTER TABLE profiles DROP COLUMN IF EXISTS project_analytics_consent;

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_profiles_analytics_consent ON profiles(analytics_consent);
CREATE INDEX IF NOT EXISTS idx_profiles_marketing_consent ON profiles(marketing_consent);

-- Kommentare für Dokumentation
COMMENT ON COLUMN profiles.analytics_consent IS 'Zustimmung zu Analyse & Verbesserung (Scans, App-Nutzung, Chats)';
COMMENT ON COLUMN profiles.marketing_consent IS 'Zustimmung zu Marketing-E-Mails und Newsletter';

-- Migrationsdaten: Bestehende Nutzer mit privacy_consent_given = true bekommen Analytics-Rechte
UPDATE profiles 
SET 
    analytics_consent = COALESCE(privacy_consent_given, FALSE),
    marketing_consent = FALSE  -- Marketing bleibt Opt-in
WHERE 
    privacy_consent_given = TRUE
    AND (analytics_consent IS NULL OR analytics_consent = FALSE);

RAISE NOTICE 'Vereinfachte Consent-Felder erfolgreich hinzugefügt und migriert';
