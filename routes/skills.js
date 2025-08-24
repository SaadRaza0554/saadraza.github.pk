const express = require('express');
const { body, validationResult } = require('express-validator');
const Skill = require('../models/Skill');
const { auth, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateSkill = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Skill name must be between 2 and 50 characters'),
  
  body('category')
    .isIn(['frontend', 'backend', 'database', 'devops', 'design', 'mobile', 'ai', 'other'])
    .withMessage('Invalid skill category'),
  
  body('proficiency')
    .isInt({ min: 1, max: 10 })
    .withMessage('Proficiency must be between 1 and 10'),
  
  body('yearsOfExperience')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Years of experience must be a non-negative integer'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Description cannot exceed 300 characters'),
  
  body('icon')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Icon must be between 1 and 100 characters'),
  
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color'),
  
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters')
];

// Get all active skills (public)
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      featured, 
      search,
      sortBy = 'order',
      sortOrder = 'asc'
    } = req.query;

    const query = { isActive: true };
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Filter featured skills
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skills = await Skill.find(query)
      .sort(sortOptions)
      .select('-__v');

    res.json({
      success: true,
      data: skills
    });

  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skills'
    });
  }
});

// Get skills by category (public)
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!['frontend', 'backend', 'database', 'devops', 'design', 'mobile', 'ai', 'other'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }
    
    const skills = await Skill.getByCategory(category);
    
    res.json({
      success: true,
      data: skills
    });

  } catch (error) {
    console.error('Get skills by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skills by category'
    });
  }
});

// Get featured skills (public)
router.get('/featured', async (req, res) => {
  try {
    const { limit = 12 } = req.query;
    
    const skills = await Skill.getFeatured(parseInt(limit));
    
    res.json({
      success: true,
      data: skills
    });

  } catch (error) {
    console.error('Get featured skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured skills'
    });
  }
});

// Get top skills (public)
router.get('/top', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const skills = await Skill.getTopSkills(parseInt(limit));
    
    res.json({
      success: true,
      data: skills
    });

  } catch (error) {
    console.error('Get top skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top skills'
    });
  }
});

// Search skills (public)
router.get('/search', async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }
    
    const skills = await Skill.search(query.trim(), parseInt(limit));
    
    res.json({
      success: true,
      data: skills,
      query: query.trim()
    });

  } catch (error) {
    console.error('Search skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search skills'
    });
  }
});

// Get single skill (public)
router.get('/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }
    
    if (!skill.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    res.json({
      success: true,
      data: skill
    });

  } catch (error) {
    console.error('Get skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skill'
    });
  }
});

// Create new skill (admin only)
router.post('/', auth, requirePermission('manage_skills'), validateSkill, async (req, res) => {
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

    const skillData = req.body;
    
    // Check if skill name already exists
    const existingSkill = await Skill.findOne({ name: skillData.name });
    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'Skill with this name already exists'
      });
    }
    
    const skill = new Skill(skillData);
    await skill.save();

    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data: skill
    });

  } catch (error) {
    console.error('Create skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create skill'
    });
  }
});

// Update skill (admin only)
router.put('/:id', auth, requirePermission('manage_skills'), validateSkill, async (req, res) => {
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

    const skill = await Skill.findById(req.params.id);
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Check if name is being changed and if it conflicts with existing skill
    if (req.body.name && req.body.name !== skill.name) {
      const existingSkill = await Skill.findOne({ name: req.body.name });
      if (existingSkill) {
        return res.status(400).json({
          success: false,
          message: 'Skill with this name already exists'
        });
      }
    }

    // Update skill fields
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== '__v') {
        skill[key] = req.body[key];
      }
    });

    await skill.save();

    res.json({
      success: true,
      message: 'Skill updated successfully',
      data: skill
    });

  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update skill'
    });
  }
});

// Partial update skill (admin only)
router.patch('/:id', auth, requirePermission('manage_skills'), async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Check if name is being changed and if it conflicts with existing skill
    if (req.body.name && req.body.name !== skill.name) {
      const existingSkill = await Skill.findOne({ name: req.body.name });
      if (existingSkill) {
        return res.status(400).json({
          success: false,
          message: 'Skill with this name already exists'
        });
      }
    }

    // Update only provided fields
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== '__v') {
        skill[key] = req.body[key];
      }
    });

    await skill.save();

    res.json({
      success: true,
      message: 'Skill updated successfully',
      data: skill
    });

  } catch (error) {
    console.error('Patch skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update skill'
    });
  }
});

