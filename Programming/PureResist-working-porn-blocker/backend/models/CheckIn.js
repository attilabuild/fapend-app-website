const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define CheckIn Schema
const checkInSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  mood: {
    type: String,
    enum: ['great', 'good', 'neutral', 'bad', 'terrible'],
    required: true
  },
  urgeLevel: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  succeeded: {
    type: Boolean,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  triggers: {
    type: [String],
    default: []
  },
  activities: {
    type: [String],
    default: []
  },
  dayNumber: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Create and export the model
module.exports = mongoose.model('CheckIn', checkInSchema); 