import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  Project, 
  CreateProjectData, 
  UpdateProjectData,
  ProjectItem 
} from '../models/Project';
import { Order, OrderItem } from '../models/Order';

export class ProjectService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // Set user authentication token for Supabase client
  private async setUserAuth(accessToken: string): Promise<SupabaseClient> {
    try {
      // Create a new Supabase client with the user's session for this request
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing');
      }

      // Create client with user session
      const userSupabase = createClient(supabaseUrl, supabaseKey, {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      });

      // Set session directly
      await userSupabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '', // Not needed since we're just using access token
      });

      console.log('🔐 User auth set for access token:', accessToken.substring(0, 20) + '...');
      
      return userSupabase;
    } catch (error) {
      console.error('Error setting user auth:', error);
      throw new Error('Authentication failed');
    }
  }

  // Alle Projekte eines Users abrufen
  async getUserProjects(userId: string, accessToken: string): Promise<Project[]> {
    console.log('🔍 getUserProjects called with userId:', userId);
    
    try {
      // Get user-authenticated supabase client
      const userSupabase = await this.setUserAuth(accessToken);
      
      const { data, error } = await userSupabase
        .from('user_projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      console.log('📊 Supabase query result:', { data, error });
      console.log('📋 Number of projects found:', data?.length || 0);

      if (error) {
        console.error('❌ Supabase error:', error);
        throw new Error(`Failed to fetch projects: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Get user projects error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch projects');
    }
  }

  // Einzelnes Projekt abrufen
  async getProjectById(projectId: string, userId: string, accessToken: string): Promise<Project> {
    try {
      // Get user-authenticated supabase client
      const userSupabase = await this.setUserAuth(accessToken);
      
      const { data, error } = await userSupabase
        .from('user_projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Project not found');
        }
        throw new Error(`Failed to fetch project: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Get project by ID error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch project');
    }
  }

  // Neues Projekt erstellen
  async createProject(userId: string, projectData: CreateProjectData, accessToken: string): Promise<Project> {
    try {
      // Get user-authenticated supabase client
      const userSupabase = await this.setUserAuth(accessToken);
      
      const newProject = {
        user_id: userId,
        project_name: projectData.project_name,
        project_description: projectData.project_description || null,
        project_location: projectData.project_location || null,
        status: projectData.status || 'planning',
        priority: projectData.priority || 'medium',
        start_date: projectData.start_date || null,
        target_completion_date: projectData.target_completion_date || null,
        estimated_budget: projectData.estimated_budget || null,
        project_notes: projectData.project_notes || null,
        tags: projectData.tags || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await userSupabase
        .from('user_projects')
        .insert([newProject])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create project: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Create project error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create project');
    }
  }

  // Projekt aktualisieren
  async updateProject(projectId: string, userId: string, updateData: UpdateProjectData, accessToken: string): Promise<Project> {
    try {
      // Get user-authenticated supabase client
      const userSupabase = await this.setUserAuth(accessToken);
      
      const updates = {
        ...updateData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await userSupabase
        .from('user_projects')
        .update(updates)
        .eq('id', projectId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Project not found');
        }
        throw new Error(`Failed to update project: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Update project error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update project');
    }
  }

  // Projekt löschen
  async deleteProject(projectId: string, userId: string, accessToken: string): Promise<void> {
    try {
      // Get user-authenticated supabase client
      const userSupabase = await this.setUserAuth(accessToken);
      
      const { error } = await userSupabase
        .from('user_projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to delete project: ${error.message}`);
      }
    } catch (error) {
      console.error('Delete project error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete project');
    }
  }

  // Projekt kopieren
  async duplicateProject(projectId: string, userId: string, accessToken: string): Promise<Project> {
    try {
      // Ursprüngliches Projekt abrufen
      const originalProject = await this.getProjectById(projectId, userId, accessToken);

      // Neue Projekt-Daten erstellen
      const duplicateData: CreateProjectData = {
        project_name: `${originalProject.project_name} (Copy)`,
        project_description: originalProject.project_description,
        project_location: originalProject.project_location,
        status: 'planning', // Kopie immer als "planning" starten
        priority: originalProject.priority,
        estimated_budget: originalProject.estimated_budget,
        project_notes: originalProject.project_notes,
        tags: originalProject.tags
      };

      return await this.createProject(userId, duplicateData, accessToken);
    } catch (error) {
      console.error('Duplicate project error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to duplicate project');
    }
  }

  // Projekt-Statistiken abrufen
  async getProjectStats(userId: string, accessToken: string): Promise<{
    total: number;
    planning: number;
    active: number;
    completed: number;
    on_hold: number;
    cancelled: number;
  }> {
    try {
      // Get user-authenticated supabase client
      const userSupabase = await this.setUserAuth(accessToken);
      
      const { data, error } = await userSupabase
        .from('user_projects')
        .select('status')
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to fetch project stats: ${error.message}`);
      }

      const stats = {
        total: data.length,
        planning: 0,
        active: 0,
        completed: 0,
        on_hold: 0,
        cancelled: 0
      };

      data.forEach(project => {
        if (project.status in stats) {
          stats[project.status as keyof typeof stats]++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Get project stats error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch project statistics');
    }
  }

  // Projekte nach Status filtern
  async getProjectsByStatus(userId: string, status: Project['status'], accessToken: string): Promise<Project[]> {
    try {
      // Get user-authenticated supabase client
      const userSupabase = await this.setUserAuth(accessToken);
      
      const { data, error } = await userSupabase
        .from('user_projects')
        .select('*')
        .eq('user_id', userId)
        .eq('status', status)
        .order('updated_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch projects by status: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Get projects by status error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch projects by status');
    }
  }

  // Check project orders and determine what can be ordered
  async getProjectOrderStatus(projectId: string, accessToken: string): Promise<{
    hasOrders: boolean;
    lastOrder?: Order;
    orderedItems: { productId: number; totalQuantity: number }[];
    availableToOrder: { productId: number; availableQuantity: number }[];
  }> {
    try {
      const userSupabase = await this.setUserAuth(accessToken);

      // Get all orders for this project
      const { data: orders, error: ordersError } = await userSupabase
        .from('orders')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (ordersError) {
        throw new Error(`Failed to fetch project orders: ${ordersError.message}`);
      }

      if (!orders || orders.length === 0) {
        // No orders yet - all project items can be ordered
        const { data: projectItems, error: itemsError } = await userSupabase
          .from('project_items')
          .select('product_id, quantity')
          .eq('project_id', projectId);

        if (itemsError) {
          throw new Error(`Failed to fetch project items: ${itemsError.message}`);
        }

        const availableToOrder = (projectItems || []).map(item => ({
          productId: item.product_id,
          availableQuantity: item.quantity
        }));

        return {
          hasOrders: false,
          orderedItems: [],
          availableToOrder
        };
      }

      // Get all order items for this project
      const orderIds = orders.map(order => order.id);
      const { data: orderItems, error: orderItemsError } = await userSupabase
        .from('order_items')
        .select('product_id, quantity')
        .in('order_id', orderIds);

      if (orderItemsError) {
        throw new Error(`Failed to fetch order items: ${orderItemsError.message}`);
      }

      // Calculate total ordered quantities per product
      const orderedQuantities: { [productId: number]: number } = {};
      (orderItems || []).forEach(item => {
        orderedQuantities[item.product_id] = (orderedQuantities[item.product_id] || 0) + item.quantity;
      });

      // Get current project items
      const { data: projectItems, error: itemsError } = await userSupabase
        .from('project_items')
        .select('product_id, quantity')
        .eq('project_id', projectId);

      if (itemsError) {
        throw new Error(`Failed to fetch project items: ${itemsError.message}`);
      }

      // Calculate what can still be ordered
      const availableToOrder = (projectItems || []).map(item => {
        const alreadyOrdered = orderedQuantities[item.product_id] || 0;
        const availableQuantity = Math.max(0, item.quantity - alreadyOrdered);
        
        return {
          productId: item.product_id,
          availableQuantity
        };
      }).filter(item => item.availableQuantity > 0);

      const orderedItems = Object.entries(orderedQuantities).map(([productId, quantity]) => ({
        productId: parseInt(productId),
        totalQuantity: quantity
      }));

      return {
        hasOrders: true,
        lastOrder: orders[0],
        orderedItems,
        availableToOrder
      };

    } catch (error) {
      console.error('Get project order status error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to check project order status');
    }
  }
}