-- =============================================
-- VYSN Hub Multi-Tenant Authentication Schema
-- =============================================
-- Fixed version without permission issues

-- =============================================
-- 1. PROFILES TABLE (Customer Information)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    
    -- Basis Informationen
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    company_name TEXT,
    
    -- Kontakt Details
    phone TEXT,
    address_line_1 TEXT,
    address_line_2 TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'Deutschland',
    
    -- Business Informationen
    vat_number TEXT, -- Umsatzsteuer-ID
    customer_number TEXT UNIQUE, -- Interne Kundennummer
    customer_type TEXT DEFAULT 'standard' CHECK (customer_type IN ('standard', 'premium', 'wholesale', 'partner')),
    
    -- Rabatt System
    discount_percentage NUMERIC(5,2) DEFAULT 0.00 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    discount_reason TEXT, -- Grund für Rabatt
    discount_valid_until DATE,
    
    -- Account Status
    account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'inactive', 'suspended', 'pending')),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Preferences
    language TEXT DEFAULT 'de',
    currency TEXT DEFAULT 'EUR',
    newsletter_subscription BOOLEAN DEFAULT false,
    marketing_emails BOOLEAN DEFAULT false,
    
    -- System Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- 2. USER PROJECTS (Customer Projects)
-- =============================================
CREATE TABLE IF NOT EXISTS user_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Project Information
    project_name TEXT NOT NULL,
    project_description TEXT,
    project_location TEXT,
    
    -- Project Status
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'on_hold', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Dates
    start_date DATE,
    target_completion_date DATE,
    actual_completion_date DATE,
    
    -- Financial
    estimated_budget NUMERIC(12,2),
    actual_cost NUMERIC(12,2),
    
    -- Metadata
    project_notes TEXT,
    tags TEXT[], -- Array für flexible Kategorisierung
    
    -- System Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. PROJECT ITEMS (Products in Projects)
-- =============================================
CREATE TABLE IF NOT EXISTS project_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES user_projects(id) ON DELETE CASCADE NOT NULL,
    product_id INTEGER REFERENCES products(id) NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Item Details
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(10,2), -- Preis zum Zeitpunkt der Hinzufügung
    discount_applied NUMERIC(5,2) DEFAULT 0.00,
    
    -- Installation Details
    installation_notes TEXT,
    room_location TEXT,
    installation_status TEXT DEFAULT 'planned' CHECK (installation_status IN ('planned', 'ordered', 'delivered', 'installed', 'tested')),
    
    -- Dates
    planned_installation_date DATE,
    actual_installation_date DATE,
    
    -- System Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. ORDERS (Customer Orders)
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES user_projects(id) ON DELETE SET NULL,
    
    -- Order Information
    order_number TEXT UNIQUE NOT NULL,
    order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    order_type TEXT DEFAULT 'standard' CHECK (order_type IN ('standard', 'reorder', 'replacement', 'emergency')),
    
    -- Financial
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) DEFAULT 0,
    tax_amount NUMERIC(12,2) DEFAULT 0,
    shipping_cost NUMERIC(12,2) DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    
    -- Shipping
    shipping_address_line_1 TEXT,
    shipping_address_line_2 TEXT,
    shipping_city TEXT,
    shipping_postal_code TEXT,
    shipping_country TEXT,
    shipping_method TEXT,
    tracking_number TEXT,
    
    -- Dates
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    
    -- Notes
    customer_notes TEXT,
    internal_notes TEXT,
    
    -- System Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. ORDER ITEMS (Products in Orders)
-- =============================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id INTEGER REFERENCES products(id) NOT NULL,
    
    -- Item Details
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL,
    discount_percentage NUMERIC(5,2) DEFAULT 0.00,
    line_total NUMERIC(12,2) NOT NULL,
    
    -- Product snapshot (for historical data)
    product_name TEXT NOT NULL, -- Name zum Zeitpunkt der Bestellung
    product_sku TEXT, -- SKU zum Zeitpunkt der Bestellung
    
    -- System Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. EVENTS (Company Events)
