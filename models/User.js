const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, index: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['admin', 'editor', 'viewer', 'user'],
      default: 'user',
    },
    isActive: { type: Boolean, default: true },
    isLocked: { type: Boolean, default: false },
    permissions: { type: [String], default: ['manage_contacts'] },
    failedLoginAttempts: { type: Number, default: 0 },
    lastLoginAt: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    profile: {
      bio: { type: String, default: '' },
      avatarUrl: { type: String, default: '' },
      location: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      language: { type: String, default: 'en' },
      emailNotifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function hashPasswordIfModified(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
  const salt = await bcrypt.genSalt(rounds);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.setPassword = async function setPassword(newPlainPassword) {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
  const salt = await bcrypt.genSalt(rounds);
  this.password = await bcrypt.hash(newPlainPassword, salt);
};

UserSchema.methods.generateAuthToken = function generateAuthToken() {
  const payload = { id: this._id, role: this.role };
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

UserSchema.methods.hasPermission = function hasPermission(permission) {
  if (this.role === 'admin') return true;
  return this.permissions.includes(permission);
};

UserSchema.methods.incLoginAttempts = function incLoginAttempts() {
  this.failedLoginAttempts += 1;
  if (this.failedLoginAttempts >= 5) {
    this.isLocked = true;
  }
  return this.save();
};

UserSchema.methods.resetLoginAttempts = function resetLoginAttempts() {
  this.failedLoginAttempts = 0;
  this.isLocked = false;
  return this.save();
};

UserSchema.methods.updateLastLogin = function updateLastLogin() {
  this.lastLoginAt = new Date();
  return this.save();
};

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);


