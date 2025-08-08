import { Request, Response } from 'express';
import { ProjectService } from '../services/projectService';
import { CreateProjectData, UpdateProjectData, Project } from '../models/Project';

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  // GET /api/projects
  getProjects = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
        return;
      }

      const { status } = req.query;

      let projects;
      if (status && typeof status === 'string') {
        projects = await this.projectService.getProjectsByStatus(req.user.id, status as Project['status'], req.accessToken!);
      } else {
        projects = await this.projectService.getUserProjects(req.user.id, req.accessToken!);
      }

      res.status(200).json({
        success: true,
        message: 'Projects retrieved successfully',
        data: projects
      });
    } catch (error) {
      console.error('Get projects controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get projects',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };

  // GET /api/projects/stats
  getProjectStats = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
        return;
      }

      const stats = await this.projectService.getProjectStats(req.user.id, req.accessToken!);

      res.status(200).json({
        success: true,
        message: 'Project statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      console.error('Get project stats controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get project statistics',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };

  // GET /api/projects/:id
  getProjectById = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
        return;
      }

      const { id } = req.params;
      const project = await this.projectService.getProjectById(id, req.user.id, req.accessToken!);

      res.status(200).json({
        success: true,
        message: 'Project retrieved successfully',
        data: project
      });
    } catch (error) {
      console.error('Get project by ID controller error:', error);
      
      if (error instanceof Error && error.message === 'Project not found') {
        res.status(404).json({
          success: false,
          error: 'Project not found',
          message: 'The requested project does not exist or you do not have access to it'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to get project',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };

  // POST /api/projects
  createProject = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
        return;
      }

      const projectData: CreateProjectData = req.body;
      const project = await this.projectService.createProject(req.user.id, projectData, req.accessToken!);

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project
      });
    } catch (error) {
      console.error('Create project controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create project',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };

  // PUT /api/projects/:id
  updateProject = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
        return;
      }

      const { id } = req.params;
      const updateData: UpdateProjectData = req.body;
      
      const updatedProject = await this.projectService.updateProject(id, req.user.id, updateData, req.accessToken!);

      res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: updatedProject
      });
    } catch (error) {
      console.error('Update project controller error:', error);

      if (error instanceof Error && error.message === 'Project not found') {
        res.status(404).json({
          success: false,
          error: 'Project not found',
          message: 'The requested project does not exist or you do not have access to it'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update project',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };

  // DELETE /api/projects/:id
  deleteProject = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
        return;
      }

      const { id } = req.params;
      await this.projectService.deleteProject(id, req.user.id, req.accessToken!);

      res.status(200).json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      console.error('Delete project controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete project',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };

  // POST /api/projects/:id/duplicate
  duplicateProject = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
        return;
      }

      const { id } = req.params;
      const duplicatedProject = await this.projectService.duplicateProject(id, req.user.id, req.accessToken!);

      res.status(201).json({
        success: true,
        message: 'Project duplicated successfully',
        data: duplicatedProject
      });
    } catch (error) {
      console.error('Duplicate project controller error:', error);

      if (error instanceof Error && error.message === 'Project not found') {
        res.status(404).json({
          success: false,
          error: 'Project not found',
          message: 'The requested project does not exist or you do not have access to it'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to duplicate project',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };

  // GET /api/user-projects/:id/order-status
  getProjectOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
        return;
      }

      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Project ID is required'
        });
        return;
      }

      const orderStatus = await this.projectService.getProjectOrderStatus(id, req.accessToken!);

      res.status(200).json({
        success: true,
        data: orderStatus
      });
    } catch (error) {
      console.error('Get project order status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get project order status',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };
}