// Update skill proficiency (admin only)
router.patch('/:id/proficiency', auth, requirePermission('manage_skills'), async (req, res) => {
  try {
    const { proficiency } = req.body;
    
    if (!proficiency || proficiency < 1 || proficiency > 10) {
      return res.status(400).json({
        success: false,
        message: 'Proficiency must be between 1 and 10'
      });
    }

    const skill = await Skill.findById(req.params.id);
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    await skill.updateProficiency(proficiency);

    res.json({
      success: true,
      message: 'Skill proficiency updated successfully',
      data: skill
    });

  } catch (error) {
    console.error('Update skill proficiency error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update skill proficiency'
    });
  }
});

// Add certification to skill (admin only)
router.post('/:id/certifications', auth, requirePermission('manage_skills'), async (req, res) => {
  try {
    const { name, issuer, date, expiryDate, credentialId } = req.body;
    
    if (!name || !issuer) {
      return res.status(400).json({
        success: false,
        message: 'Certification name and issuer are required'
      });
    }

    const skill = await Skill.findById(req.params.id);
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    const certData = {
      name,
      issuer,
      date: date ? new Date(date) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      credentialId
    };

    await skill.addCertification(certData);

    res.json({
      success: true,
      message: 'Certification added successfully',
      data: skill
    });

  } catch (error) {
    console.error('Add certification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add certification'
    });
  }
});

// Add learning resource to skill (admin only)
router.post('/:id/resources', auth, requirePermission('manage_skills'), async (req, res) => {
  try {
    const { title, url, type = 'other' } = req.body;
    
    if (!title || !url) {
      return res.status(400).json({
        success: false,
        message: 'Resource title and URL are required'
      });
    }

    const skill = await Skill.findById(req.params.id);
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    skill.learningResources.push({
      title,
      url,
      type
    });

    await skill.save();

    res.json({
      success: true,
      message: 'Learning resource added successfully',
      data: skill
    });

  } catch (error) {
    console.error('Add learning resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add learning resource'
    });
  }
});

// Toggle skill featured status (admin only)
router.patch('/:id/featured', auth, requirePermission('manage_skills'), async (req, res) => {
  try {
    const { isFeatured } = req.body;
    
    if (typeof isFeatured !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isFeatured must be a boolean value'
      });
    }

    const skill = await Skill.findById(req.params.id);
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    skill.isFeatured = isFeatured;
    await skill.save();

    res.json({
      success: true,
      message: `Skill ${isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data: skill
    });

  } catch (error) {
    console.error('Toggle skill featured status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle skill featured status'
    });
  }
});

// Delete skill (admin only)
router.delete('/:id', auth, requirePermission('manage_skills'), async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Check if skill is referenced by any projects
    const projectCount = await require('../models/Project').countDocuments({
      technologies: skill.name
    });

    if (projectCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete skill. It is referenced by ${projectCount} project(s).`
      });
    }

    await Skill.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Skill deleted successfully'
    });

  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete skill'
    });
  }
});

// Get skill statistics (admin only)
router.get('/stats/overview', auth, requirePermission('manage_skills'), async (req, res) => {
  try {
    const stats = await Skill.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          featured: { $sum: { $cond: ['$isFeatured', 1, 0] } },
          avgProficiency: { $avg: '$proficiency' },
          totalExperience: { $sum: '$yearsOfExperience' }
        }
      }
    ]);

    const categoryStats = await Skill.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgProficiency: { $avg: '$proficiency' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const proficiencyStats = await Skill.aggregate([
      {
        $group: {
          _id: '$proficiency',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const recentSkills = await Skill.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name category proficiency isActive createdAt');

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          total: 0,
          active: 0,
          featured: 0,
          avgProficiency: 0,
          totalExperience: 0
        },
        categories: categoryStats,
        proficiency: proficiencyStats,
        recent: recentSkills
      }
    });

  } catch (error) {
    console.error('Get skill stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skill statistics'
    });
  }
});

module.exports = router;
