import { apiService } from './apiService';
import { API_ENDPOINTS, ApiResponse } from '../config/api';
import { Project, ProjectItem, CreateProjectData, UpdateProjectData } from '../types/project';

export interface CreateProjectItemData {
  product_id: string;
  quantity: number;
  unit_price?: number;
  notes?: string;
}

export interface UpdateProjectItemData {
  quantity?: number;
  unit_price?: number;
  notes?: string;
}

class ProjectService {
  
  // Get all user projects
  async getUserProjects(): Promise<Project[]> {
    const response = await apiService.get<Project[]>(API_ENDPOINTS.USER_PROJECTS);
    return response.data || [];
  }

  // Get single project by ID
  async getProject(id: string): Promise<Project | null> {
    const response = await apiService.get<Project>(`${API_ENDPOINTS.USER_PROJECTS}/${id}`);
    return response.data || null;
  }

  // Create new project
  async createProject(projectData: CreateProjectData): Promise<Project> {
    const response = await apiService.post<Project>(API_ENDPOINTS.USER_PROJECTS, projectData);
    if (!response.data) {
      throw new Error('Failed to create project');
    }
    return response.data;
  }

  // Update project
  async updateProject(id: string, updateData: UpdateProjectData): Promise<Project> {
    const response = await apiService.put<Project>(`${API_ENDPOINTS.USER_PROJECTS}/${id}`, updateData);
    if (!response.data) {
      throw new Error('Failed to update project');
    }
    return response.data;
  }

  // Delete project
  async deleteProject(id: string): Promise<void> {
    await apiService.delete(`${API_ENDPOINTS.USER_PROJECTS}/${id}`);
  }

  // Duplicate project
  async duplicateProject(id: string): Promise<Project> {
    const response = await apiService.post<Project>(`${API_ENDPOINTS.USER_PROJECTS}/${id}/duplicate`);
    if (!response.data) {
      throw new Error('Failed to duplicate project');
    }
    return response.data;
  }

  // Get project items
  async getProjectItems(projectId: string): Promise<ProjectItem[]> {
    const response = await apiService.get<ProjectItem[]>(`${API_ENDPOINTS.USER_PROJECTS}/${projectId}/items`);
    return response.data || [];
  }

  // Add item to project
  async addProjectItem(projectId: string, itemData: CreateProjectItemData): Promise<ProjectItem> {
    const response = await apiService.post<ProjectItem>(
      `${API_ENDPOINTS.USER_PROJECTS}/${projectId}/items`,
      itemData
    );
    if (!response.data) {
      throw new Error('Failed to add item to project');
    }
    return response.data;
  }

  // Update project item
  async updateProjectItem(projectId: string, itemId: string, updateData: UpdateProjectItemData): Promise<ProjectItem> {
    const response = await apiService.put<ProjectItem>(
      `${API_ENDPOINTS.USER_PROJECTS}/${projectId}/items/${itemId}`,
      updateData
    );
    if (!response.data) {
      throw new Error('Failed to update project item');
    }
    return response.data;
  }

  // Remove item from project
  async removeProjectItem(projectId: string, itemId: string): Promise<void> {
    await apiService.delete(`${API_ENDPOINTS.USER_PROJECTS}/${projectId}/items/${itemId}`);
  }

  // Get existing project item (for quantity updates)
  async getProjectItem(projectId: string, productId: string): Promise<ProjectItem | null> {
    try {
      const response = await apiService.get<ProjectItem>(
        `${API_ENDPOINTS.USER_PROJECTS}/${projectId}/items/by-product/${productId}`
      );
      return response.data || null;
    } catch (error) {
      // If item doesn't exist, return null
      return null;
    }
  }

  // Add or update project item (convenience method)
  async addOrUpdateProjectItem(projectId: string, productId: string, quantity: number, unitPrice?: number): Promise<ProjectItem> {
    // Check if item already exists
    const existingItem = await this.getProjectItem(projectId, productId);
    
    if (existingItem) {
      // Update existing item quantity
      return await this.updateProjectItem(projectId, existingItem.id, {
        quantity: existingItem.quantity + quantity,
        unit_price: unitPrice
      });
    } else {
      // Create new item
      return await this.addProjectItem(projectId, {
        product_id: productId,
        quantity: quantity,
        unit_price: unitPrice
      });
    }
  }
}

export const projectService = new ProjectService();