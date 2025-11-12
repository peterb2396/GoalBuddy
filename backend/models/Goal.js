const mongoose = require('mongoose');

const SubItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['checkbox', 'progress'],
    required: true
  },
  // For checkbox type
  isChecked: {
    type: Boolean,
    default: false
  },
  // For progress type
  currentValue: {
    type: Number,
    default: 0
  },
  targetValue: {
    type: Number,
    default: 100
  },
  order: {
    type: Number,
    required: true
  }
});

const GoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['discrete', 'continuous'],
    required: true
  },
  // For continuous goals
  resetFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: null
  },
  lastResetDate: {
    type: Date,
    default: null
  },
  subItems: [SubItemSchema],
  isCompleted: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    required: true
  },
  color: {
    type: String,
    default: '#E8B4B8'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

GoalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Goal', GoalSchema);
