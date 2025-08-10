-- Datenschutz-Zustimmung Schema
-- Erstellt eine Tabelle für die Nachverfolgung von Datenschutz-Einwilligungen

CREATE TABLE IF NOT EXISTS privacy_consents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_version VARCHAR(20) NOT NULL DEFAULT '1.0',
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  withdrawn_date TIMESTAMP WITH TIME ZONE NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_privacy_consents_user_id ON privacy_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_consents_consent_date ON privacy_consents(consent_date);

-- RLS (Row Level Security) aktivieren
ALTER TABLE privacy_consents ENABLE ROW LEVEL SECURITY;

-- Policy: Benutzer können nur ihre eigenen Einwilligungen sehen
CREATE POLICY "Users can view own privacy consents" ON privacy_consents
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Benutzer können ihre eigenen Einwilligungen erstellen
CREATE POLICY "Users can insert own privacy consents" ON privacy_consents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Benutzer können ihre eigenen Einwilligungen aktualisieren
CREATE POLICY "Users can update own privacy consents" ON privacy_consents
  FOR UPDATE USING (auth.uid() = user_id);

-- Funktion zum automatischen Update des updated_at Feldes
CREATE OR REPLACE FUNCTION update_privacy_consents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger für updated_at
CREATE TRIGGER update_privacy_consents_updated_at
  BEFORE UPDATE ON privacy_consents
  FOR EACH ROW
  EXECUTE PROCEDURE update_privacy_consents_updated_at();

-- Initialer Datenschutz-Version Eintrag
INSERT INTO privacy_consents (user_id, consent_version, consent_given, consent_date)
VALUES (NULL, '1.0', false, NOW())
ON CONFLICT DO NOTHING;
