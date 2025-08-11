export interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  phone?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  vat_number?: string;
  customer_number?: string;
  customer_type: 'standard' | 'premium' | 'wholesale' | 'partner';
  discount_percentage: number;
  discount_reason?: string;
  discount_valid_until?: string;
  account_status: 'active' | 'inactive' | 'suspended' | 'pending';
  verified_at?: string;
  language: string;
  currency: string;
  newsletter_subscription: boolean;
  marketing_emails: boolean;
  analytics_consent?: boolean;
  marketing_consent?: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface UserProject {
  id: string;
  user_id: string;
  project_name: string;
  project_description?: string;
  project_location?: string;
  status: 'planning' | 'active' | 'completed' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date?: string;
  target_completion_date?: string;
  actual_completion_date?: string;
  estimated_budget?: number;
  actual_cost?: number;
  project_notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface ProjectItem {
  id: string;
  project_id: string;
  product_id: number;
  user_id: string;
  quantity: number;
  unit_price?: number;
  discount_applied: number;
  installation_notes?: string;
  room_location?: string;
  installation_status: 'planned' | 'ordered' | 'delivered' | 'installed' | 'tested';
  planned_installation_date?: string;
  actual_installation_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  project_id?: string;
  order_number: string;
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  order_type: 'standard' | 'reorder' | 'replacement' | 'emergency';
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_cost: number;
  total_amount: number;
  shipping_address_line_1?: string;
  shipping_address_line_2?: string;
  shipping_city?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  shipping_method?: string;
  tracking_number?: string;
  order_date: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  customer_notes?: string;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: number;
  quantity: number;
  unit_price: number;
  discount_percentage: number;
  line_total: number;
  product_name: string;
  product_sku?: string;
  created_at: string;
}

export interface Event {
  id: string;
  event_name: string;
  event_description?: string;
  event_type: 'networking' | 'training' | 'product_launch' | 'conference' | 'webinar';
  event_location?: string;
  venue_name?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  is_virtual: boolean;
  meeting_link?: string;
  meeting_password?: string;
  start_datetime: string;
  end_datetime: string;
  registration_deadline?: string;
  max_participants?: number;
  current_participants: number;
  event_status: 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  registration_required: boolean;
  ticket_price: number;
  early_bird_price?: number;
  early_bird_deadline?: string;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  registration_status: 'registered' | 'confirmed' | 'attended' | 'no_show' | 'cancelled';
  registration_date: string;
  payment_status: 'free' | 'pending' | 'paid' | 'refunded';
  amount_paid: number;
  dietary_restrictions?: string;
  special_requirements?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile?: Profile;
}

export interface SignUpData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}