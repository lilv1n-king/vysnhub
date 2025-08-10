-- Privacy-Felder zur profiles Tabelle hinzufügen
-- Ersetzt die separate privacy_consents Tabelle

-- Privacy Consent Felder hinzufügen
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_consent_given BOOLEAN DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_consent_version VARCHAR(20) DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_consent_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_consent_ip INET DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_consent_user_agent TEXT DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_withdrawn_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_profiles_privacy_consent ON profiles(privacy_consent_given, privacy_consent_version);
CREATE INDEX IF NOT EXISTS idx_profiles_privacy_date ON profiles(privacy_consent_date);

-- Kommentar für Dokumentation
COMMENT ON COLUMN profiles.privacy_consent_given IS 'Benutzer-Zustimmung zur Datenschutzerklärung';
COMMENT ON COLUMN profiles.privacy_consent_version IS 'Version der akzeptierten Datenschutzerklärung';
COMMENT ON COLUMN profiles.privacy_consent_date IS 'Datum der Zustimmung';
COMMENT ON COLUMN profiles.privacy_consent_ip IS 'IP-Adresse bei Zustimmung';
COMMENT ON COLUMN profiles.privacy_consent_user_agent IS 'User-Agent bei Zustimmung';
COMMENT ON COLUMN profiles.privacy_withdrawn_date IS 'Datum des Zustimmungs-Widerrufs';

-- Migrationsdaten von privacy_consents (falls vorhanden)
-- Dies würde in einer realen Migration alle existierenden Consent-Daten übertragen
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'privacy_consents') THEN
        -- Aktualisiere profiles mit den neuesten Consent-Daten
        UPDATE profiles SET
            privacy_consent_given = pc.consent_given,
            privacy_consent_version = pc.consent_version,
            privacy_consent_date = pc.consent_date,
            privacy_consent_ip = pc.ip_address,
            privacy_consent_user_agent = pc.user_agent,
            privacy_withdrawn_date = pc.withdrawn_date
        FROM (
            SELECT DISTINCT ON (user_id) 
                user_id,
                consent_given,
                consent_version,
                consent_date,
                ip_address,
                user_agent,
                withdrawn_date
            FROM privacy_consents
            ORDER BY user_id, consent_date DESC
        ) pc
        WHERE profiles.id = pc.user_id;
        
        RAISE NOTICE 'Privacy consent data migrated from privacy_consents to profiles table';
    END IF;
END $$;
