-- E-Mail-Verifikation um numerischen Code erweitern
-- Zusätzlich zum Token wird jetzt auch ein 6-stelliger Code generiert

-- 1. Code-Spalte zur email_verifications Tabelle hinzufügen
ALTER TABLE email_verifications 
ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6);

-- 2. Index für schnelle Code-Suche
CREATE INDEX IF NOT EXISTS idx_email_verifications_code 
ON email_verifications(verification_code);

-- 3. Unique Constraint für Codes (nur nicht-verifizierte Codes)
-- NOW() ist nicht IMMUTABLE, daher ohne Zeitprüfung im Index
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_verifications_code_unique 
ON email_verifications(verification_code) 
WHERE verified_at IS NULL;

-- 4. Funktion zum Cleanup abgelaufener Codes
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
  -- Lösche abgelaufene, nicht-verifizierte Codes
  DELETE FROM email_verifications 
  WHERE expires_at < NOW() 
  AND verified_at IS NULL;
  
  -- Log cleanup
  RAISE NOTICE 'Cleaned up expired verification codes';
END;
$$ language 'plpgsql';

-- 5. Trigger für automatische Cleanup (optional)
-- Bereinigung wird durch die Backend-Services gehandhabt

-- 6. Kommentare
COMMENT ON COLUMN email_verifications.verification_code IS '6-stelliger numerischer Code für E-Mail-Verifikation (Alternative zum Token-Link)';

-- 7. Test-Daten (optional)
-- Bestehende Verifikationen mit Codes erweitern falls gewünscht
-- UPDATE email_verifications 
-- SET verification_code = LPAD((FLOOR(RANDOM() * 900000) + 100000)::text, 6, '0')
-- WHERE verification_code IS NULL AND verified_at IS NULL;
