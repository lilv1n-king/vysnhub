-- Add admin role and standard discount fields to profiles table
-- This extends the existing profiles table for admin functionality

-- Add admin role field
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Add standard discount field for customers
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS standard_discount DECIMAL(5,2) DEFAULT 0.00;

-- Add account status field for admin approval workflow
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'pending' 
CHECK (account_status IN ('pending', 'approved', 'rejected', 'suspended'));

-- Add admin notes field for internal admin notes
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);

-- Comments for documentation
COMMENT ON COLUMN profiles.is_admin IS 'True if user has admin privileges';
COMMENT ON COLUMN profiles.standard_discount IS 'Standard discount percentage for this customer (e.g., 5.00 for 5%)';
COMMENT ON COLUMN profiles.account_status IS 'Account approval status for admin workflow';
COMMENT ON COLUMN profiles.admin_notes IS 'Internal admin notes about this user';

-- Update existing records to have 0% discount and approved status for verified users
UPDATE profiles 
SET standard_discount = 0.00,
    account_status = CASE 
        WHEN email_verified = true THEN 'approved' 
        ELSE 'pending' 
    END
WHERE standard_discount IS NULL OR account_status IS NULL;

-- Create admin user policy (admins can see all profiles)
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.is_admin = true
        )
    );

-- Create admin user update policy (admins can update all profiles)
CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.is_admin = true
        )
    );