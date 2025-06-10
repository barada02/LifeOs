import { Request, Response } from 'express';
import { MilestoneService, CreateMilestoneDto, UpdateMilestoneDto } from '../services/milestone.service';
import { ProjectService } from '../services/project.service';

const milestoneService = new MilestoneService();
const projectService = new ProjectService();

// Create a new milestone
export const createMilestone = async (req: Request, res: Response) => {
  try {
    // Get user ID from auth middleware
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }
    
    const milestoneData: CreateMilestoneDto = req.body;
    
    // Verify the project exists and belongs to the user
    const project = await projectService.getProjectById(milestoneData.projectId, userId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or does not belong to user',
      });
    }
    
    const milestone = await milestoneService.createMilestone(milestoneData);
    
    return res.status(201).json({
      success: true,
      data: milestone,
    });
  } catch (error) {
    console.error('Create milestone error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error creating milestone',
    });
  }
};

// Get milestones by project
export const getMilestonesByProject = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const projectId = parseInt(req.params.projectId);
    
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
    
    // Verify the project exists and belongs to the user
    const project = await projectService.getProjectById(projectId, userId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or does not belong to user',
      });
    }
    
    const milestones = await milestoneService.getMilestonesByProject(projectId);
    
    return res.json({
      success: true,
      data: milestones,
    });
  } catch (error) {
    console.error('Get project milestones error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error retrieving project milestones',
    });
  }
};

// Get a milestone by ID
export const getMilestoneById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const milestoneId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }
    
    if (isNaN(milestoneId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid milestone ID',
      });
    }
    
    const milestone = await milestoneService.getMilestoneById(milestoneId);
    
    if (!milestone) {
      return res.status(404).json({
        success: false,
        error: 'Milestone not found',
      });
    }
    
    // Verify the milestone's project belongs to the user
    const project = await projectService.getProjectById(milestone.projectId, userId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or does not belong to user',
      });
    }
    
    return res.json({
      success: true,
      data: milestone,
    });
  } catch (error) {
    console.error('Get milestone error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error retrieving milestone',
    });
  }
};

// Update a milestone
export const updateMilestone = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const milestoneId = parseInt(req.params.id);
    const milestoneData: UpdateMilestoneDto = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }
    
    if (isNaN(milestoneId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid milestone ID',
      });
    }
    
    // Get the milestone to verify ownership
    const milestone = await milestoneService.getMilestoneById(milestoneId);
    
    if (!milestone) {
      return res.status(404).json({
        success: false,
        error: 'Milestone not found',
      });
    }
    
    // Verify the milestone's project belongs to the user
    const project = await projectService.getProjectById(milestone.projectId, userId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or does not belong to user',
      });
    }
    
    const updatedMilestone = await milestoneService.updateMilestone(milestoneId, milestoneData);
    
    return res.json({
      success: true,
      data: updatedMilestone,
    });
  } catch (error) {
    console.error('Update milestone error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error updating milestone',
    });
  }
};

// Delete a milestone
export const deleteMilestone = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const milestoneId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }
    
    if (isNaN(milestoneId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid milestone ID',
      });
    }
    
    // Get the milestone to verify ownership
    const milestone = await milestoneService.getMilestoneById(milestoneId);
    
    if (!milestone) {
      return res.status(404).json({
        success: false,
        error: 'Milestone not found',
      });
    }
    
    // Verify the milestone's project belongs to the user
    const project = await projectService.getProjectById(milestone.projectId, userId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or does not belong to user',
      });
    }
    
    const success = await milestoneService.deleteMilestone(milestoneId);
    
    return res.json({
      success: true,
      message: 'Milestone deleted successfully',
    });
  } catch (error) {
    console.error('Delete milestone error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error deleting milestone',
    });
  }
};

// Update milestone progress
export const updateMilestoneProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const milestoneId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }
    
    if (isNaN(milestoneId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid milestone ID',
      });
    }
    
    // Get the milestone to verify ownership
    const milestone = await milestoneService.getMilestoneById(milestoneId);
    
    if (!milestone) {
      return res.status(404).json({
        success: false,
        error: 'Milestone not found',
      });
    }
    
    // Verify the milestone's project belongs to the user
    const project = await projectService.getProjectById(milestone.projectId, userId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or does not belong to user',
      });
    }
    
    const updatedMilestone = await milestoneService.updateMilestoneProgress(milestoneId);
    
    return res.json({
      success: true,
      data: updatedMilestone,
    });
  } catch (error) {
    console.error('Update milestone progress error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error updating milestone progress',
    });
  }
};
