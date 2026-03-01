const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define Settings Schema
const SettingsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  pushNotifications: {
    type: Boolean,
    default: true
  },
  checkInReminders: {
    type: Boolean,
    default: true
  },
  checkInTime: {
    type: String,
    enum: ['morning', 'evening'],
    default: 'evening'
  },
  hapticFeedback: {
    type: Boolean,
    default: true
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  }
}, {
  timestamps: true
});

// Create and export the model
module.exports = mongoose.model('Settings', SettingsSchema); 