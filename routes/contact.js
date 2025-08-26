const express = require('express');
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const sendEmail = require('../utils/email');
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for contact form submissions
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 contact submissions per windowMs
  message: 'Too many contact form submissions from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const validateContact = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters')
];

// Spam detection middleware
const detectSpam = (req, res, next) => {
  const { message, name, email } = req.body;
  
  // Simple spam detection rules
  const spamIndicators = [
    /buy\s+now/i,
    /click\s+here/i,
    /free\s+offer/i,
    /limited\s+time/i,
    /act\s+now/i,
    /urgent/i,
    /viagra/i,
    /casino/i,
    /loan/i,
    /credit/i
  ];
  
  const isSpam = spamIndicators.some(pattern => 
    pattern.test(message) || pattern.test(name) || pattern.test(email)
  );
  
  if (isSpam) {
    req.body.isSpam = true;
  }
  
  next();
};

// Submit contact form (public)
router.post('/submit', contactLimiter, validateContact, detectSpam, async (req, res) => {
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

    const { name, email, subject, message } = req.body;
    
    // Create contact record
    const contact = new Contact({
      name,
      email,
      subject,
      message,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      isSpam: req.body.isSpam || false
    });

    await contact.save();

    // Send notification email to admin
    try {
      await sendEmail({
        to: process.env.EMAIL_FROM,
        subject: `New Contact Form Submission: ${subject}`,
        template: 'contact-notification',
        context: {
          contact,
          adminUrl: `${process.env.FRONTEND_URL}/admin/contacts/${contact._id}`
        }
      });
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
      // Don't fail the request if email fails
    }

    // Send confirmation email to user
    try {
      await sendEmail({
        to: email,
        subject: 'Thank you for your message',
        template: 'contact-confirmation',
        context: { name, subject }
      });
    } catch (emailError) {
      console.error('Failed to send user confirmation:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your message! I\'ll get back to you soon.',
      data: {
        id: contact._id,
        submittedAt: contact.createdAt
      }
    });

  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form. Please try again later.'
    });
  }
});

// Get all contacts (admin only)
router.get('/', auth, async (req, res) => {
  try {
    // Check if user has permission to manage contacts
    if (!req.user.hasPermission('manage_contacts')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    const { 
      page = 1, 
      limit = 20, 
      status, 
      isSpam, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Filter by spam
    if (isSpam !== undefined) {
      query.isSpam = isSpam === 'true';
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const contacts = await Contact.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts'
    });
  }
});

// Get contact statistics (admin only)
router.get('/stats', auth, async (req, res) => {
  try {
    if (!req.user.hasPermission('manage_contacts')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    const stats = await Contact.getStats();
    
    // Get recent activity
    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email subject status createdAt');

    res.json({
      success: true,
      data: {
        stats,
        recentContacts
      }
    });

  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact statistics'
    });
  }
});

// Get single contact (admin only)
router.get('/:id', auth, async (req, res) => {
  try {
    if (!req.user.hasPermission('manage_contacts')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Mark as read if status is 'new'
    if (contact.status === 'new') {
      await contact.markAsRead();
    }

    res.json({
      success: true,
      data: contact
    });

  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact'
    });
  }
});

// Update contact status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (!req.user.hasPermission('manage_contacts')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    const { status, adminNotes } = req.body;
    
    if (!['new', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    contact.status = status;
    if (adminNotes !== undefined) {
      contact.adminNotes = adminNotes;
    }

    if (status === 'replied') {
      contact.repliedAt = new Date();
    }

    await contact.save();

    res.json({
      success: true,
      message: 'Contact status updated successfully',
      data: contact
    });

  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact status'
    });
  }
});

// Mark contact as spam/not spam (admin only)
router.patch('/:id/spam', auth, async (req, res) => {
  try {
    if (!req.user.hasPermission('manage_contacts')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    const { isSpam } = req.body;
    
    if (typeof isSpam !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isSpam must be a boolean value'
      });
    }

    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    contact.isSpam = isSpam;
    await contact.save();

    res.json({
      success: true,
      message: `Contact marked as ${isSpam ? 'spam' : 'not spam'} successfully`,
      data: contact
    });

  } catch (error) {
    console.error('Update contact spam status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact spam status'
    });
  }
});

// Delete contact (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!req.user.hasPermission('manage_contacts')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    const contact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });

  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact'
    });
  }
});

module.exports = router;
