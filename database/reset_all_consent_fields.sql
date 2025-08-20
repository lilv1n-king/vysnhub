-- Reset ALL consent-related fields in profiles table
-- This will force all users to go through consent screen again

UPDATE profiles 
SET 
    -- Privacy consent fields
    privacy_consent_given = NULL,
    privacy_consent_version = NULL,
    privacy_consent_date = NULL,
    privacy_consent_ip = NULL,
    privacy_consent_user_agent = NULL,
    privacy_withdrawn_date = NULL,
    
    -- Main consent fields that the app checks
    analytics_consent = NULL,  -- This is what the app checks!
    marketing_consent = NULL
WHERE id IS NOT NULL;

-- Verify the update
SELECT 
    id,
    email,
    first_name,
    analytics_consent,
    marketing_consent,
    privacy_consent_given,
    privacy_consent_date
FROM profiles 
ORDER BY created_at DESC;

-- Alternative: Only reset analytics_consent to force consent screen
-- UPDATE profiles SET analytics_consent = NULL WHERE analytics_consent = true;