-- =============================================
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Event Information
    event_name TEXT NOT NULL,
    event_description TEXT,
    event_type TEXT DEFAULT 'networking' CHECK (event_type IN ('networking', 'training', 'product_launch', 'conference', 'webinar')),
    
    -- Location
    event_location TEXT,
    venue_name TEXT,
    address_line_1 TEXT,
    address_line_2 TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT,
    
    -- Virtual Event
    is_virtual BOOLEAN DEFAULT false,
    meeting_link TEXT,
    meeting_password TEXT,
    
    -- Dates and Capacity
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    
    -- Event Status
    event_status TEXT DEFAULT 'upcoming' CHECK (event_status IN ('draft', 'upcoming', 'ongoing', 'completed', 'cancelled')),
    registration_required BOOLEAN DEFAULT true,
    
    -- Costs
    ticket_price NUMERIC(10,2) DEFAULT 0,
    early_bird_price NUMERIC(10,2),
    early_bird_deadline TIMESTAMP WITH TIME ZONE,
    
    -- System Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 7. EVENT REGISTRATIONS (User Event Sign-ups)
-- =============================================
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Registration Details
    registration_status TEXT DEFAULT 'registered' CHECK (registration_status IN ('registered', 'confirmed', 'attended', 'no_show', 'cancelled')),
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Payment (if applicable)
    payment_status TEXT DEFAULT 'free' CHECK (payment_status IN ('free', 'pending', 'paid', 'refunded')),
    amount_paid NUMERIC(10,2) DEFAULT 0,
    
    -- Special Requirements
    dietary_restrictions TEXT,
    special_requirements TEXT,
    notes TEXT,
    
    -- System Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one registration per user per event
    UNIQUE(event_id, user_id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Profiles
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles (email);
CREATE INDEX IF NOT EXISTS profiles_customer_number_idx ON profiles (customer_number);
CREATE INDEX IF NOT EXISTS profiles_customer_type_idx ON profiles (customer_type);
CREATE INDEX IF NOT EXISTS profiles_account_status_idx ON profiles (account_status);

-- User Projects
CREATE INDEX IF NOT EXISTS user_projects_user_id_idx ON user_projects (user_id);
CREATE INDEX IF NOT EXISTS user_projects_status_idx ON user_projects (status);
CREATE INDEX IF NOT EXISTS user_projects_priority_idx ON user_projects (priority);

-- Project Items
CREATE INDEX IF NOT EXISTS project_items_project_id_idx ON project_items (project_id);
CREATE INDEX IF NOT EXISTS project_items_user_id_idx ON project_items (user_id);
CREATE INDEX IF NOT EXISTS project_items_product_id_idx ON project_items (product_id);

-- Orders
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders (user_id);
CREATE INDEX IF NOT EXISTS orders_project_id_idx ON orders (project_id);
CREATE INDEX IF NOT EXISTS orders_order_number_idx ON orders (order_number);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (order_status);
CREATE INDEX IF NOT EXISTS orders_date_idx ON orders (order_date);

-- Order Items
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items (order_id);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON order_items (product_id);

-- Events
CREATE INDEX IF NOT EXISTS events_start_datetime_idx ON events (start_datetime);
CREATE INDEX IF NOT EXISTS events_event_type_idx ON events (event_type);
CREATE INDEX IF NOT EXISTS events_status_idx ON events (event_status);

-- Event Registrations
CREATE INDEX IF NOT EXISTS event_registrations_event_id_idx ON event_registrations (event_id);
CREATE INDEX IF NOT EXISTS event_registrations_user_id_idx ON event_registrations (user_id);
CREATE INDEX IF NOT EXISTS event_registrations_status_idx ON event_registrations (registration_status);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User Projects: Users can only see/edit their own projects
CREATE POLICY "Users can view own projects" ON user_projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON user_projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON user_projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON user_projects
    FOR DELETE USING (auth.uid() = user_id);

-- Project Items: Users can only see/edit items in their own projects
CREATE POLICY "Users can view own project items" ON project_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own project items" ON project_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own project items" ON project_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own project items" ON project_items
    FOR DELETE USING (auth.uid() = user_id);

-- Orders: Users can only see/edit their own orders
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Order Items: Users can only see items in their own orders
CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM orders WHERE orders.id = order_items.order_id));

