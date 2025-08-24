const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const { auth, requirePermission } = require('../middleware/auth');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateProject = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  
  body('longDescription')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Long description cannot exceed 2000 characters'),
  
  body('technologies')
    .isArray({ min: 1 })
    .withMessage('At least one technology is required'),
  
  body('technologies.*')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Technology names must be between 1 and 50 characters'),
  
  body('category')
    .isIn(['web', 'mobile', 'desktop', 'ai', 'data', 'other'])
    .withMessage('Invalid project category'),
  
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid difficulty level'),
  
  body('status')
    .optional()
    .isIn(['planning', 'in-progress', 'completed', 'maintenance', 'archived'])
    .withMessage('Invalid project status'),
  
  body('links.github')
    .optional()
    .isURL()
    .withMessage('GitHub URL must be a valid URL'),
  
  body('links.live')
    .optional()
    .isURL()
    .withMessage('Live URL must be a valid URL'),
  
  body('links.demo')
    .optional()
    .isURL()
    .withMessage('Demo URL must be a valid URL'),
  
  body('estimatedHours')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Estimated hours must be a positive integer'),
  
  body('teamSize')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Team size must be at least 1'),
  
  body('budget')
    .optional()
    .isIn(['under-5k', '5k-10k', '10k-25k', '25k-50k', '50k+', 'not-disclosed'])
    .withMessage('Invalid budget range')
];

// Get all public projects (with optional authentication for personalization)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      difficulty, 
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured
    } = req.query;

    const query = { isPublic: true };
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Filter by difficulty
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Filter featured projects
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const projects = await Project.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await Project.countDocuments(query);

    // Increment view count for each project (if user is authenticated)
    if (req.user) {
      projects.forEach(project => {
        project.incrementViews().catch(console.error);
      });
    }

    res.json({
      success: true,
      data: projects,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects'
    });
  }
});

// Get featured projects (public)
router.get('/featured', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const projects = await Project.getFeatured(parseInt(limit));
    
    res.json({
      success: true,
      data: projects
    });

  } catch (error) {
    console.error('Get featured projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured projects'
    });
  }
});

// Get projects by category (public)
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10 } = req.query;
    
    if (!['web', 'mobile', 'desktop', 'ai', 'data', 'other'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }
    
    const projects = await Project.getByCategory(category, parseInt(limit));
    
    res.json({
      success: true,
      data: projects
    });

  } catch (error) {
    console.error('Get projects by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects by category'
    });
  }
});

// Search projects (public)
router.get('/search', async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }
    
    const projects = await Project.search(query.trim(), parseInt(limit));
    
    res.json({
      success: true,
      data: projects,
      query: query.trim()
    });

  } catch (error) {
    console.error('Search projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search projects'
    });
  }
});

// Get single project (public)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    if (!project.isPublic) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Increment view count if user is authenticated
    if (req.user) {
      await project.incrementViews();
    }

    res.json({
      success: true,
      data: project
    });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project'
    });
  }
});

// Create new project (admin only)
router.post('/', auth, requirePermission('manage_projects'), validateProject, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const projectData = req.body;
    
    // Set default values
    if (!projectData.startDate) {
      projectData.startDate = new Date();
    }
    
    const project = new Project(projectData);
    await project.save();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project'
    });
  }
});

// Update project (admin only)
router.put('/:id', auth, requirePermission('manage_projects'), validateProject, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Update project fields
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== '__v') {
        project[key] = req.body[key];
      }
    });

    await project.save();

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project'
    });
  }
});

// Partial update project (admin only)
router.patch('/:id', auth, requirePermission('manage_projects'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Update only provided fields
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== '__v') {
        project[key] = req.body[key];
      }
    });

    await project.save();

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });

  } catch (error) {
    console.error('Patch project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project'
    });
  }
});

// Toggle project like (authenticated users)
router.post('/:id/like', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    if (!project.isPublic) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    await project.toggleLike();

    res.json({
      success: true,
      message: 'Project liked successfully',
      data: {
        likes: project.likes
      }
    });

  } catch (error) {
    console.error('Like project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like project'
    });
  }
});

// Delete project (admin only)
router.delete('/:id', auth, requirePermission('manage_projects'), async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project'
    });
  }
});

// Get project statistics (admin only)
router.get('/stats/overview', auth, requirePermission('manage_projects'), async (req, res) => {
  try {
    const stats = await Project.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          public: { $sum: { $cond: ['$isPublic', 1, 0] } },
          private: { $sum: { $cond: ['$isPublic', 0, 1] } },
          featured: { $sum: { $cond: ['$isFeatured', 1, 0] } },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likes' }
        }
      }
    ]);

    const categoryStats = await Project.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const statusStats = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const recentProjects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category status createdAt views');

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          total: 0,
          public: 0,
          private: 0,
          featured: 0,
          totalViews: 0,
          totalLikes: 0
        },
        categories: categoryStats,
        statuses: statusStats,
        recent: recentProjects
      }
    });

  } catch (error) {
    console.error('Get project stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project statistics'
    });
  }
});

module.exports = router;
