-- Migration: Registrierungscodes zu numerischen Codes ändern
-- Nur die Änderungen für bestehende Datenbank

-- 1. Zuerst bestehende Text-Codes durch numerische ersetzen (falls vorhanden)
UPDATE registration_codes 
SET code = '123456', description = 'Demo-Code für Tests (Numeric)'
WHERE code = 'VYSN-DEMO-2025';

UPDATE registration_codes 
SET code = '987654', description = 'Partner Test Code (Numeric)'
WHERE code = 'PARTNER-TEST-001';

UPDATE registration_codes 
SET code = '111111', description = 'Admin Master Code (Numeric)'
WHERE code = 'VIP-ADMIN-MASTER';

-- 2. Update bestehende email_verifications falls nötig
UPDATE email_verifications 
SET registration_code = '123456' 
WHERE registration_code = 'VYSN-DEMO-2025';

UPDATE email_verifications 
SET registration_code = '987654' 
WHERE registration_code = 'PARTNER-TEST-001';

UPDATE email_verifications 
SET registration_code = '111111' 
WHERE registration_code = 'VIP-ADMIN-MASTER';

-- 3. Update profiles falls nötig
UPDATE profiles 
SET registration_code_used = '123456' 
WHERE registration_code_used = 'VYSN-DEMO-2025';

UPDATE profiles 
SET registration_code_used = '987654' 
WHERE registration_code_used = 'PARTNER-TEST-001';

UPDATE profiles 
SET registration_code_used = '111111' 
WHERE registration_code_used = 'VIP-ADMIN-MASTER';

-- 4. JETZT Spalten-Länge anpassen für numerische Codes (6-8 Ziffern)
ALTER TABLE registration_codes 
ALTER COLUMN code TYPE VARCHAR(8);

ALTER TABLE email_verifications 
ALTER COLUMN registration_code TYPE VARCHAR(8);

ALTER TABLE profiles 
ALTER COLUMN registration_code_used TYPE VARCHAR(8);

-- 5. Neue numerische Beispiel-Codes hinzufügen (falls nicht vorhanden)
INSERT INTO registration_codes (code, description, max_uses, valid_until) VALUES
  ('555000', 'VIP Test Code', 3, '2025-12-31 23:59:59'),
  ('777888', 'Event Demo Code', 20, '2025-06-30 23:59:59'),
  ('999001', 'Partner Demo Code', 50, NULL)
ON CONFLICT (code) DO NOTHING;

-- 6. Cleanup: Entferne alte nicht-numerische Codes falls vorhanden
-- (Optional - nur ausführen wenn sicher, dass alte Codes nicht mehr gebraucht werden)
-- DELETE FROM registration_codes WHERE code !~ '^[0-9]{6,8}$';

-- Verification: Zeige aktuelle numerische Codes
SELECT 
  code, 
  description, 
  max_uses, 
  current_uses, 
  valid_until,
  is_active
FROM registration_codes 
WHERE code ~ '^[0-9]{6,8}$'
ORDER BY code;
