import { Request, Response } from 'express';
import { ProjectService, CreateProjectDto, UpdateProjectDto } from '../services/project.service';

const projectService = new ProjectService();

// Create a new project
export const createProject = async (req: Request, res: Response) => {
  try {
    // Get user ID from auth middleware
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }
    
    const projectData: CreateProjectDto = req.body;
    
    const project = await projectService.createProject(userId, projectData);
    
    return res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('Create project error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error creating project',
    });
  }
};

// Get all projects for the authenticated user
export const getAllProjects = async (req: Request, res: Response) => {
  try {
    // Get user ID from auth middleware
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }
    
    const projects = await projectService.getAllProjects(userId);
    
    return res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error('Get projects error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error retrieving projects',
    });
  }
};

// Get a project by ID
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const projectId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID',
      });
    }
    
    const project = await projectService.getProjectById(projectId, userId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }
    
    return res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('Get project error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error retrieving project',
    });
  }
};

// Update a project
export const updateProject = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const projectId = parseInt(req.params.id);
    const projectData: UpdateProjectDto = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID',
      });
    }
    
    const updatedProject = await projectService.updateProject(projectId, userId, projectData);
    
    if (!updatedProject) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }
    
    return res.json({
      success: true,
      data: updatedProject,
    });
  } catch (error) {
    console.error('Update project error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error updating project',
    });
  }
};

// Delete a project
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const projectId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID',
      });
    }
    
    const success = await projectService.deleteProject(projectId, userId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }
    
    return res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Delete project error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error deleting project',
    });
  }
};

// Get project statistics
export const getProjectStatistics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const projectId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID',
      });
    }
    
    const statistics = await projectService.getProjectStatistics(projectId, userId);
    
    if (!statistics) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }
    
    return res.json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    console.error('Get project statistics error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error retrieving project statistics',
    });
  }
};
