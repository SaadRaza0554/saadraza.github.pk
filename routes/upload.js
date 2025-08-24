const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create subdirectories based on file type
    let subDir = 'general';
    
    if (file.fieldname === 'project') {
      subDir = 'projects';
    } else if (file.fieldname === 'skill') {
      subDir = 'skills';
    } else if (file.fieldname === 'profile') {
      subDir = 'profile';
    } else if (file.fieldname === 'avatar') {
      subDir = 'avatars';
    }
    
    const fullPath = path.join(uploadsDir, subDir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    
    // Sanitize filename
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${allowedTypes.join(', ')} are allowed.`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 10 // Maximum 10 files per request
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum file size is 5MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed per request.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field in file upload.'
      });
    }
  }
  
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next(err);
};

// Upload single file
router.post('/single', auth, requirePermission('upload_files'), upload.single('file'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Generate public URL
    const publicUrl = `/uploads/${path.relative(uploadsDir, req.file.path).replace(/\\/g, '/')}`;
    
    // Get file info
    const fileInfo = {
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: publicUrl,
      uploadedAt: new Date()
    };

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: fileInfo
    });

  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file'
    });
  }
});

// Upload multiple files
router.post('/multiple', auth, requirePermission('upload_files'), upload.array('files', 10), handleMulterError, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = req.files.map(file => {
      const publicUrl = `/uploads/${path.relative(uploadsDir, file.path).replace(/\\/g, '/')}`;
      
      return {
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        url: publicUrl,
        uploadedAt: new Date()
      };
    });

    res.json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      data: uploadedFiles
    });

  } catch (error) {
    console.error('Multiple file upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload files'
    });
  }
});

// Upload project images
router.post('/project', auth, requirePermission('upload_files'), upload.array('images', 5), handleMulterError, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    const uploadedImages = req.files.map((file, index) => {
      const publicUrl = `/uploads/${path.relative(uploadsDir, file.path).replace(/\\/g, '/')}`;
      
      return {
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        url: publicUrl,
        isMain: index === 0, // First image is main by default
        uploadedAt: new Date()
      };
    });

    res.json({
      success: true,
      message: `${uploadedImages.length} project image(s) uploaded successfully`,
      data: uploadedImages
    });

  } catch (error) {
    console.error('Project image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload project images'
    });
  }
});

// Upload profile/avatar image
router.post('/profile', auth, requirePermission('upload_files'), upload.single('avatar'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image uploaded'
      });
    }

    // Validate file type for profile images
    const allowedProfileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedProfileTypes.includes(req.file.mimetype)) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      
      return res.status(400).json({
        success: false,
        message: 'Profile images must be JPEG, PNG, or WebP format'
      });
    }

    const publicUrl = `/uploads/${path.relative(uploadsDir, req.file.path).replace(/\\/g, '/')}`;
    
    const imageInfo = {
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: publicUrl,
      uploadedAt: new Date()
    };

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: imageInfo
    });

  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile image'
    });
  }
});

// Delete uploaded file
router.delete('/:filename', auth, requirePermission('upload_files'), async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Filename is required'
      });
    }

    // Find file in uploads directory
    let filePath = null;
    let found = false;
    
    // Search through subdirectories
    const subDirs = ['projects', 'skills', 'profile', 'avatars', 'general'];
    
    for (const subDir of subDirs) {
      const testPath = path.join(uploadsDir, subDir, filename);
      if (fs.existsSync(testPath)) {
        filePath = testPath;
        found = true;
        break;
      }
    }
    
    if (!found) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete file
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    });
  }
});

// Get file information
router.get('/info/:filename', auth, requirePermission('upload_files'), async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Filename is required'
      });
    }

    // Find file in uploads directory
    let filePath = null;
    let found = false;
    let subDir = '';
    
    // Search through subdirectories
    const subDirs = ['projects', 'skills', 'profile', 'avatars', 'general'];
    
    for (const dir of subDirs) {
      const testPath = path.join(uploadsDir, dir, filename);
      if (fs.existsSync(testPath)) {
        filePath = testPath;
        subDir = dir;
        found = true;
        break;
      }
    }
    
    if (!found) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const publicUrl = `/uploads/${subDir}/${filename}`;
    
    const fileInfo = {
      filename,
      originalName: filename, // We don't store original names separately
      mimetype: getMimeType(filename),
      size: stats.size,
      path: filePath,
      url: publicUrl,
      uploadedAt: stats.birthtime,
      modifiedAt: stats.mtime
    };

    res.json({
      success: true,
      data: fileInfo
    });

  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get file information'
    });
  }
});

// List uploaded files
router.get('/list', auth, requirePermission('upload_files'), async (req, res) => {
  try {
    const { directory = 'all', page = 1, limit = 20 } = req.query;
    
    let files = [];
    let totalFiles = 0;
    
    if (directory === 'all') {
      // List files from all directories
      const subDirs = ['projects', 'skills', 'profile', 'avatars', 'general'];
      
      for (const subDir of subDirs) {
        const dirPath = path.join(uploadsDir, subDir);
        if (fs.existsSync(dirPath)) {
          const dirFiles = fs.readdirSync(dirPath)
            .filter(file => {
              const filePath = path.join(dirPath, file);
              return fs.statSync(filePath).isFile();
            })
            .map(file => {
              const filePath = path.join(dirPath, file);
              const stats = fs.statSync(filePath);
              const publicUrl = `/uploads/${subDir}/${file}`;
              
              return {
                filename: file,
                directory: subDir,
                mimetype: getMimeType(file),
                size: stats.size,
                url: publicUrl,
                uploadedAt: stats.birthtime,
                modifiedAt: stats.mtime
              };
            });
          
          files.push(...dirFiles);
        }
      }
    } else {
      // List files from specific directory
      const dirPath = path.join(uploadsDir, directory);
      if (fs.existsSync(dirPath)) {
        files = fs.readdirSync(dirPath)
          .filter(file => {
            const filePath = path.join(dirPath, file);
            return fs.statSync(filePath).isFile();
          })
          .map(file => {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            const publicUrl = `/uploads/${directory}/${file}`;
            
            return {
              filename: file,
              directory,
              mimetype: getMimeType(file),
              size: stats.size,
              url: publicUrl,
              uploadedAt: stats.birthtime,
              modifiedAt: stats.mtime
            };
          });
      }
    }
    
    // Sort by upload date (newest first)
    files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    
    totalFiles = files.length;
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFiles = files.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedFiles,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalFiles / limit),
        totalItems: totalFiles,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list files'
    });
  }
});

// Helper function to get MIME type from filename
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

module.exports = router;
