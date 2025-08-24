const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
    unique: true,
    maxlength: [50, 'Skill name cannot exceed 50 characters']
  },
  category: {
    type: String,
    required: [true, 'Skill category is required'],
    enum: ['frontend', 'backend', 'database', 'devops', 'design', 'mobile', 'ai', 'other'],
    default: 'other'
  },
  proficiency: {
    type: Number,
    required: [true, 'Proficiency level is required'],
    min: [1, 'Proficiency must be at least 1'],
    max: [10, 'Proficiency cannot exceed 10']
  },
  yearsOfExperience: {
    type: Number,
    min: [0, 'Years of experience cannot be negative'],
    default: 0
  },
  description: {
    type: String,
    trim: true,
    maxlength: [300, 'Description cannot exceed 300 characters']
  },
  icon: {
    type: String,
    trim: true,
    default: 'fas fa-code'
  },
  color: {
    type: String,
    trim: true,
    default: '#3b82f6',
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  relatedSkills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  certifications: [{
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Certification name cannot exceed 100 characters']
    },
    issuer: {
      type: String,
      trim: true,
      maxlength: [100, 'Issuer name cannot exceed 100 characters']
    },
    date: {
      type: Date
    },
    expiryDate: {
      type: Date
    },
    credentialId: {
      type: String,
      trim: true,
      maxlength: [100, 'Credential ID cannot exceed 100 characters']
    }
  }],
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  learningResources: [{
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Resource title cannot exceed 200 characters']
    },
    url: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.*/, 'URL must be a valid HTTP/HTTPS URL']
    },
    type: {
      type: String,
      enum: ['documentation', 'tutorial', 'course', 'book', 'video', 'other'],
      default: 'other'
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
skillSchema.index({ category: 1, proficiency: -1, isActive: 1 });
skillSchema.index({ isFeatured: 1, order: 1 });
skillSchema.index({ name: 'text', description: 'text' });
skillSchema.index({ tags: 1 });

// Virtual for proficiency percentage
skillSchema.virtual('proficiencyPercentage').get(function() {
  return (this.proficiency / 10) * 100;
});

// Virtual for proficiency level text
skillSchema.virtual('proficiencyLevel').get(function() {
  if (this.proficiency <= 2) return 'Beginner';
  if (this.proficiency <= 4) return 'Elementary';
  if (this.proficiency <= 6) return 'Intermediate';
  if (this.proficiency <= 8) return 'Advanced';
  return 'Expert';
});

// Virtual for experience display
skillSchema.virtual('experienceDisplay').get(function() {
  if (this.yearsOfExperience === 0) return 'Learning';
  if (this.yearsOfExperience === 1) return '1 year';
  return `${this.yearsOfExperience} years`;
});

// Method to update proficiency
skillSchema.methods.updateProficiency = function(newLevel) {
  if (newLevel >= 1 && newLevel <= 10) {
    this.proficiency = newLevel;
    return this.save();
  }
  throw new Error('Proficiency level must be between 1 and 10');
};

// Method to add certification
skillSchema.methods.addCertification = function(certData) {
  this.certifications.push(certData);
  return this.save();
};

// Method to add project
skillSchema.methods.addProject = function(projectId) {
  if (!this.projects.includes(projectId)) {
    this.projects.push(projectId);
    return this.save();
  }
  return this;
};

// Static method to get skills by category
skillSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true })
    .sort({ proficiency: -1, order: 1 });
};

// Static method to get featured skills
skillSchema.statics.getFeatured = function(limit = 12) {
  return this.find({ isFeatured: true, isActive: true })
    .sort({ order: 1, proficiency: -1 })
    .limit(limit);
};

// Static method to get top skills
skillSchema.statics.getTopSkills = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ proficiency: -1 })
    .limit(limit);
};

// Static method to search skills
skillSchema.statics.search = function(query, limit = 10) {
  return this.find({
    $text: { $search: query },
    isActive: true
  })
  .sort({ score: { $meta: 'textScore' } })
  .limit(limit);
};

module.exports = mongoose.model('Skill', skillSchema);
