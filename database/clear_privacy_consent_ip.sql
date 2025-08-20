-- Clear privacy consent IP addresses from profiles table
-- This removes stored IP addresses for privacy compliance

UPDATE profiles 
SET privacy_consent_ip = NULL 
WHERE privacy_consent_ip IS NOT NULL;

-- Verify the update
SELECT 
    COUNT(*) as total_profiles,
    COUNT(privacy_consent_ip) as profiles_with_ip_remaining
FROM profiles;

-- Optional: Also clear other IP-related fields if they exist
-- Uncomment the lines below if you want to clear these fields as well:

-- UPDATE profiles 
-- SET 
--     last_login_ip = NULL,
--     registration_ip = NULL
-- WHERE last_login_ip IS NOT NULL OR registration_ip IS NOT NULL;

