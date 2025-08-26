const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema(
  {
    github: { type: String },
    live: { type: String },
    demo: { type: String },
  },
  { _id: false }
);

const ImageSchema = new mongoose.Schema(
  {
    originalName: String,
    filename: String,
    mimetype: String,
    size: Number,
    path: String,
    url: String,
    isMain: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    longDescription: { type: String, trim: true },
    technologies: { type: [String], required: true, index: true },
    category: {
      type: String,
      enum: ['web', 'mobile', 'desktop', 'ai', 'data', 'other'],
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate',
      index: true,
    },
    status: {
      type: String,
      enum: ['planning', 'in-progress', 'completed', 'maintenance', 'archived'],
      default: 'completed',
      index: true,
    },
    links: { type: LinkSchema, default: {} },
    estimatedHours: { type: Number },
    teamSize: { type: Number },
    budget: {
      type: String,
      enum: ['under-5k', '5k-10k', '10k-25k', '25k-50k', '50k+', 'not-disclosed'],
    },
    images: { type: [ImageSchema], default: [] },
    startDate: { type: Date },
    endDate: { type: Date },
    isPublic: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index for search
ProjectSchema.index({ title: 'text', description: 'text', longDescription: 'text', technologies: 'text' });

// Instance methods
ProjectSchema.methods.incrementViews = async function incrementViews() {
  this.views += 1;
  await this.save();
  return this.views;
};

ProjectSchema.methods.toggleLike = async function toggleLike() {
  this.likes += 1;
  await this.save();
  return this.likes;
};

// Static helpers used by routes
ProjectSchema.statics.getFeatured = function getFeatured(limit) {
  return this.find({ isPublic: true, isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-__v');
};

ProjectSchema.statics.getByCategory = function getByCategory(category, limit) {
  return this.find({ isPublic: true, category })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-__v');
};

ProjectSchema.statics.search = function search(query, limit) {
  return this.find({ $text: { $search: query }, isPublic: true })
    .limit(limit)
    .select('-__v');
};

module.exports = mongoose.models.Project || mongoose.model('Project', ProjectSchema);


