export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
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
  privacy_consent_given?: boolean;
  privacy_consent_version?: string;
  privacy_consent_date?: string;
  privacy_consent_ip?: string;
  privacy_consent_user_agent?: string;
  privacy_withdrawn_date?: string;
  // Vereinfachte Consent-Felder
  analytics_consent?: boolean;
  marketing_consent?: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  phone?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  vat_number?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// AuthResponse wird nicht mehr benötigt - Supabase handhabt Tokens
// export interface AuthResponse {
//   user: User;
//   token: string;
//   refreshToken: string;
// }

export interface UpdateUserData {
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
  analytics_consent?: boolean;
  marketing_consent?: boolean;
  privacy_consent_given?: boolean;
  privacy_consent_version?: string;
  privacy_consent_date?: string;
  privacy_consent_ip?: string;
  privacy_consent_user_agent?: string;
}