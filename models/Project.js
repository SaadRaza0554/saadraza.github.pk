const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  longDescription: {
    type: String,
    trim: true,
    maxlength: [2000, 'Long description cannot exceed 2000 characters']
  },
  technologies: [{
    type: String,
    trim: true,
    maxlength: [50, 'Technology name cannot exceed 50 characters']
  }],
  category: {
    type: String,
    required: [true, 'Project category is required'],
    enum: ['web', 'mobile', 'desktop', 'ai', 'data', 'other'],
    default: 'web'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'maintenance', 'archived'],
    default: 'completed'
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: 'Project image'
    },
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  links: {
    github: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.*/, 'GitHub URL must be a valid HTTP/HTTPS URL']
    },
    live: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.*/, 'Live URL must be a valid HTTP/HTTPS URL']
    },
    demo: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.*/, 'Demo URL must be a valid HTTP/HTTPS URL']
    }
  },
  features: [{
    type: String,
    trim: true,
    maxlength: [200, 'Feature description cannot exceed 200 characters']
  }],
  challenges: [{
    type: String,
    trim: true,
    maxlength: [300, 'Challenge description cannot exceed 300 characters']
  }],
  solutions: [{
    type: String,
    trim: true,
    maxlength: [300, 'Solution description cannot exceed 300 characters']
  }],
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative']
  },
  teamSize: {
    type: Number,
    min: [1, 'Team size must be at least 1'],
    default: 1
  },
  client: {
    type: String,
    trim: true,
    maxlength: [100, 'Client name cannot exceed 100 characters']
  },
  budget: {
    type: String,
    enum: ['under-5k', '5k-10k', '10k-25k', '25k-50k', '50k+', 'not-disclosed'],
    default: 'not-disclosed'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
projectSchema.index({ title: 'text', description: 'text', longDescription: 'text' });
projectSchema.index({ category: 1, status: 1, isFeatured: 1 });
projectSchema.index({ technologies: 1 });
projectSchema.index({ tags: 1 });
projectSchema.index({ isPublic: 1, createdAt: -1 });

// Virtual for project duration
projectSchema.virtual('duration').get(function() {
  if (!this.startDate) return null;
  
  const end = this.endDate || new Date();
  const start = this.startDate;
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) return `${diffDays} days`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
  return `${Math.floor(diffDays / 365)} years`;
});

// Virtual for project status display
projectSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'planning': 'Planning',
    'in-progress': 'In Progress',
    'completed': 'Completed',
    'maintenance': 'Maintenance',
    'archived': 'Archived'
  };
  return statusMap[this.status] || this.status;
});

// Method to increment views
projectSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to toggle like
projectSchema.methods.toggleLike = function() {
  this.likes += 1;
  return this.save();
};

// Static method to get featured projects
projectSchema.statics.getFeatured = function(limit = 6) {
  return this.find({ isFeatured: true, isPublic: true })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get projects by category
projectSchema.statics.getByCategory = function(category, limit = 10) {
  return this.find({ category, isPublic: true })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to search projects
projectSchema.statics.search = function(query, limit = 10) {
  return this.find({
    $text: { $search: query },
    isPublic: true
  })
  .sort({ score: { $meta: 'textScore' } })
  .limit(limit);
};

module.exports = mongoose.model('Project', projectSchema);
