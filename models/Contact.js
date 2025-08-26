const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    isSpam: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied', 'archived'],
      default: 'new',
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      default: '',
    },
    repliedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Instance method to mark as read
ContactSchema.methods.markAsRead = async function markAsRead() {
  if (this.status === 'new') {
    this.status = 'read';
    await this.save();
  }
  return this;
};

// Static method to get stats
ContactSchema.statics.getStats = async function getStats() {
  const results = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const statsByStatus = results.reduce((acc, cur) => {
    acc[cur._id] = cur.count;
    return acc;
  }, {});

  const total = await this.estimatedDocumentCount();

  return {
    total,
    new: statsByStatus.new || 0,
    read: statsByStatus.read || 0,
    replied: statsByStatus.replied || 0,
    archived: statsByStatus.archived || 0,
  };
};

module.exports = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);


