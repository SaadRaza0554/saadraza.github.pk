const mongoose = require('mongoose');

const CertificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    date: { type: Date },
    expiryDate: { type: Date },
    credentialId: { type: String },
  },
  { _id: false }
);

const LearningResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['article', 'video', 'course', 'book', 'other'], default: 'other' },
  },
  { _id: false }
);

const SkillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, index: true },
    category: {
      type: String,
      enum: ['frontend', 'backend', 'database', 'devops', 'design', 'mobile', 'ai', 'other'],
      required: true,
      index: true,
    },
    proficiency: { type: Number, required: true, min: 1, max: 10 },
    yearsOfExperience: { type: Number, default: 0 },
    description: { type: String, trim: true },
    icon: { type: String },
    color: { type: String },
    order: { type: Number, default: 0, index: true },
    tags: { type: [String], default: [] },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    certifications: { type: [CertificationSchema], default: [] },
    learningResources: { type: [LearningResourceSchema], default: [] },
  },
  { timestamps: true }
);

SkillSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Instance helpers
SkillSchema.methods.updateProficiency = async function updateProficiency(newValue) {
  this.proficiency = newValue;
  await this.save();
  return this.proficiency;
};

SkillSchema.methods.addCertification = async function addCertification(cert) {
  this.certifications.push(cert);
  await this.save();
  return this.certifications;
};

// Static helpers
SkillSchema.statics.getByCategory = function getByCategory(category) {
  return this.find({ isActive: true, category }).sort({ order: 1, name: 1 }).select('-__v');
};

SkillSchema.statics.getFeatured = function getFeatured(limit) {
  return this.find({ isActive: true, isFeatured: true }).sort({ order: 1 }).limit(limit).select('-__v');
};

SkillSchema.statics.getTopSkills = function getTopSkills(limit) {
  return this.find({ isActive: true }).sort({ proficiency: -1, yearsOfExperience: -1 }).limit(limit).select('-__v');
};

SkillSchema.statics.search = function search(query, limit) {
  return this.find({ $text: { $search: query }, isActive: true }).limit(limit).select('-__v');
};

module.exports = mongoose.models.Skill || mongoose.model('Skill', SkillSchema);


