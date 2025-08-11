export interface Project {
  id: string;
  user_id: string;
  project_name: string;
  project_description?: string;
  project_location?: string;
  status: 'planning' | 'active' | 'completed' | 'on_hold' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  start_date?: string;
  target_completion_date?: string;
  actual_completion_date?: string;
  estimated_budget?: number;
  actual_cost?: number;
  project_notes?: string;
  tags?: string[];
  customer_discount?: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectItem {
  id: string;
  project_id: string;
  product_id: string;
  quantity: number;
  unit_price?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectData {
  project_name: string;
  project_description?: string;
  project_location?: string;
  status?: 'planning' | 'active';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  start_date?: string;
  target_completion_date?: string;
  estimated_budget?: number;
  customer_discount?: number;
  project_notes?: string;
}

export interface UpdateProjectData {
  project_name?: string;
  project_description?: string;
  project_location?: string;
  status?: 'planning' | 'active' | 'completed' | 'on_hold' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  project_notes?: string;
}