CREATE POLICY "Users can insert own order items" ON order_items
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM orders WHERE orders.id = order_items.order_id));

-- Event Registrations: Users can only see/edit their own registrations
CREATE POLICY "Users can view own event registrations" ON event_registrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own event registrations" ON event_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own event registrations" ON event_registrations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own event registrations" ON event_registrations
    FOR DELETE USING (auth.uid() = user_id);

-- Events: Everyone can read events (public)
CREATE POLICY "Anyone can view events" ON events
    FOR SELECT USING (true);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_projects_updated_at BEFORE UPDATE ON user_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_items_updated_at BEFORE UPDATE ON project_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_registrations_updated_at BEFORE UPDATE ON event_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate customer number
CREATE OR REPLACE FUNCTION generate_customer_number()
RETURNS TEXT AS $$
DECLARE
    customer_num TEXT;
    counter INTEGER;
BEGIN
    -- Get the next customer number (starting from CUST000001)
    SELECT COALESCE(MAX(CAST(SUBSTRING(customer_number FROM 5) AS INTEGER)), 0) + 1
    INTO counter
    FROM profiles
    WHERE customer_number ~ '^CUST[0-9]+$';
    
    customer_num := 'CUST' || LPAD(counter::TEXT, 6, '0');
    RETURN customer_num;
END;
$$ LANGUAGE plpgsql;

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_num TEXT;
    year_str TEXT;
    counter INTEGER;
BEGIN
    year_str := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Get the next order number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 9) AS INTEGER)), 0) + 1
    INTO counter
    FROM orders
    WHERE order_number ~ ('^ORD' || year_str || '[0-9]+$');
    
    order_num := 'ORD' || year_str || LPAD(counter::TEXT, 4, '0');
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate customer number if not provided
CREATE OR REPLACE FUNCTION set_customer_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.customer_number IS NULL THEN
        NEW.customer_number := generate_customer_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_customer_number_trigger
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_customer_number();

-- Trigger to auto-generate order number if not provided
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();

-- Function to update event participant count
CREATE OR REPLACE FUNCTION update_event_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE events 
        SET current_participants = current_participants + 1 
        WHERE id = NEW.event_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE events 
        SET current_participants = current_participants - 1 
        WHERE id = OLD.event_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_participant_count_trigger
    AFTER INSERT OR DELETE ON event_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_event_participant_count();

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- Insert sample events
INSERT INTO events (event_name, event_description, event_type, start_datetime, end_datetime, event_location, city, max_participants) VALUES
('Lighting Professional Meetup Berlin', 'Meet other lighting professionals and electrical engineers for a relaxed exchange about current projects, new technologies and industry trends.', 'networking', '2025-01-30 18:00:00+01', '2025-01-30 21:00:00+01', 'Café Lichtblick, Unter den Linden 15', 'Berlin', 50),
('LED Technology Workshop', 'Hands-on workshop about the latest LED technologies and installation techniques.', 'training', '2025-02-15 09:00:00+01', '2025-02-15 17:00:00+01', 'VYSN Training Center', 'Munich', 25),
('Smart Lighting Webinar', 'Online seminar about intelligent lighting systems and IoT integration.', 'webinar', '2025-03-10 14:00:00+01', '2025-03-10 15:30:00+01', null, null, 100)
ON CONFLICT DO NOTHING;

-- Comments
COMMENT ON TABLE profiles IS 'Customer profiles with authentication and business information';
COMMENT ON TABLE user_projects IS 'Customer lighting projects with status tracking';
COMMENT ON TABLE project_items IS 'Products/items within customer projects';
COMMENT ON TABLE orders IS 'Customer orders with full order management';
COMMENT ON TABLE order_items IS 'Individual items within orders';
COMMENT ON TABLE events IS 'Company events and webinars';
COMMENT ON TABLE event_registrations IS 'Customer registrations for events';