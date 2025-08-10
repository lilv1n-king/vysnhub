-- Custom Registration System Schema
-- Registrierungscodes und E-Mail-Verification

-- 1. Registrierungscodes Tabelle
CREATE TABLE IF NOT EXISTS registration_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(8) UNIQUE NOT NULL, -- 6-8 stellige Zahlencodes
  description TEXT,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_by UUID[] DEFAULT '{}' -- Array der User-IDs die den Code verwendet haben
);

-- 2. E-Mail-Verification Tabelle
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  registration_code VARCHAR(8), -- 6-8 stellige Zahlencodes
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User Account Status erweitern
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS registration_code_used VARCHAR(8); -- 6-8 stellige Zahlencodes

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_registration_codes_code ON registration_codes(code);
CREATE INDEX IF NOT EXISTS idx_registration_codes_active ON registration_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON profiles(email_verified);

-- RLS (Row Level Security) aktivieren
ALTER TABLE registration_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

-- Policies für registration_codes
CREATE POLICY "Anyone can read active registration codes" ON registration_codes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create registration codes" ON registration_codes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own registration codes" ON registration_codes
  FOR UPDATE USING (created_by = auth.uid());

-- Policies für email_verifications
CREATE POLICY "Users can view their own verifications" ON email_verifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Anyone can insert verifications" ON email_verifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own verifications" ON email_verifications
  FOR UPDATE USING (user_id = auth.uid());

-- Funktion zum automatischen Update des updated_at Feldes
CREATE OR REPLACE FUNCTION update_registration_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger für updated_at
CREATE TRIGGER update_registration_codes_updated_at
  BEFORE UPDATE ON registration_codes
  FOR EACH ROW
  EXECUTE PROCEDURE update_registration_codes_updated_at();

-- Funktion zum Cleanup alter Verification-Tokens
CREATE OR REPLACE FUNCTION cleanup_expired_verifications()
RETURNS void AS $$
BEGIN
  DELETE FROM email_verifications 
  WHERE expires_at < NOW() 
  AND verified_at IS NULL;
END;
$$ language 'plpgsql';

-- Beispiel-Registrierungscodes einfügen (einfache Zahlencodes)
INSERT INTO registration_codes (code, description, max_uses, valid_until) VALUES
  ('123456', 'Demo-Code für Tests', 10, '2025-12-31 23:59:59'),
  ('987654', 'Partner Test Code', 5, '2025-06-30 23:59:59'),
  ('111111', 'Admin Master Code', 1, NULL),
  ('555000', 'VIP Test Code', 3, '2025-12-31 23:59:59')
ON CONFLICT (code) DO NOTHING;

-- Kommentare für Dokumentation
COMMENT ON TABLE registration_codes IS 'Verwaltung von Registrierungscodes für kontrollierte Anmeldungen';
COMMENT ON TABLE email_verifications IS 'E-Mail-Verification-Tokens für Custom Auth Flow';
COMMENT ON COLUMN profiles.email_verified IS 'Status der E-Mail-Verifikation';
COMMENT ON COLUMN profiles.registration_code_used IS 'Der bei der Registrierung verwendete Code';
