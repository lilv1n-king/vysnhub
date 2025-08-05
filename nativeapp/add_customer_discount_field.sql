-- Add customer_discount field to user_projects table
-- This field stores the project-specific customer discount percentage

ALTER TABLE user_projects 
ADD COLUMN IF NOT EXISTS customer_discount DECIMAL(5,2) DEFAULT 0.00;

-- Add a comment to explain the field
COMMENT ON COLUMN user_projects.customer_discount IS 'Project-specific customer discount percentage (e.g., 5.00 for 5%)';

-- Update existing records to have 0% discount
UPDATE user_projects 
SET customer_discount = 0.00 
WHERE customer_discount IS NULL;